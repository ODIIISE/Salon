# Risk register

| ID | Risk | Impact | Mitigation | Gate |
|---|---|---|---|---|
| R-01 | Double booking under concurrent requests | Lost revenue and broken trust | Short hold plus PostgreSQL range exclusion and transaction recheck | Blocker |
| R-02 | Cross-salon or cross-role data access | Privacy and security incident | Membership-scoped queries, route authorization, negative tests | Blocker |
| R-03 | OTP abuse or provider outage | Account takeover or login failure | Hash OTPs, expiry, retry limits, IP/phone rate limits, provider adapter, fallback messaging | High |
| R-04 | Bad migration or malformed cache | Data loss or blank app | Backup, versioned migrations, runtime validation, recovery screen, top-level boundary | Blocker |
| R-05 | Timezone/Jalali boundary bug | Wrong appointment time | UTC storage, Tehran conversion helpers, leap/year/midnight tests | High |
| R-06 | Silent overflow past close | Staff overtime and disputes | Strict latest-finish default and explicit capped override | High |
| R-07 | Payment webhook duplication | Incorrect financial state | Idempotency keys, event ledger, reconciliation job | High |
| R-08 | Reminder consent or personal-data leakage | Compliance and trust damage | Separate transactional consent, redacted logs, retention/deletion controls | High |
| R-09 | Blocked external assets | Broken first impression and conversion loss | Self-host critical assets, poster-first rendering, CSS fallback | High |
| R-10 | Accessibility regression | Excludes keyboard and assistive-tech users | Shared primitives, automated axe/focus tests, manual screen-reader QA | High |
| R-11 | Scope drift into visual features | Delayed safe launch | Roadmap gates and no feature acceptance without owner/data/failure/test definition | Process |
| R-12 | Deployment environment mismatch | Failed release or insecure secrets | Environment schema, preview database policy, smoke checks, rollback runbook | Release |

## Stop-ship conditions

Any active R-01, R-02, R-04, or exposed credential is an automatic no-launch decision. No amount of visual polish offsets these.
