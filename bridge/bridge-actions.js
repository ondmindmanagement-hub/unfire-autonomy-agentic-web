// Read-only cross-origin bridge for an isolated local two-site test.
// No credentials, live systems, privacy-sensitive data, write effects or owner approvals.
import {assessAction} from "../runtime.mjs";
const ALLOWED_CALLERS=["https://unfire.technology"];
async function cases(){
 const u=new URL("../fixtures.json",import.meta.url);
 const r=await fetch(u.href,{credentials:"omit",cache:"no-store"});
 if(!r.ok)throw Error("Public fictional fixture bundle unavailable");
 const rows=await r.json();
 if(!Array.isArray(rows)||rows.length!==8)throw Error("Unexpected synthetic fixture catalog");
 return rows;
}
async function catalog(){
 return {ok:true,source:"public fictional Unfire Autonomy fixtures",syntheticOnly:true,
   cases:(await cases()).map(({id,action,description,channel})=>({id,action,description,channel})),
   limitations:"No authentication, customer data, remote action execution, money movement or production outcome."};
}
async function inspect({id}){
 const f=(await cases()).find(x=>x.id===id);
 if(!f)return {ok:false,reason:"Fictional case does not exist"};
 const result=assessAction(f.action,f.description);
 return {ok:true,caseId:f.id,source:"public fictional fixtures",
   decision:result.decision,priority:result.priority,reason:result.reason,
   externalRequests:0,executed:0,
   limitations:"This is a deterministic read-only classification, not an authenticated human approval."};
}
export function registerActions(actions){
 actions.register({
  name:"get_fictional_catalog",effect:"read",availability:"bridge",
  callerOrigins:ALLOWED_CALLERS,
  description:"Return the publicly invented cases available for policy review. No real user data.",
  inputSchema:{type:"object",properties:{},additionalProperties:false},
  execute:catalog
 });
 actions.register({
  name:"inspect_fictional_case",effect:"read",availability:"bridge",
  callerOrigins:ALLOWED_CALLERS,
  description:"Deterministically classify one public fictional case, providing no real-world approval or tool execution.",
  inputSchema:{type:"object",properties:{id:{type:"string",enum:["SIM-001","SIM-002","SIM-003","SIM-004","SIM-005","SIM-006","SIM-007","SIM-008"],description:"Exact fictional ID from get_fictional_catalog"}},required:["id"],additionalProperties:false},
  execute:inspect
 });
}
