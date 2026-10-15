import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdirSync, chmodSync, lstatSync, realpathSync } from "node:fs";
import { resolve, relative, dirname, join, sep } from "node:path";
import { CollaborationError, validateCollaborationState } from "./schema.ts";
import { assertSuggestionAppendOnly, reviewCollaborationSuggestion, recordSuggestionInteraction } from "./suggestions.ts";
import { historyLimit, summarizeBoardChanges, validateHistoryEntry, validateHistorySummary, type HistoryEntry, type HistoryChange } from "./history.ts";
import { invitationExpiry } from "./lifecycle.ts";
import type { CollaborationRole, CollaborationState } from "./schema.ts";

type Row = Record<string, unknown>;
type Query = (sql: string, values?: (string | number)[]) => Promise<Row[]>;
type Database = { transaction: <T>(fn: (query: Query) => Promise<T>) => Promise<T>; close: () => Promise<void> };
const tables = `CREATE TABLE IF NOT EXISTS collaboration_rooms (id TEXT PRIMARY KEY, revision INTEGER NOT NULL, state TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS collaboration_capabilities (id TEXT PRIMARY KEY, room_id TEXT NOT NULL REFERENCES collaboration_rooms(id), token_hash TEXT NOT NULL UNIQUE, role TEXT NOT NULL, revoked INTEGER NOT NULL DEFAULT 0, expires_at BIGINT);
CREATE TABLE IF NOT EXISTS collaboration_history (room_id TEXT NOT NULL REFERENCES collaboration_rooms(id), sequence INTEGER NOT NULL, revision INTEGER NOT NULL, summary TEXT NOT NULL, PRIMARY KEY (room_id, sequence));
CREATE TABLE IF NOT EXISTS collaboration_presence (room_id TEXT NOT NULL REFERENCES collaboration_rooms(id), capability_id TEXT NOT NULL REFERENCES collaboration_capabilities(id), lease_until BIGINT NOT NULL, PRIMARY KEY (room_id, capability_id));`;
const digest = (token: string) => createHash("sha256").update(token).digest("hex");
const capability = () => randomBytes(32).toString("base64url");

export function collaborationConfiguration(env = process.env) {
  if (env.COLLABORATION_ENABLED !== "true") return { configured: false, mode: "disabled" as const, message: "Live collaboration is disabled. Manual planning remains available." };
  if (env.COLLABORATION_DATABASE_URL) return { configured: true, mode: "postgres" as const, message: "Shared plans use the configured database." };
  if (env.VERCEL || env.AWS_LAMBDA_FUNCTION_NAME || env.FUNCTION_TARGET) return { configured: false, mode: "disabled" as const, message: "This deployment needs a durable Postgres database for collaboration." };
  return { configured: true, mode: "sqlite" as const, message: "Shared plans persist on this server's local disk. Use a persistent disk and one server, or configure Postgres." };
}

export async function openCollaborationStore(options: { sqlitePath?: string; postgresUrl?: string; now?: () => number } = {}) {
  const now = options.now ?? Date.now;
  let database: Database;
  if (options.postgresUrl) {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: options.postgresUrl, max: 5, connectionTimeoutMillis: 5000, statement_timeout: 10000, idle_in_transaction_session_timeout: 15000 });
    // Serialize schema migration across instances; ALTER is backwards compatible.
    const migration = await pool.connect();
    let migrationSucceeded = false;
    try {
      await migration.query("BEGIN");
      await migration.query("SELECT pg_advisory_xact_lock(734923801)");
      await migration.query(tables);
      await migration.query("ALTER TABLE collaboration_capabilities ADD COLUMN IF NOT EXISTS expires_at BIGINT");
      await migration.query("COMMIT");
      migrationSucceeded = true;
    } catch (error) { await migration.query("ROLLBACK"); throw error; }
    finally { migration.release(); if (!migrationSucceeded) await pool.end(); }
    database = {
      async transaction(fn) {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          const result = await fn(async (sql, values = []) => (await client.query(sql.replace(/\?/g, (() => { let i = 0; return () => `$${++i}`; })()), values)).rows as Row[]);
          await client.query("COMMIT"); return result;
        } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
      },
      async close() { await pool.end(); },
    };
  } else {
    const path = options.sqlitePath ?? resolve(process.cwd(), ".private/collaboration/rooms.sqlite");
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    const { DatabaseSync } = await import("node:sqlite");
    const sqlite = new DatabaseSync(path);
    chmodSync(path, 0o600);
    sqlite.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");
    try {
      sqlite.exec("BEGIN IMMEDIATE");
      sqlite.exec(tables);
      const columns = sqlite.prepare("PRAGMA table_info(collaboration_capabilities)").all();
      if (!columns.some(column => column.name === "expires_at")) sqlite.exec("ALTER TABLE collaboration_capabilities ADD COLUMN expires_at BIGINT");
      sqlite.exec("COMMIT");
    } catch (error) { sqlite.exec("ROLLBACK"); sqlite.close(); throw error; }
    // Serialize async transaction callbacks within a process; SQLite's write lock
    // coordinates other server processes using the same persistent file.
    let queue: Promise<unknown> = Promise.resolve();
    database = {
      transaction(fn) {
        const operation = queue.then(async () => {
          sqlite.exec("BEGIN IMMEDIATE");
          try {
            const result = await fn(async (sql, values = []) => {
              const statement = sqlite.prepare(sql);
              return /^\s*(SELECT|UPDATE[\s\S]*RETURNING|INSERT[\s\S]*RETURNING)/i.test(sql) ? statement.all(...values) as Row[] : (statement.run(...values), []);
            });
            sqlite.exec("COMMIT"); return result;
          } catch (error) { sqlite.exec("ROLLBACK"); throw error; }
        });
        queue = operation.catch(() => undefined); return operation;
      },
      async close() { await queue; sqlite.close(); },
    };
  }
  const lockRoom = async (q: Query, roomId: string) => {
    const rows = await q(`SELECT * FROM collaboration_rooms WHERE id = ?${options.postgresUrl ? " FOR UPDATE" : ""}`, [roomId]);
    if (!rows[0]) throw new CollaborationError(404, "Room unavailable.");
    return rows[0];
  };
  const resolveAccess = async (q: Query, roomId: string, token: string) => {
    const rows = await q("SELECT id, role FROM collaboration_capabilities WHERE room_id = ? AND token_hash = ? AND revoked = 0 AND (expires_at IS NULL OR expires_at > ?)", [roomId, digest(token), now()]);
    if (!rows[0]) throw new CollaborationError(403, "Room access denied, expired, or revoked.");
    return { id: String(rows[0].id), role: rows[0].role as CollaborationRole };
  };
  const authorize = async (q: Query, roomId: string, token: string): Promise<CollaborationRole> => (await resolveAccess(q, roomId, token)).role;
  const snapshot = (roomId: string, row: Row, role: CollaborationRole) => ({ roomId, role, revision: Number(row.revision), state: JSON.parse(String(row.state)) as CollaborationState });
  const requireRevision = (roomId: string, row: Row, role: CollaborationRole, revision: number) => {
    const latest = snapshot(roomId, row, role);
    if (!Number.isSafeInteger(revision) || revision < 1) throw new CollaborationError(400, "Invalid revision.");
    if (latest.revision !== revision) { const error = new CollaborationError(412, "The shared plan changed. Review the latest version first."); error.latest = latest; throw error; }
  };
  const appendHistory = async (q: Query, roomId: string, token: string, revision: number, action: HistoryEntry['action'], changes: HistoryChange[], capturedActor?: {id:string;role:CollaborationRole}) => {
    const access = capturedActor ?? await resolveAccess(q,roomId,token);
    const rows = await q("SELECT MAX(sequence) AS sequence FROM collaboration_history WHERE room_id = ?",[roomId]);
    const sequence = Number(rows[0]?.sequence ?? 0)+1;
    const entry = validateHistoryEntry({sequence,revision,at:new Date(now()).toISOString(),actor:{id:`access-${access.id}`,role:access.role},action,changes});
    await q("INSERT INTO collaboration_history(room_id,sequence,revision,summary) VALUES (?,?,?,?)",[roomId,sequence,revision,JSON.stringify(entry)]);
    await q("DELETE FROM collaboration_history WHERE room_id = ? AND sequence <= ?",[roomId,sequence-historyLimit]);
    // Recheck after every write; expiry denial rolls back the board and its summary together.
    if (!capturedActor) await resolveAccess(q,roomId,token);
  };
  return {
    close: database.close,
    async history(roomId: string, token: string) {
      return database.transaction(async q => {
        const row = await lockRoom(q,roomId);
        await resolveAccess(q,roomId,token);
        const rows = await q("SELECT summary FROM collaboration_history WHERE room_id = ? ORDER BY sequence DESC LIMIT 100",[roomId]);
        const entries = rows.reverse().map(item=>validateHistoryEntry(JSON.parse(String(item.summary))));
        await resolveAccess(q,roomId,token);
        return validateHistorySummary({revision:Number(row.revision),entries,retainedLimit:historyLimit,startsAtRevision:entries[0]?.revision??null});
      });
    },
    async create(input: unknown) {
      const state = validateCollaborationState(input), roomId = randomUUID(), ownerToken = capability();
      if (state.interactions?.votes.length || state.interactions?.comments.length) throw new CollaborationError(403, "Interaction history belongs to its original room and cannot be imported into a new room.");
      return database.transaction(async q => {
        await q("INSERT INTO collaboration_rooms(id, revision, state) VALUES (?, 1, ?)", [roomId, JSON.stringify(state)]);
        await q("INSERT INTO collaboration_capabilities(id, room_id, token_hash, role) VALUES (?, ?, ?, 'owner')", [randomUUID(), roomId, digest(ownerToken)]);
        return { roomId, ownerToken, revision: 1, state };
      });
    },
    async read(roomId: string, token: string) {
      return database.transaction(async q => {
        const row = await lockRoom(q, roomId), role = await authorize(q, roomId, token);
        const invites = role === "owner" ? (await q("SELECT id, role, revoked, expires_at FROM collaboration_capabilities WHERE room_id = ? AND role <> 'owner' ORDER BY id", [roomId])).map(invite => ({ inviteId: String(invite.id), role: invite.role as "editor" | "viewer", revoked: Number(invite.revoked) === 1, expiresAt: invite.expires_at == null ? null : new Date(Number(invite.expires_at)).toISOString(), expired: invite.expires_at != null && Number(invite.expires_at) <= now() })) : undefined;
        return { ...snapshot(roomId, row, role), ...(invites ? { invites } : {}) };
      });
    },
    /** Presence is an optional 30-second capability lease, never an identity or board revision. */
    async presence(roomId: string, token: string, present?: boolean) {
      if (present !== undefined && typeof present !== "boolean") throw new CollaborationError(400, "Choose whether to announce presence.");
      return database.transaction(async q => {
        const row = await lockRoom(q, roomId), access = await resolveAccess(q, roomId, token);
        const checkedAt = now();
        await q("DELETE FROM collaboration_presence WHERE room_id = ? AND (lease_until <= ? OR capability_id NOT IN (SELECT id FROM collaboration_capabilities WHERE room_id = ? AND revoked = 0 AND (expires_at IS NULL OR expires_at > ?)))", [roomId, checkedAt, roomId, checkedAt]);
        if (present === false) await q("DELETE FROM collaboration_presence WHERE room_id = ? AND capability_id = ?", [roomId, access.id]);
        if (present === true) await q("INSERT INTO collaboration_presence(room_id, capability_id, lease_until) VALUES (?, ?, ?) ON CONFLICT (room_id, capability_id) DO UPDATE SET lease_until = excluded.lease_until", [roomId, access.id, checkedAt + 30000]);
        const rows = await q("SELECT p.capability_id, c.role FROM collaboration_presence p JOIN collaboration_capabilities c ON c.id = p.capability_id AND c.room_id = p.room_id WHERE p.room_id = ? AND p.lease_until > ? AND c.revoked = 0 AND (c.expires_at IS NULL OR c.expires_at > ?) ORDER BY p.capability_id", [roomId, now(), now()]);
        // Time may cross capability expiry during cleanup, renewal or the summary query.
        // Reauthorize before returning so denial rolls back every lease mutation.
        await resolveAccess(q, roomId, token);
        return { revision: Number(row.revision), presence: rows.map(value => ({ id: `access-${value.capability_id}`, role: value.role as CollaborationRole })), leaseSeconds: 30 as const };
      });
    },
    async update(roomId: string, token: string, revision: number, input: unknown) {
      const state = validateCollaborationState(input);
      return database.transaction(async q => {
        const row = await lockRoom(q, roomId), role = await authorize(q, roomId, token);
        if (role === "viewer") throw new CollaborationError(403, "Viewers cannot edit this room.");
        const latest = snapshot(roomId, row, role);
        if (latest.revision !== revision) { const error = new CollaborationError(412, "The shared plan changed. Review the latest version before saving."); error.latest = latest; throw error; }
        if (role === "editor" && JSON.stringify([state.title, state.startDate, state.endDate, state.cities]) !== JSON.stringify([latest.state.title, latest.state.startDate, latest.state.endDate, latest.state.cities])) throw new CollaborationError(403, "Only the owner can change trip dates, title, or cities.");
        assertSuggestionAppendOnly(latest.state, state);
        const changed = await q("UPDATE collaboration_rooms SET revision = revision + 1, state = ? WHERE id = ? AND revision = ? AND EXISTS (SELECT 1 FROM collaboration_capabilities WHERE room_id = ? AND token_hash = ? AND revoked = 0 AND (expires_at IS NULL OR expires_at > ?) AND role IN ('owner', 'editor')) RETURNING revision", [JSON.stringify(state), roomId, revision, roomId, digest(token), now()]);
        if (!changed.length) throw new CollaborationError(412, "The shared plan changed. Reload before saving.");
        await appendHistory(q,roomId,token,Number(changed[0].revision),"board-update",summarizeBoardChanges(latest.state,state));
        return { roomId, role, revision: Number(changed[0].revision), state };
      });
    },
    async interactSuggestion(roomId: string, token: string, revision: number, suggestionId: unknown, action: unknown, value: unknown) {
      return database.transaction(async q => {
        const row = await lockRoom(q, roomId), access = await resolveAccess(q, roomId, token);
        if (access.role === "viewer") throw new CollaborationError(403, "Viewers cannot vote or comment.");
        requireRevision(roomId, row, access.role, revision);
        const actor = { id: `access-${access.id}`, role: access.role };
        const state = recordSuggestionInteraction(snapshot(roomId, row, access.role).state, actor, suggestionId, action, value, new Date(now()).toISOString(), randomUUID());
        const changed = await q("UPDATE collaboration_rooms SET revision = revision + 1, state = ? WHERE id = ? AND revision = ? AND EXISTS (SELECT 1 FROM collaboration_capabilities WHERE room_id = ? AND id = ? AND revoked = 0 AND (expires_at IS NULL OR expires_at > ?) AND role IN ('owner', 'editor')) RETURNING revision", [JSON.stringify(state), roomId, revision, roomId, access.id, now()]);
        if (!changed.length) throw new CollaborationError(412, "Room access or version changed. Reload before another action.");
        await appendHistory(q,roomId,token,Number(changed[0].revision),"proposal-interaction",summarizeBoardChanges(snapshot(roomId,row,access.role).state,state));
        return { roomId, role: access.role, revision: Number(changed[0].revision), state };
      });
    },
    async reviewSuggestion(roomId: string, token: string, revision: number, suggestionId: unknown, decision: unknown) {
      return database.transaction(async q => {
        const row = await lockRoom(q, roomId), role = await authorize(q, roomId, token);
        if (role !== "owner") throw new CollaborationError(403, "Only the owner can review suggestions.");
        requireRevision(roomId, row, role, revision);
        const state = reviewCollaborationSuggestion(snapshot(roomId, row, role).state, suggestionId, decision);
        const changed = await q("UPDATE collaboration_rooms SET revision = revision + 1, state = ? WHERE id = ? AND revision = ? AND EXISTS (SELECT 1 FROM collaboration_capabilities WHERE room_id = ? AND token_hash = ? AND revoked = 0 AND (expires_at IS NULL OR expires_at > ?) AND role = 'owner') RETURNING revision", [JSON.stringify(state), roomId, revision, roomId, digest(token), now()]);
        if (!changed.length) throw new CollaborationError(412, "The shared plan changed. Reload before reviewing.");
        await appendHistory(q,roomId,token,Number(changed[0].revision),"proposal-review",summarizeBoardChanges(snapshot(roomId,row,role).state,state));
        return { roomId, role, revision: Number(changed[0].revision), state };
      });
    },
    async invite(roomId: string, ownerToken: string, role: unknown, expiryInput?: unknown) {
      if (role !== "editor" && role !== "viewer") throw new CollaborationError(400, "Choose editor or viewer access.");
      return database.transaction(async q => {
        const row = await lockRoom(q, roomId);
        if (await authorize(q, roomId, ownerToken) !== "owner") throw new CollaborationError(403, "Only the owner can create invitations.");
        const expiresAt = invitationExpiry(expiryInput, now());
        const count = await q("SELECT COUNT(*) AS count FROM collaboration_capabilities WHERE room_id = ? AND revoked = 0 AND (expires_at IS NULL OR expires_at > ?)", [roomId, now()]);
        if (Number(count[0].count) >= 101) throw new CollaborationError(409, "Revoke an invitation before creating another.");
        const inviteId = randomUUID(), token = capability();
        await q("INSERT INTO collaboration_capabilities(id, room_id, token_hash, role, expires_at) VALUES (?, ?, ?, ?, ?)", [inviteId, roomId, digest(token), role, expiresAt]);
        await appendHistory(q,roomId,ownerToken,Number(row.revision),"invitation-created",[{category:"access",added:1,changed:0,removed:0}]);
        return { inviteId, token, role, expiresAt: new Date(expiresAt).toISOString() };
      });
    },
    async rotateOwner(roomId: string, ownerToken: string, revision: number) {
      return database.transaction(async q => {
        const row = await lockRoom(q, roomId), role = await authorize(q, roomId, ownerToken);
        if (role !== "owner") throw new CollaborationError(403, "Only the owner can replace owner access.");
        requireRevision(roomId, row, role, revision);
        const actor = await resolveAccess(q,roomId,ownerToken);
        const token = capability();
        await q("DELETE FROM collaboration_presence WHERE room_id = ? AND capability_id IN (SELECT id FROM collaboration_capabilities WHERE room_id = ? AND role = 'owner')", [roomId, roomId]);
        await q("UPDATE collaboration_capabilities SET revoked = 1 WHERE room_id = ? AND role = 'owner'", [roomId]);
        await q("INSERT INTO collaboration_capabilities(id, room_id, token_hash, role) VALUES (?, ?, ?, 'owner')", [randomUUID(), roomId, digest(token)]);
        await q("UPDATE collaboration_rooms SET revision = revision + 1 WHERE id = ? AND revision = ?", [roomId, revision]);
        await appendHistory(q,roomId,token,revision+1,"owner-rotated",[{category:"access",added:1,changed:0,removed:1}],actor);
        await resolveAccess(q,roomId,token);
        return { ownerToken: token, roomId, revision: revision + 1 };
      });
    },
    async deleteRoom(roomId: string, ownerToken: string, revision: number) {
      return database.transaction(async q => {
        const row = await lockRoom(q, roomId), role = await authorize(q, roomId, ownerToken);
        if (role !== "owner") throw new CollaborationError(403, "Only the owner can delete this room.");
        requireRevision(roomId, row, role, revision);
        // Explicit cascade works on existing schemas whose foreign key has no cascade.
        await q("DELETE FROM collaboration_history WHERE room_id = ?", [roomId]);
        await q("DELETE FROM collaboration_presence WHERE room_id = ?", [roomId]);
        await q("DELETE FROM collaboration_capabilities WHERE room_id = ?", [roomId]);
        await q("DELETE FROM collaboration_rooms WHERE id = ? AND revision = ?", [roomId, revision]);
        return { deleted: true };
      });
    },
    async revoke(roomId: string, ownerToken: string, inviteId: string) {
      return database.transaction(async q => {
        const row = await lockRoom(q, roomId);
        if (await authorize(q, roomId, ownerToken) !== "owner") throw new CollaborationError(403, "Only the owner can revoke invitations.");
        const revoked = await q("UPDATE collaboration_capabilities SET revoked = 1 WHERE id = ? AND room_id = ? AND role <> 'owner' AND revoked = 0 RETURNING id", [inviteId, roomId]);
        await q("DELETE FROM collaboration_presence WHERE room_id = ? AND capability_id IN (SELECT id FROM collaboration_capabilities WHERE id = ? AND room_id = ? AND revoked = 1)", [roomId, inviteId, roomId]);
        if(revoked.length) await appendHistory(q,roomId,ownerToken,Number(row.revision),"invitation-revoked",[{category:"access",added:0,changed:0,removed:1}]);
        return { revoked: true };
      });
    },
  };
}

let storePromise: ReturnType<typeof openCollaborationStore> | undefined;
export function confinedCollaborationSqlitePath(cwd: string, requested?: string) {
  const project = resolve(cwd), root = resolve(project, ".private/collaboration");
  const path = resolve(requested || join(root, "rooms.sqlite"));
  const child = relative(root, path);
  const denied = () => { throw new CollaborationError(503, "The collaboration database requires a regular private directory without symbolic links."); };
  if (!child || child === ".." || child.startsWith(`..${sep}`) || child.startsWith(sep)) return denied();
  let current = project;
  for (const segment of relative(project, dirname(path)).split(sep)) {
    current = join(current, segment);
    try { const stat = lstatSync(current); if (stat.isSymbolicLink() || !stat.isDirectory()) return denied(); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; mkdirSync(current, { mode: 0o700 }); }
    if (lstatSync(current).isSymbolicLink()) return denied();
  }
  const realProject = realpathSync(project);
  if (realpathSync(root) !== resolve(realProject, ".private/collaboration") || realpathSync(dirname(path)) !== resolve(realProject, relative(project, dirname(path)))) return denied();
  for (const file of [path, `${path}-wal`, `${path}-shm`]) {
    try { const stat = lstatSync(file); if (stat.isSymbolicLink() || !stat.isFile()) return denied(); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  }
  return path;
}
export function getCollaborationStore() {
  const config = collaborationConfiguration();
  if (!config.configured) throw new CollaborationError(503, config.message);
  if (!storePromise) {
    storePromise = openCollaborationStore(config.mode === "postgres" ? { postgresUrl: process.env.COLLABORATION_DATABASE_URL } : { sqlitePath: confinedCollaborationSqlitePath(process.cwd(), process.env.COLLABORATION_SQLITE_PATH) });
    storePromise.catch(() => { storePromise = undefined; });
  }
  return storePromise;
}
