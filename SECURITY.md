# Security policy

Do not report exposed credentials, booking references, personal email data, or traveler records in a public issue.

Use GitHub's private vulnerability reporting only when the repository's Security page actually offers **Report a vulnerability**. That feature is a repository setting; this policy does not imply it is enabled. Until a private reporting channel is configured, contact the owner through an existing private channel already known to you. If neither is available, do not publish exposure details in an issue, pull request, discussion, screenshot or reproduction file.

A private report should describe the affected version or commit, the behavior and minimal invented-data reproduction, the likely impact, and whether an exposure may still be active. Do not send real keys, tokens, booking identifiers, raw messages or traveler records, even as evidence.

Maintainers should restrict access to an exposure report, revoke or rotate compromised credentials, inspect affected history and artifacts without repeating the values, and follow [the remediation procedure](docs/SECURITY.md). Removing the latest file does not remove Git history or invalidate a credential.

Before public release, the owner must establish a usable private reporting channel and verify it from the contributor's perspective. [GitHub's private reporting guide](https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/configure-vulnerability-reporting/configure-for-a-repository) explains the repository setting. This file does not authorize enabling services or changing repository visibility.

TRIPPY is pre-release software. No version is currently declared supported for security updates.
