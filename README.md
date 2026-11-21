# Unfire Autonomy · Open Agentic Web Research Lab

Public-hosting candidate (22 November 2026). Research-stage fictional data only,
no payments, user data, external side effects or claims of independent certification.

- Free, keyless deterministic policy inspector: eight invented workflow cases
- Browser agent: declarative HOCON-generated JSON network with two agents, official
  Cognizant reference runtime, two read-only website tools and user-configured BYOK
- No Unfire-owned API key or paid inference server. Visitors who choose the live agent
  use their own compatible provider and credentials, which may incur provider charges
  under their own account. The policy inspector is free without any login or credentials.
- Read-only third-party bridge actions restricted to https://unfire.technology;
  requires caller-side consent and no real data.
- Static site: manifest, graph, bridge, CORS-compatible assets and discovery records.

The original public Unfire Autonomy product page remains separately hosted and unchanged.
License notice: NOTICE.md and runtime/LICENSE.txt.

## Publication

Static bundle designed for GitHub Pages at:
https://ondmindmanagement-hub.github.io/unfire-autonomy-agentic-web/

The parent repository must enable GitHub Pages HTTPS. GitHub Pages ignores
dot-named directories unless .nojekyll is included (it is).

This repository does NOT contain private development reports, session cookies,
credentials, user files, screenshots of account pages, or proprietary Bolt files.

## Important limits

This lab is not a certified safety product, a commercial agent or a complete
competition submission. A real contest entry still needs a real demonstration
video narrated by the entrant, and independent judge-accessibility verification.

## Security consideration for BYOK on public GitHub Pages

All project pages at the same *.github.io account origin share browser origin storage.
The reference runtime may retain visitor API keys in origin-scoped localStorage. Visitors
should therefore avoid sensitive or high-balance keys, use a short-lived limited test key
if needed, and delete the saved profile afterwards. For strongest credential separation,
deploy this project to its own distinct HTTPS subdomain before promoting live BYOK.
The default eight-case fixed-policy demonstration does not require BYOK.
