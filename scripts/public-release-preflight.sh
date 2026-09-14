#!/bin/sh
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repo_root"

failed=0

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  tracked_secret_files=$(git ls-files | grep -E '(^|/)(\.env($|\.)|credentials\.json$|client_secret.*\.json$|token\.json$|.*\.(pem|key)$)' | grep -vE '(^|/)\.env\.example$' || true)
  if [ -n "$tracked_secret_files" ]; then
    echo "FAIL: secret-bearing filenames are tracked:"
    printf '%s\n' "$tracked_secret_files"
    failed=1
  fi
else
  echo "INFO: no Git work tree yet; history and tracked-file checks were skipped."
fi

suspicious_files=$(grep -RIlE --exclude='.env.example' --exclude='public-release-preflight.sh' --exclude-dir='.git' --exclude-dir='node_modules' --exclude-dir='.next' --exclude-dir='.private' --exclude-dir='dist' --exclude-dir='build' "(api[_-]?key|client[_-]?secret|access[_-]?token|authorization)[[:space:]]*[=:][[:space:]]*['\"]?[A-Za-z0-9_+/\-]{32,}['\"]?" . || true)
if [ -n "$suspicious_files" ]; then
  echo "FAIL: possible hard-coded credentials found in:"
  printf '%s\n' "$suspicious_files"
  failed=1
fi

# Scan public-facing source and documentation for values shaped like common
# provider credentials. Variable names and explicit placeholders are allowed;
# plausible live values are not.
public_secret_files=$(grep -RIlE \
  --exclude='.env.example' \
  --exclude='public-release-preflight.sh' \
  --exclude-dir='.git' \
  --exclude-dir='node_modules' \
  --exclude-dir='.next' \
  --exclude-dir='.private' \
  '(AIza[[:alnum:]_-]{24,}|(^|[^[:alnum:]_])sk-[[:alnum:]_-]{20,}|ya29\.[[:alnum:]_-]{20,}|[Bb]earer[[:space:]]+[[:alnum:]_.~+/=-]{20,})' \
  src public examples docs prompts README.md SECURITY.md CONTRIBUTING.md 2>/dev/null || true)
if [ -n "$public_secret_files" ]; then
  echo "FAIL: public-facing files contain values shaped like live credentials:"
  printf '%s\n' "$public_secret_files"
  failed=1
fi

personal_files=$(find . -type f \( -name '*.eml' -o -name '*.mbox' -o -name '*.ics' -o -name 'token.json' -o -name 'credentials.json' \) -not -path './.git/*' -print)
if [ -n "$personal_files" ]; then
  echo "FAIL: possible personal/credential files found:"
  printf '%s\n' "$personal_files"
  failed=1
fi

public_sample="examples/trips/2026-europe-sample.json"
if [ -f "$public_sample" ]; then
  private_sample_patterns='mail\.google\.com|mailto:|[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}|Booking\.com[[:space:]]+[0-9]{8,}|confirmation[[:space:]]+[A-Z0-9-]{6,}|record[[:space:]]+locator|seat[[:space:]]+[0-9]{1,2}[A-Z]'
  if grep -Eiq "$private_sample_patterns" "$public_sample"; then
    echo "FAIL: the public 2026 sample may contain a private booking or contact reference."
    grep -Ein "$private_sample_patterns" "$public_sample" | head -20
    failed=1
  fi
fi

if [ -d ".next/static" ]; then
  # MapLibre's generated vendor modules may contain upstream project contact
  # metadata. They are copied byte-for-byte from the locked npm dependency and
  # are not first-party trip data, so scan the remaining browser assets here.
  bundled_private_files=$(grep -RIlE --exclude='maplibre-gl-shared-*' --exclude='maplibre-gl-worker-*' 'mail\.google\.com|mailto:[^"[:space:]]+|[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}|AIza[[:alnum:]_-]{24,}|(^|[^[:alnum:]_])sk-[[:alnum:]_-]{20,}' .next/static || true)
  if [ -n "$bundled_private_files" ]; then
    echo "FAIL: generated browser assets may contain private data or credentials:"
    printf '%s\n' "$bundled_private_files"
    failed=1
  fi
fi

if [ -d ".next/server" ]; then
  bundled_server_secret_files=$(grep -RIlE \
    --exclude='*.map' \
    --exclude='*.nft.json' \
    '(AIza[[:alnum:]_-]{24,}|(^|[^[:alnum:]_])sk-[[:alnum:]_-]{20,}|ya29\.[[:alnum:]_-]{20,}|[Bb]earer[[:space:]]+[[:alnum:]_.~+/=-]{20,})' \
    .next/server || true)
  if [ -n "$bundled_server_secret_files" ]; then
    echo "FAIL: generated server assets may contain embedded credentials:"
    printf '%s\n' "$bundled_server_secret_files"
    failed=1
  fi
fi

if [ "$failed" -ne 0 ]; then
  echo "NOT_READY: resolve findings before any public push."
  exit 1
fi

echo "PASS: basic current-tree preflight found no listed secret or personal-data files."
echo "NOTE: this is not a history scan; run a dedicated secret scanner and review generated bundles before publication."
