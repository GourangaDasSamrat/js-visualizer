# Security Policy

> This document outlines the security policy for **JS Visualizer** — how to report vulnerabilities, what is in scope, and what contributors and users can expect from the maintainers.

---

## Table of Contents

- [Supported Versions](#supported-versions)
- [Reporting a Vulnerability](#reporting-a-vulnerability)
- [Response Timeline](#response-timeline)
- [Scope](#scope)
- [Out of Scope](#out-of-scope)
- [Disclosure Policy](#disclosure-policy)
- [Security Best Practices for Contributors](#security-best-practices-for-contributors)
- [Known Security Considerations](#known-security-considerations)

---

## Supported Versions

Only the latest release on the `main` branch receives security patches. Older tags or branches are **not** maintained.

| Version | Supported |
|---------|-----------|
| `main` (latest) | ✅ Active |
| Any prior tagged release | ❌ Not supported |

If you are running an older version, please upgrade to the latest before filing a report.

---

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

If you discover a security issue, please report it privately by emailing:

**📧 [gouranga.samrat@gmail.com](mailto:gouranga.samrat@gmail.com)**

Please include the following in your report:

- A clear description of the vulnerability and its potential impact
- The component or file(s) affected (e.g. `src/engine/ExecutionEngine.ts`)
- Steps to reproduce the issue or a minimal proof-of-concept
- Any suggested mitigations if you have them

We treat every report seriously. You will receive an acknowledgement within **48 hours** and a full response within **7 days**.

---

## Response Timeline

| Milestone | Target |
|-----------|--------|
| Initial acknowledgement | ≤ 48 hours |
| Triage and severity assessment | ≤ 5 business days |
| Patch or mitigation published | ≤ 14 days for critical / high |
| Public disclosure | After patch is released |

For **critical** vulnerabilities (CVSS ≥ 9.0) we aim to publish a patch within 72 hours of confirmed reproduction.

---

## Scope

The following are considered in-scope for security reports:

- **Execution Engine (`src/engine/`)** — any path by which user-supplied code could escape the simulation sandbox and execute arbitrary code in the browser or Node.js environment
- **Dependency vulnerabilities** — known CVEs in `package.json` dependencies that affect the running application
- **Content Security Policy gaps** — missing or bypassable CSP headers in the production deployment at [js-visualizer.gouranga.qzz.io](https://js-visualizer.gouranga.qzz.io)
- **Cross-Site Scripting (XSS)** — any code path where unsanitised user input is reflected into the DOM outside of CodeMirror's sandboxed editor surface
- **Supply chain issues** — compromised pnpm packages in the dependency tree

---

## Out of Scope

The following are **not** considered valid security reports:

- Reports requiring physical access to the victim's device
- Self-XSS (the user injects code that only affects their own session)
- Missing `Strict-Transport-Security` or other hardening headers on local `dev` builds
- Vulnerabilities in browsers or operating systems that are not specific to this project
- Denial-of-service through extremely large code inputs (this is a known, accepted limitation for a client-side tool)
- Social engineering attacks
- Theoretical vulnerabilities without a working proof of concept

---

## Disclosure Policy

We follow a **coordinated disclosure** model:

1. Reporter submits details privately to the email above.
2. Maintainer acknowledges, triages, and assigns a severity level.
3. A fix is developed and tested in a private branch.
4. A patched release is published to `main`.
5. A public security advisory is created on GitHub **after** the patch is live.
6. Credit is given to the reporter in the advisory (unless they prefer anonymity).

We ask that reporters respect a **90-day embargo** from initial report to public disclosure, giving us time to ship a proper fix.

---

## Security Best Practices for Contributors

If you are contributing code to this project, please adhere to the following:

**Dependencies**

- Do not add new `dependencies` or `devDependencies` without justification in your pull request.
- Run `pnpm audit` before submitting a PR. PRs that introduce new high or critical audit findings will not be merged.
- Pin exact versions for any new direct dependencies (`"gsap": "3.12.5"` not `"^3"`).

**Code execution**

- The `ExecutionEngine` must **never** call `eval()`, `new Function()`, or any equivalent dynamic code execution primitive.
- All simulation must be purely data-driven — pattern matching and snapshot generation only.
- Do not introduce any server-side component, API route, or WebSocket that executes user-supplied code server-side.

**DOM manipulation**

- Never use `innerHTML`, `outerHTML`, or `document.write` with user-supplied strings.
- All CodeMirror content is treated as plain text. Do not render editor content as HTML anywhere in the UI.
- GSAP animations must only target known, application-owned DOM refs — never user-controlled selectors.

**Secrets**

- Never commit API keys, tokens, or credentials of any kind.
- The `.env` file is in `.gitignore` — keep it that way.
- GitHub Actions secrets must be used for any CI/CD credentials.

---

## Known Security Considerations

| Area | Notes |
|------|-------|
| Code execution model | The engine uses static pattern matching — `eval` is never called. User code never executes. |
| CodeMirror isolation | Editor content is treated as plain text. No HTML rendering of user input. |
| Client-side only | There is no backend. No user data leaves the browser. |
| Dependencies | Regularly audit with `pnpm audit`. See `package.json` for current dependency list. |
| CSP | Production deployment at [js-visualizer.gouranga.qzz.io](https://js-visualizer.gouranga.qzz.io) should enforce a strict Content Security Policy. Review your hosting configuration. |

---

_For any questions about this policy, contact [gouranga.samrat@gmail.com](mailto:gouranga.samrat@gmail.com)._
