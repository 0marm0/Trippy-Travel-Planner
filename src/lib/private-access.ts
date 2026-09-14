export function canServePrivateTripData({ hostname, nodeEnv, explicitGate }: { hostname: string; nodeEnv: string | undefined; explicitGate: string | undefined }) {
  const loopback = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  return nodeEnv === "development" && loopback && explicitGate === "true";
}
