import {loadLocalBundle,runFictionalNetwork,simulateHumanReview} from "./runtime.mjs";
const $=id=>document.getElementById(id);
const b=new URL("./",import.meta.url);
let bundle=null,report=null;
function appendLine(node,title,desc){
 const li=document.createElement("li"); const strong=document.createElement("strong");
 strong.textContent=title;const p=document.createElement("p");p.textContent=desc;li.append(strong,p);node.append(li);
}
function choose(index) {
 if(!bundle)return;
 const selected=bundle.fixtures[index]||bundle.fixtures[0];
 $("case-choice").value=String(bundle.fixtures.indexOf(selected));
 $("action-choice").value=selected.action;
 $("description").value=selected.description;
 $("report").classList.add("hidden");
 $("report-placeholder").classList.remove("hidden");
 $("review-controls").hidden=true;
 $("review-status").textContent="";
 report=null;
}
function render(r) {
 $("report-placeholder").classList.add("hidden");$("report").classList.remove("hidden");
 $("result-id").textContent=r.caseId||"LOCAL";
 $("result-priority").textContent=r.priority||"Unknown";
 $("decision").textContent=r.decision||"ERROR";
 $("decision").className="big-decision "+(r.decision==="ALLOW"?"allow":r.decision==="DENY"?"deny":"review");
 $("reason").textContent=r.reason||r.errors?.join("; ")||"Unknown error";
 $("review-controls").hidden=r.decision!=="REVIEW_REQUIRED";
 $("review-status").textContent="";
 $("active-model").textContent=r.activeModel==="none"?"None":r.activeModel||"None";
 $("steps").replaceChildren();
 for(const x of r.steps||[])appendLine($("steps"),x.agent.replaceAll("_"," ").toUpperCase(),x.message);
 $("executed").textContent=String(r.executed||0);
 $("requests").textContent=String(r.externalRequests||0);
}
$("run").addEventListener("click",()=>{
 if(!bundle)return;
 const i=Number($("case-choice").value)||0;
 const baseCase=bundle.fixtures[i];
 const scenario={...baseCase,action:$("action-choice").value,description:$("description").value};
 report=runFictionalNetwork({...bundle,scenario});
 render(report);
});
$("reset").addEventListener("click",()=>choose(0));
$("case-choice").addEventListener("change",e=>choose(Number(e.target.value)));
for(const [id,choice] of [["approve","approve"],["reject","reject"]]){
 $(id).addEventListener("click",()=>{
  const outcome=simulateHumanReview(report,choice);
  $("review-status").textContent=outcome.status+": "+outcome.message;
 });
}
try{
 bundle=await loadLocalBundle(fetch,b.href);
 $("case-choice").replaceChildren();
 bundle.fixtures.forEach((f,i)=>{
  const o=document.createElement("option");o.value=String(i);o.textContent=f.id+" — "+f.description.slice(0,75);$("case-choice").append(o);
 });
 choose(0);
}catch(err){
 $("case-choice").replaceChildren();
 const o=document.createElement("option");o.textContent="Local bundle invalid";$("case-choice").append(o);
 $("run").disabled=true;
 $("report-placeholder").querySelector("h3").textContent="Preview unavailable";
 $("report-placeholder").querySelector("p").textContent=String(err.message);
}


// Public read-only site operations; no DOM mutation, no approval, no customer data.
export const App={
 page:{
  fictionalCaseIds(){return bundle?bundle.fixtures.map(f=>f.id):[];},
  getFictionalCatalog(){
   if(!bundle)return {ok:false,reason:"Local synthetic catalog unavailable"};
   return {ok:true,source:"local fictional fixtures",syntheticOnly:true,
    cases:bundle.fixtures.map(f=>({id:f.id,action:f.action,description:f.description,channel:f.channel})),
    limitations:"No customer data, external actions, real approvals or production inference in this tool."};
  },
  inspectFictionalCase(id){
   if(!bundle)return {ok:false,reason:"Local synthetic catalog unavailable"};
   const scenario=bundle.fixtures.find(f=>f.id===id);
   if(!scenario)return {ok:false,reason:"Unknown fictional case ID"};
   return runFictionalNetwork({...bundle,scenario});
  }
 }
};
