# Component test scenarios — reference material

This folder holds **external-facing scenario research** (what an app team wants to prove about React Router routes) and the **product contract** for how `@scenario-testing/*` addresses those needs.

| File | Role |
|------|------|
| [`FRAMEWORK-CONTRACT.md`](FRAMEWORK-CONTRACT.md) | **Authoritative** scope, tiers, and vocabulary for the toolkit (maintainer-owned). |
| [`SCENARIOS.md`](SCENARIOS.md) | Detailed route-by-route acceptance-style examples from a fantasy-leagues UI (input for requirements). |
| [`FRAMEWORK-REQUIREMENTS-PROMPT.md`](FRAMEWORK-REQUIREMENTS-PROMPT.md) | Self-contained prompt used to elicit scenarios from another repo; same content axis as `SCENARIOS.md`. |

When implementing or extending `@scenario-testing/*`, start from **FRAMEWORK-CONTRACT.md**, not from scenario prose verbatim.
