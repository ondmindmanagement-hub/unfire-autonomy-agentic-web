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
} catch (error){
  window.unfireAgenticLab={ready:false,error:String(error.message)};
  status.textContent="Agent assistant unavailable: "+String(error.message)+". The fictional policy inspector above remains usable.";
  console.error("Unfire agent lab runtime failed",error);
}
