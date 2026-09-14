#!/bin/sh
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repo_root"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "NOT_READY: initialize the intended release repository before the history scan."
  exit 1
fi

failed=0
credential_pattern='AIza[[:alnum:]_-]{24,}|(^|[^[:alnum:]_])sk-[[:alnum:]_-]{20,}|ya29\.[[:alnum:]_-]{20,}|[Bb]earer[[:space:]]+[[:alnum:]_.~+/=-]{20,}'
email_pattern='[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}'
reserved_email_pattern='@(example\.(com|org|net)|example\.test|test\.invalid|localhost|users\.noreply\.github\.com)$'
private_name_pattern='(^|/)(\.env($|\.)|credentials\.json$|client_secret.*\.json$|token\.json$|.*\.(pem|key|eml|mbox|ics)$|\.private/|data/private/|bookings/|emails/)'

contains_sensitive_value() {
  candidate=$1
  if grep -Eq "$credential_pattern" "$candidate"; then
    return 0
  fi
  if grep -Eo "$email_pattern" "$candidate" | grep -Eiv "$reserved_email_pattern" >/dev/null; then
    return 0
  fi
  return 1
}

tracked_private=$(git ls-files | grep -E "$private_name_pattern" | grep -vE '(^|/)\.env\.example$' || true)
if [ -n "$tracked_private" ]; then
  echo "FAIL: private or secret-bearing filenames are staged or tracked:"
  printf '%s\n' "$tracked_private"
  failed=1
fi

staged_secret_files=$(git diff --cached --name-only --diff-filter=ACMR | while IFS= read -r file; do
  [ -f "$file" ] || continue
  if grep -Iq . "$file" && contains_sensitive_value "$file"; then printf '%s\n' "$file"; fi
done)
if [ -n "$staged_secret_files" ]; then
  echo "FAIL: staged files contain credential- or personal-contact-shaped values:"
  printf '%s\n' "$staged_secret_files"
  failed=1
fi

scan_tmp=$(mktemp "${TMPDIR:-/tmp}/trippy-history-scan.XXXXXX")
trap 'rm -f "$scan_tmp"' EXIT HUP INT TERM

for revision in $(git rev-list --all 2>/dev/null || true); do
  metadata_emails=$(git show -s --format='%ae%n%ce' "$revision" | sort -u | grep -Ei "$email_pattern" | grep -Eiv "$reserved_email_pattern" || true)
  if [ -n "$metadata_emails" ]; then
    echo "FAIL: history contains a personal-contact-shaped author or committer email in revision ${revision}."
    failed=1
  fi

  history_private=$(git ls-tree -r --name-only "$revision" | grep -E "$private_name_pattern" | grep -vE '(^|/)\.env\.example$' || true)
  if [ -n "$history_private" ]; then
    echo "FAIL: history contains private or secret-bearing filenames in revision ${revision}:"
    printf '%s\n' "$history_private"
    failed=1
  fi

  history_candidates=$(git grep -IlE "$credential_pattern|$email_pattern" "$revision" -- . 2>/dev/null | sed "s#^${revision}:##" || true)
  history_secret_files=''
  if [ -n "$history_candidates" ]; then
    while IFS= read -r file; do
      [ -n "$file" ] || continue
      git show "${revision}:${file}" > "$scan_tmp"
      if contains_sensitive_value "$scan_tmp"; then
        history_secret_files="${history_secret_files}${history_secret_files:+
}${file}"
      fi
    done <<EOF
$history_candidates
EOF
  fi
  if [ -n "$history_secret_files" ]; then
    echo "FAIL: history contains credential- or personal-contact-shaped values in revision ${revision}:"
    printf '%s\n' "$history_secret_files"
    failed=1
  fi
done

if ! git diff --cached --check; then
  failed=1
fi

if [ "$failed" -ne 0 ]; then
  echo "NOT_READY: clean the staged tree or history before publication."
  exit 1
fi

echo "PASS: staged paths, commit metadata, and reachable Git history contain no listed private filenames or credential-shaped values."
echo "NOTE: retain GitHub secret scanning and an independent human redaction review before making the repository public."
