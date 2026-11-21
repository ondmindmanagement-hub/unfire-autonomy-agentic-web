import assert from "node:assert/strict";
import {test} from "node:test";
import {readFile,access} from "node:fs/promises";
import {AgentNetwork,validateNetwork} from "../runtime/kernel.js";
import {runFictionalNetwork,assessAction,simulateHumanReview} from "../runtime.mjs";

const read=async file=>readFile(new URL("../"+file,import.meta.url),"utf8");
const json=async file=>JSON.parse(await read(file));
const [manifest,network,fixtures]=await Promise.all(
 ["agent-manifest.json","autonomy_gate.network.json","fixtures.json"].map(json)
);
test("reference runtime accepts public declarative graph",()=>{
 const result=validateNetwork(new AgentNetwork(network,"autonomy_gate"));
 assert.deepEqual(result.errors,[]);
});
test("the public network has two agents and one declared coordinator",()=>{
 assert.equal(network.tools.length,2);
 assert.equal(manifest.networks[0].front_man,"autonomy_coordinator");
 assert.deepEqual(network.tools[0].tools,["evidence_reviewer"]);
});
test("only two read-only site actions are publicly exposed",async()=>{
 assert.deepEqual(manifest.actions.agentTools,["get_fictional_catalog","inspect_fictional_case"]);
 const src=await read("site-actions.js");
 assert.equal((src.match(/effect:"read"/g)||[]).length,2);
 assert.doesNotMatch(src,/effect:"write"|effect:"irreversible"/);
});
test("browser router is BYOK without an embedded publisher secret",async()=>{
 assert.equal(manifest.llm_router.mock,false);
 assert.equal(manifest.llm_router.base_url,"https://api.otari.ai/api/v1");
 assert.equal(manifest.llm_router.byok_router,"https://api.otari.ai/api/v1");
 const page=await read("site.js");
 assert.doesNotMatch(page,/byokKey:|ollama-local-preview-not-a-secret|sk-proj-/);
});
test("all eight invented case IDs are distinct and bounded",()=>{
 assert.equal(fixtures.length,8);
 assert.equal(new Set(fixtures.map(x=>x.id)).size,8);
 for(const f of fixtures){assert.match(f.id,/^SIM-00[1-8]$/);assert.equal(typeof f.description,"string");}
});
test("keyless inspector produces no business effects for any case",()=>{
 for(const f of fixtures){
  const r=runFictionalNetwork({manifest,network,scenario:f});
  assert.equal(r.ok,true,f.id);
  assert.equal(r.executed,0);
  assert.equal(r.externalRequests,0);
  assert.equal(r.steps.length,3);
  assert.equal(r.steps[0].agent,"local_intake");
 }
});
test("sensitive data export is denied, with no simulated approval",()=>{
 const r=runFictionalNetwork({manifest,network,scenario:fixtures[4]});
 assert.equal(r.decision,"DENY");
 assert.equal(simulateHumanReview(r,"approve").status,"NOT_ELIGIBLE");
});
test("unknown actions fail closed",()=>assert.equal(assessAction("invented_action","anything").decision,"DENY"));
test("fictional record changes remain review required",()=>{
 const r=runFictionalNetwork({manifest,network,scenario:fixtures[0]});
 assert.equal(r.decision,"REVIEW_REQUIRED");
 assert.equal(simulateHumanReview(r,"approve").executed,0);
});
test("published bridge accepts only the intended official Unfire origin",async()=>{
 const src=await read("bridge/bridge-actions.js");
 assert.match(src,/https:\/\/unfire\.technology/);
 assert.doesNotMatch(src,/ALLOWED_CALLERS=\["\*"\]/);
 assert.equal((src.match(/effect:"read"/g)||[]).length,2);
 assert.doesNotMatch(src,/effect:"write"|effect:"irreversible"/);
});
test("public site does not trigger local Ollama calls or expose a hidden test button",async()=>{
 const js=await read("app.mjs"), html=await read("index.html");
 assert.doesNotMatch(js,/127\.0\.0\.1:11434|fetch\("http:\/\//);
 assert.doesNotMatch(html,/id="model-run"/);
});
test("public interface labels the fixed policy separately from LLM agent",async()=>{
 const html=await read("index.html");
 assert.match(html,/DETERMINISTIC POLICY TRACE/);
 assert.match(html,/EXTERNAL BUSINESS CALLS/);
 assert.match(html,/This is an early-stage research demonstration/);
});
test("all required static discovery and runtime files are present",async()=>{
 for(const f of [
  ".nojekyll",".well-known/nsdeploy.json",".well-known/nsdeploy-agent.json",
  "agent-manifest.json","agent-mcp.json","autonomy_gate.network.json",
  "links.json","bridge/agent-manifest.json","bridge/action-bridge.html",
  "runtime/index.js","runtime/LICENSE.txt"]){await access(new URL("../"+f,import.meta.url));}
});
test("third-party attribution is present without changing vendor runtime",async()=>{
 assert.match(await read("NOTICE.md"),/Cognizant AI Lab/);
 assert.match(await read("runtime/LICENSE.txt"),/Apache License/);
});
test("external model credentials are warned about on the public page",async()=>{
 const html=await read("index.html");
 assert.match(html,/shared/);
 assert.match(html,/low-limit temporary test key/);
});
test("nothing in authored entrypoints references private Mac folders",async()=>{
 for(const file of ["index.html","app.mjs","site.js","site-actions.js","agent-manifest.json","runtime.mjs"]){
  const src=await read(file);
  assert.doesNotMatch(src,/\/Users\/|gho_[A-Za-z0-9]{8}|hello@unfire\.technology/);
 }
});
