export function accountConfiguration(env = process.env) {
  if (env.PRIVATE_ACCOUNTS_ENABLED !== 'true') return { enabled: false, ready: false, message: 'Private accounts are disabled. Browser-only planning remains available.' };
  const remote = Boolean(env.VERCEL || env.AWS_LAMBDA_FUNCTION_NAME || env.FUNCTION_TARGET);
  let origin = '';
  try { const url = new URL(env.BETTER_AUTH_URL ?? ''); if (url.username || url.password || url.search || url.hash || url.pathname !== '/' || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) throw new Error(); origin = url.origin; } catch { /* report names only */ }
  const key = env.PRIVATE_ACCOUNTS_ENCRYPTION_KEY ?? '';
  const ready = Boolean(origin && (env.BETTER_AUTH_SECRET?.length ?? 0) >= 32 && /^[a-f0-9]{64}$/i.test(key) && (!remote || env.PRIVATE_ACCOUNTS_DATABASE_URL));
  return { enabled: true, ready, origin, message: ready ? 'Private accounts use this server’s configured storage.' : 'Private accounts need a valid origin, separate authentication secret, encryption key and durable database on hosted servers.' };
}
