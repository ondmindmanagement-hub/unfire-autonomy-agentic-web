// Unfire Autonomy: deterministic local evaluation for fictional scenarios only.
// Not an LLM, MCP runtime, production safety gate, or authenticated approval service.
export const ACTIONS = Object.freeze(["inspect_status", "update_record", "issue_refund", "export_customer_data"]);
export const DECISIONS = Object.freeze(["ALLOW", "REVIEW_REQUIRED", "DENY"]);
const BAD_EFFECTS = new Set(["issue_refund", "export_customer_data"]);
const DANGEROUS = /smoke|overheat|fire|unsafe temperature|injury|electrical hazard/i;
const CAUTION = /offline|failure|duplicate|jammed|charged twice|network outage/i;

export function validateNetwork(manifest, network) {
  const errors = [];
  if (!manifest || typeof manifest !== "object" || !Array.isArray(manifest.networks)) errors.push("Missing site manifest networks");
  if (!network || typeof network !== "object" || !Array.isArray(network.tools)) errors.push("Missing resolved network tools");
  if (errors.length) return errors;
  const entry = manifest.networks.find(x => x.name === "autonomy_gate");
  if (!entry || typeof entry.front_man !== "string") errors.push("Missing named network/front agent");
  const agents = network.tools.filter(x => x && typeof x.name === "string");
  const names = new Set();
  for (const a of agents) {
    if (names.has(a.name)) errors.push("Duplicate agent: " + a.name);
    names.add(a.name);
    if (!a.function || typeof a.function.description !== "string") errors.push("Missing function description: " + a.name);
    if (!Array.isArray(a.tools)) errors.push("Missing agent tools list: " + a.name);
  }
  if (entry && !names.has(entry.front_man)) errors.push("Front agent not declared");
  for (const a of agents) {
    for (const child of a.tools || []) {
      if (typeof child !== "string" || !names.has(child)) errors.push("Unresolved agent reference in " + a.name);
    }
  }
  const state = new Map();
  function visit(name, depth) {
    if (depth > 8) { errors.push("Graph exceeds depth limit"); return; }
    if (state.get(name) === 1) { errors.push("Agent composition cycle at " + name); return; }
    if (state.get(name) === 2) return;
    state.set(name, 1);
    const a = agents.find(x => x.name === name);
    if (a) for (const t of a.tools || []) if (typeof t === "string" && names.has(t)) visit(t, depth + 1);
    state.set(name, 2);
  }
  if (entry && names.has(entry.front_man)) visit(entry.front_man, 0);
  if (manifest.peer_policy?.mode !== "closed" || (manifest.allowed_peers || []).length) {
    errors.push("Local preview must fail closed for remote peer access");
  }
  if (network.tools.length > 12) errors.push("Agent count exceeds local runtime budget");
  return [...new Set(errors)];
}

export function assessAction(action, description) {
  if (typeof action !== "string" || typeof description !== "string") {
    return {decision: "DENY", priority: "Unknown", reason: "Invalid action or description"};
  }
  if (description.length > 4000 || action.length > 80) {
    return {decision: "DENY", priority: "Unknown", reason: "Input exceeded local preview limits"};
  }
  const priority = DANGEROUS.test(description) ? "Critical" : CAUTION.test(description) ? "Elevated" : "Routine";
  if (!ACTIONS.includes(action)) return {decision: "DENY", priority, reason: "Unknown action: fail closed"};
  if (BAD_EFFECTS.has(action)) return {decision: "DENY", priority, reason: "Sensitive action is not permitted in this preview"};
  if (action === "inspect_status") return {decision: "ALLOW", priority, reason: "Fictional read-only inspection"};
  return {decision: "REVIEW_REQUIRED", priority, reason: "A fictional record change requires a visible human review"};
}

export function runFictionalNetwork({manifest, network, scenario}) {
  const invalid = validateNetwork(manifest, network);
  if (invalid.length) return {ok:false, errors: invalid, executed:0, externalRequests:0};
  if (!scenario || typeof scenario !== "object") return {ok:false, errors:["Missing fictional scenario"],executed:0,externalRequests:0};
  const caseId = typeof scenario.id === "string" && /^[A-Za-z0-9-]{1,32}$/.test(scenario.id) ? scenario.id : "LOCAL-CASE";
  const steps = [];
  const agents = new Map(network.tools.map(x=>[x.name,x]));
  const front = manifest.networks[0].front_man;
  if (!agents.get(front)) return {ok:false,errors:["Front agent missing"],executed:0,externalRequests:0};
  steps.push({agent: "local_intake", message: "Read invented request; no AI model or remote execution involved in this fixed-policy inspector"});
  // This offline UI preview is not a model-run agent delegation. It applies a fixed
  // policy and a fixed evidence check. The separate reference runtime above the page
  // is the actual LLM agent runner when the visitor configures a model provider.
  if (!agents.get("evidence_reviewer")) return {ok:false,errors:["Evidence specialist missing"],executed:0,externalRequests:0};
  const result = assessAction(scenario.action,scenario.description);
  steps.push({agent:"local_policy_engine",message:result.decision+": "+result.reason});
  const verified = DECISIONS.includes(result.decision) && steps.length === 2;
  steps.push({agent:"local_evidence_check",message: verified ? "Observed local classification; no external effects" : "Local classification error; fail-closed report"});
  return {
    ok:true, caseId, action:scenario.action, channel:scenario.channel || "Local",
    description:scenario.description, decision:result.decision, priority:result.priority,
    reason:result.reason, steps, executed:0, externalRequests:0, activeModel:"none",
    review:result.decision==="REVIEW_REQUIRED" ? "Awaiting a fictional human choice" : "Not applicable",
    limitations:"The fixed policy uses no model inference. The separate browser assistant may use a locally configured AI model, but cannot authenticate approvals, execute business actions or validate production safety."
  };
}

export function simulateHumanReview(report, choice) {
  if (!report?.ok || report.decision !== "REVIEW_REQUIRED") {
    return {status:"NOT_ELIGIBLE",executed:0,message:"Only fictional review-required actions can receive a local simulated choice."};
  }
  if (choice !== "approve" && choice !== "reject") {
    return {status:"INVALID_CHOICE",executed:0,message:"A human must explicitly select Approve or Reject."};
  }
  return {
    status:choice === "approve" ? "APPROVED_IN_SIMULATION" : "REJECTED_IN_SIMULATION",
    executed:0,
    message:"A local simulated review was recorded. No external action was executed and no real identity was authenticated."
  };
}

export async function loadLocalBundle(fetchFn, baseUrl) {
  // The only fetches performed here are the explicitly provided local bundle paths.
  const base = new URL(baseUrl);
  const paths=["agent-manifest.json","autonomy_gate.network.json","fixtures.json"];
  const json=[];
  for (const p of paths) {
    const u=new URL(p,base);
    if (u.origin !== base.origin || !u.pathname.startsWith(base.pathname)) throw Error("Bundle escaped its origin");
    const response=await fetchFn(u.href,{credentials:"omit",redirect:"error"});
    if (!response.ok) throw Error("Missing local bundle artifact: "+p);
    json.push(await response.json());
  }
  const [manifest,network,fixtures]=json;
  const errors=validateNetwork(manifest,network);
  if (errors.length) throw Error("Invalid local bundle: "+errors.join("; "));
  return {manifest,network,fixtures};
}

// Stub performs NO fetch: remote peer access is categorically disabled by this prototype.
// A conforming implementation would require approved consent, CORS and a real browser runtime.
export function previewPeerRequest(origin) {
  return {ok:false,origin:String(origin).slice(0,160),reason:"Peer loading disabled; no request sent",externalRequests:0};
}

// AI output is UNTRUSTED: it is only an action proposal for the fixed policy gate.
export function parseModelProposal(text) {
  if (typeof text !== "string" || text.length > 4096) throw Error("Model reply missing or too long");
  let obj;
  try { obj=JSON.parse(text); } catch { throw Error("Model did not return valid JSON"); }
  if (!obj || typeof obj !== "object" || Array.isArray(obj) || typeof obj.action !== "string") {
    throw Error("Model reply requires a string action field");
  }
  return {
    action: obj.action.slice(0,80),
    note: typeof obj.reason === "string" ? obj.reason.slice(0,240) : "No model rationale provided"
  };
}
