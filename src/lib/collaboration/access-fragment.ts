/** Fragment-only capabilities never belong in room records or query parameters. */
export function parseRoomAccessFragment(hash: string): { present: boolean; capability: string | null } {
  const fields = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  const values = fields.getAll('token');
  return { present: values.length > 0, capability: values.length === 1 && /^[a-zA-Z0-9_-]{43}$/.test(values[0]) ? values[0] : null };
}
