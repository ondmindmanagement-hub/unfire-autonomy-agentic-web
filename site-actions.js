// Read-only website actions for the official agentic-web browser runtime.
// These reuse exactly the UI's fictional case catalog and deterministic policy method.
import { App } from "./app.mjs";

export function registerActions(actions) {
  actions.register({
    name:"get_fictional_catalog",
    description:"Read the current local fictional incident catalog and declared limitations. Use first to learn valid IDs. No side effects.",
    effect:"read",
    inputSchema:{type:"object",properties:{},additionalProperties:false},
    execute:()=>App.page.getFictionalCatalog()
  });
  actions.register({
    name:"inspect_fictional_case",
    description:"Read-only deterministic policy evaluation of one existing fictional incident by exact case ID from website_get_fictional_catalog. Returns observed allow/review/deny and an audit trace. Never executes or approves real actions.",
    effect:"read",
    inputSchema:{
      type:"object",
      properties:{id:{type:"string",enum:App.page.fictionalCaseIds(),description:"A case ID exactly as in website_get_fictional_catalog, such as SIM-001."}},
      required:["id"],additionalProperties:false
    },
    execute:({id})=>App.page.inspectFictionalCase(id)
  });
}
