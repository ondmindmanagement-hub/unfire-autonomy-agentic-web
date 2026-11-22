// Browser assistant built on the competition's reference skill runtime.
// All registered actions are read-only. There is no irreversible or write action to confirm.
import "./app.mjs";
import { boot } from "./runtime/index.js";
const status=document.querySelector("#assistant-status");
const base=new URL("./",import.meta.url).href;
try {
  // Published origin never receives a preset key. Visitors configure their own
  // router/model/credential in the reference runtime's AI model settings.
  const {engine}=await boot("#agent-app",{
    originUrl:base,
    sandboxWorkerUrl:new URL("./runtime/sandbox-worker.js",base).href
  });
  window.unfireAgenticLab={ready:true,engine};
  status.textContent="Reference browser runtime loaded. The assistant requires your choice of a supported model provider in AI model settings. The policy inspector above works without any key.";
  const runButton=document.getElementById("tool-run");
  const toolState=document.getElementById("tool-state");
  const toolReceipt=document.getElementById("tool-receipt");
  const caseSelector=document.getElementById("tool-case");
  const scope={base:engine.top.base,network:engine.top.network.name};
  const action=engine.actions.catalog(scope).find(x=>x.name==="inspect_fictional_case" && x.effect==="read");
  if(!action) {
    toolState.textContent="The expected read-only website action is unavailable. No test executed.";
  } else {
    runButton.disabled=false;
    toolState.textContent="Reference browser action is available. Select an invented case and run it.";
    runButton.addEventListener("click",async()=>{
      if(runButton.disabled) return;
      const id=caseSelector.value;
      if(!/^SIM-00[1-8]$/.test(id)) {
        toolState.textContent="Invalid fictional case ID; no request sent.";
        return;
      }
      runButton.disabled=true;
      toolReceipt.hidden=true;
      toolState.textContent="Executing an in-browser, read-only action; no model or external business operation is involved.";
      try{
        const plan=engine.actions.prepare({kind:"action",action:action.ref,arguments:{id}});
        // Approve ONLY the exact same-origin, read-only, user-selected fictional inspector.
        // Every write, cross-origin origin, unexpected name, or altered argument fails closed.
        const permitReadOnly=async proposed=>Array.isArray(proposed) && proposed.length===1 && proposed.every(x=>
          x.effect==="read" && x.action==="inspect_fictional_case" && x.origin===location.origin && x.arguments?.id===id);
        const receipts=await engine.actions.execute(plan,permitReadOnly,"unfire-public-local-read-test");
        if(!Array.isArray(receipts)) throw Error("Runtime declined the read-only action");
        const receipt=receipts.find(x=>x.action===action.ref);
        if(!receipt || receipt.status!=="succeeded" || receipt.result?.caseId!==id || receipt.result?.executed!==0){
          throw Error("Action did not return the expected safe read-only receipt");
        }
        const out={tool:"website_inspect_fictional_case",caseId:receipt.result.caseId,decision:receipt.result.decision,priority:receipt.result.priority,
          reason:receipt.result.reason,executedBusinessActions:receipt.result.executed,
          externalBusinessRequests:receipt.result.externalRequests,
          authenticatedApproval:false,inferenceUsed:false,source:"Actual reference browser action registry"};
        toolReceipt.textContent=JSON.stringify(out,null,2);
        toolReceipt.hidden=false;
        toolState.textContent="PASS — reference tool returned an inspected fictional case with zero business effects.";
      } catch(error){
        toolState.textContent="Tool test failed: "+String(error.message).slice(0,240)+". No business action was authorized.";
      } finally {runButton.disabled=false;}
    });
  }
} catch (error){
  window.unfireAgenticLab={ready:false,error:String(error.message)};
  status.textContent="Agent assistant unavailable: "+String(error.message)+". The fictional policy inspector above remains usable.";
  document.getElementById("tool-state").textContent="The browser tool could not start; no action executed.";
  console.error("Unfire agent lab runtime failed",error);
}
