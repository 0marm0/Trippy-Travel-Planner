import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { getMigrations } from 'better-auth/db/migration';
import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync, chmodSync, lstatSync } from 'node:fs';
import { dirname, resolve, parse } from 'node:path';
import { validateWorkspace, type GenericWorkspace } from '../generic-trip-workspace.ts';
import { accountConfiguration } from './config.ts';

export class AccountError extends Error { status: number; constructor(status: number, message: string) { super(message); this.status = status; } }
export const MAX_PRIVATE_PLANS = 20;
export const MAX_PRIVATE_PLAN_BYTES = 2_000_000;
type Row = Record<string, unknown>;
export type ResetTransport = (message: { recipient: string; url: string }) => Promise<void>;
export async function createAccountSystem(options: { secret: string; key: Buffer; origin: string; sqlitePath?: string; postgresUrl?: string; sendPasswordReset?: ResetTransport }) {
  if (options.secret.length < 32 || options.key.length !== 32) throw new Error('Account keys are invalid');
  let query: (sql: string, values?: (string | number)[]) => Promise<Row[]>;
  let close: () => Promise<void>;
  let createLimited: (owner: string, id: string, encrypted: string, now: number) => Promise<Row[]>;
  let database: BetterAuthOptions['database'];
  let releaseMigrationLock: (() => Promise<void>) | undefined;
  if (options.postgresUrl) {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: options.postgresUrl, max: 5, connectionTimeoutMillis: 5000, statement_timeout: 10000 });
    database = pool;
    query = async (sql, values = []) => (await pool.query(sql.replace(/\?/g, (() => { let i = 0; return () => `$${++i}`; })()), values)).rows;
    close = () => pool.end();
    createLimited = async (owner, id, encrypted, now) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // Every creator locks the same existing auth user row. PostgreSQL READ
        // COMMITTED takes a new snapshot after this wait, so the subsequent
        // count observes all earlier committed creates across server instances.
        const user = await client.query('SELECT id FROM "user" WHERE id = $1 FOR UPDATE', [owner]);
        if (!user.rows.length) throw new AccountError(401, 'Sign in to access private plans.');
        const rows = (await client.query('INSERT INTO private_plans(id, owner_id, revision, encrypted, updated_at) SELECT $1, $2, 1, $3, $4 WHERE (SELECT COUNT(*) FROM private_plans WHERE owner_id = $2) < $5 RETURNING *', [id, owner, encrypted, now, MAX_PRIVATE_PLANS])).rows;
        await client.query('COMMIT'); return rows;
      } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
    };
    const migrationClient = await pool.connect();
    try { await migrationClient.query('SELECT pg_advisory_lock(734923802)'); } catch (error) { migrationClient.release(); await pool.end(); throw error; }
    releaseMigrationLock = async () => { try { await migrationClient.query('SELECT pg_advisory_unlock(734923802)'); } finally { migrationClient.release(); } };
  } else {
    const path = options.sqlitePath ?? resolve('.private/accounts/accounts.sqlite');
    // Reject symlinked ancestry before mkdir/open so a private root cannot redirect
    // authentication records to a public directory. Explicit test paths follow the same rule.
    let ancestor = resolve(path);
    while (ancestor !== parse(ancestor).root) {
      try { if (lstatSync(ancestor).isSymbolicLink()) throw new Error('Private storage ancestry must not contain symlinks'); }
      catch (error) { if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) throw error; }
      ancestor = dirname(ancestor);
    }
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    if (lstatSync(dirname(path)).isSymbolicLink()) throw new Error('Private storage directory must not be a symlink');
    try { if (lstatSync(path).isSymbolicLink()) throw new Error('Private database must not be a symlink'); } catch (error) { if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) throw error; }
    const { DatabaseSync } = await import('node:sqlite');
    const sqlite = new DatabaseSync(path);
    chmodSync(path, 0o600);
    sqlite.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
    database = sqlite;
    query = async (sql, values = []) => sqlite.prepare(sql).all(...values) as Row[];
    close = async () => { sqlite.close(); };
    createLimited = async (owner, id, encrypted, now) => {
      // The entire transaction is synchronous: no auth/database operation can
      // interleave on this connection. BEGIN IMMEDIATE also coordinates other
      // connections sharing the same persistent SQLite file.
      sqlite.exec('BEGIN IMMEDIATE');
      try {
        const rows = sqlite.prepare('INSERT INTO private_plans(id, owner_id, revision, encrypted, updated_at) SELECT ?, ?, 1, ?, ? WHERE (SELECT COUNT(*) FROM private_plans WHERE owner_id = ?) < ? RETURNING *').all(id, owner, encrypted, now, owner, MAX_PRIVATE_PLANS) as Row[];
        sqlite.exec('COMMIT'); return rows;
      } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    };
  }
  const authOptions: BetterAuthOptions = {
    database, secret: options.secret, baseURL: options.origin, trustedOrigins: [options.origin],
    hooks: { before: createAuthMiddleware(async context => {
      if (context.path === '/delete-user' || context.path === '/delete-user/callback') {
        const password = context.body?.password;
        if (context.path !== '/delete-user' || typeof password !== 'string' || password.length < 12 || password.length > 128) throw new APIError('BAD_REQUEST', { message: 'Current password is required for account deletion.' });
      }
    }) },
    emailAndPassword: { enabled: true, minPasswordLength: 12, maxPasswordLength: 128, ...(options.sendPasswordReset ? { sendResetPassword: async ({ user, url }) => options.sendPasswordReset!({ recipient: user.email, url }), revokeSessionsOnPasswordReset: true } : {}) },
    user: { deleteUser: { enabled: true, beforeDelete: async user => { await query('DELETE FROM private_plans WHERE owner_id = ?', [user.id]); } } },
    session: { cookieCache: { enabled: false }, expiresIn: 60 * 60 * 24 * 7, freshAge: 60 * 60 },
    rateLimit: { enabled: true, storage: 'database', window: 60, max: 40 },
    advanced: { useSecureCookies: options.origin.startsWith('https:'), defaultCookieAttributes: { httpOnly: true, sameSite: 'lax' } },
    logger: { disabled: true },
  };
  try {
    await (await getMigrations(authOptions)).runMigrations();
    await query('CREATE TABLE IF NOT EXISTS private_plans (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE, revision INTEGER NOT NULL, encrypted TEXT NOT NULL, updated_at BIGINT NOT NULL)');
    await query('CREATE INDEX IF NOT EXISTS private_plans_owner ON private_plans(owner_id)');
  } catch { if (releaseMigrationLock) { await releaseMigrationLock(); releaseMigrationLock = undefined; } await close(); throw new Error('Account database initialization failed'); }
  if (releaseMigrationLock) await releaseMigrationLock();
  const auth = betterAuth(authOptions);
  const aad = (owner: string, id: string) => Buffer.from(JSON.stringify(['trippy.plan.v1', owner, id]));
  const encrypt = (owner: string, id: string, workspace: GenericWorkspace) => {
    const nonce = randomBytes(12), cipher = createCipheriv('aes-256-gcm', options.key, nonce); cipher.setAAD(aad(owner, id));
    const ciphertext = Buffer.concat([cipher.update(JSON.stringify(workspace)), cipher.final()]);
    return [nonce, cipher.getAuthTag(), ciphertext].map(part => part.toString('base64url')).join('.');
  };
  const snapshot = (owner: string, row: Row) => {
    const [nonce, tag, ciphertext] = String(row.encrypted).split('.').map(part => Buffer.from(part, 'base64url'));
    const decipher = createDecipheriv('aes-256-gcm', options.key, nonce); decipher.setAAD(aad(owner, String(row.id))); decipher.setAuthTag(tag);
    const value: unknown = JSON.parse(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8'));
    if (validateWorkspace(value).length) throw new AccountError(503, 'Stored plan failed validation.');
    return { id: String(row.id), revision: Number(row.revision), updatedAt: Number(row.updated_at), workspace: value as GenericWorkspace };
  };
  const validate = (value: unknown): GenericWorkspace => { if (validateWorkspace(value).length || Buffer.byteLength(JSON.stringify(value), 'utf8') > MAX_PRIVATE_PLAN_BYTES) throw new AccountError(400, 'Only validated, sanitized planning workspaces may be saved.'); return value as GenericWorkspace; };
  const read = async (owner: string, id: string) => { const rows = await query('SELECT * FROM private_plans WHERE owner_id = ? AND id = ?', [owner, id]); if (!rows[0]) throw new AccountError(404, 'Plan unavailable.'); return snapshot(owner, rows[0]); };
  return {
    auth, close,
    async list(owner: string) { const rows = await query('SELECT * FROM private_plans WHERE owner_id = ? ORDER BY updated_at DESC', [owner]); return rows.map(row => { const result = snapshot(owner, row); return { id: result.id, revision: result.revision, updatedAt: result.updatedAt, name: result.workspace.trip.name }; }); },
    read,
    async create(owner: string, value: unknown) { const workspace = validate(value), id = randomUUID(); const rows = await createLimited(owner, id, encrypt(owner, id, workspace), Date.now()); if (!rows[0]) throw new AccountError(429, 'Private plan storage limit reached. Delete a stored plan before creating another.'); return snapshot(owner, rows[0]); },
    async update(owner: string, id: string, revision: number, value: unknown) { const workspace = validate(value); const rows = await query('UPDATE private_plans SET revision = revision + 1, encrypted = ?, updated_at = ? WHERE owner_id = ? AND id = ? AND revision = ? RETURNING *', [encrypt(owner, id, workspace), Date.now(), owner, id, revision]); if (!rows[0]) { await read(owner, id); throw new AccountError(412, 'Plan changed. Preserve your draft and load the current version before saving.'); } return snapshot(owner, rows[0]); },
    async remove(owner: string, id: string, revision: number) { const rows = await query('DELETE FROM private_plans WHERE owner_id = ? AND id = ? AND revision = ? RETURNING id', [owner, id, revision]); if (!rows[0]) { await read(owner, id); throw new AccountError(412, 'Plan changed. Review the current version before deleting.'); } },
  };
}
let system: ReturnType<typeof createAccountSystem> | undefined;
export async function getAccountSystem() {
  const config = accountConfiguration();
  if (!config.ready) throw new AccountError(503, config.message);
  system ??= createAccountSystem({ secret: process.env.BETTER_AUTH_SECRET!, key: Buffer.from(process.env.PRIVATE_ACCOUNTS_ENCRYPTION_KEY!, 'hex'), origin: config.origin!, postgresUrl: process.env.PRIVATE_ACCOUNTS_DATABASE_URL });
  try { return await system; } catch (error) { system = undefined; throw error; }
}
