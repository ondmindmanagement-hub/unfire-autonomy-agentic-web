# Unfire Autonomy — Judge Guide

Public HTTPS lab: https://ondmindmanagement-hub.github.io/unfire-autonomy-agentic-web/
Open code: https://github.com/ondmindmanagement-hub/unfire-autonomy-agentic-web

## Free inspection without login, model account or API key

1. Open the site and select SIM-001 in Propose an action. Click Inspect policy. The deterministic local policy returns REVIEW_REQUIRED with a fictional human-review card. The simulated approval never executes a business operation.
2. Select SIM-005 and click Inspect policy. It returns DENY with no approval controls.
3. Scroll to Inspect with an agent, locate Run the actual read-only website tool, select SIM-001 and click Execute read-only tool.
4. The Cognizant reference browser action registry calls website_inspect_fictional_case and displays a JSON receipt containing REVIEW_REQUIRED, inferenceUsed:false, and zero executed business actions.
5. Try SIM-005 through the tool button; it reports DENY, also without side effects.
6. The two action declarations and network can be reviewed at agent-manifest.json, autonomy_gate.network.json, links.json, bridge/bridge-actions.js and .well-known/nsdeploy.json.

These are real, interactive website actions in the reference runtime, but NOT live AI inference. They provide free technical validation even if no LLM provider is configured.

## Optional model-driven interface

The separate browser chat uses a visitor-selected compatible LLM router, model and BYOK credential. No Unfire API key is embedded. The visitor's provider may apply usage limits or charges. Do not enter sensitive or private information. This optional mode has NOT been validated with an independent judge's BYOK configuration.

## Verified

Eight invented scenarios; read-only local actions; deployment over HTTPS and CORS; official browser runtime and its public manifest; a browser cross-origin read from https://unfire.technology; local model tool-call experiment; automated source validation and GitHub Actions.

## Explicit limitations

No customer deployment, authenticated approval, real transfers, external record changes, certified policy enforcement, independently audited production security, free provider-funded inference, or reliable autonomous model-selected peer delegation is claimed.

The Unfire-specific code and the third-party Apache-2.0 browser runtime have distinct rights: see RIGHTS_AND_ATTRIBUTION.md.

Technical lab published; Cognizant Devpost submission and entrant-narrated public YouTube video NOT yet completed.
