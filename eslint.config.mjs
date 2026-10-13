import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([".next/**", ".private/**", "output/**", ".playwright-cli/**", "out/**", "build/**", "next-env.d.ts", "public/maplibre-gl-*.mjs"]),
]);
