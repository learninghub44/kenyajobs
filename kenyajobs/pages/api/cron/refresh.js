// Scheduled source refresh and best-effort job announcement queueing.
import { enqueueJobs } from "@/lib/distribution";
const SOURCE_ROUTES=["/api/africa-jobs","/api/remote-jobs","/api/entry-level-jobs","/api/graduate-jobs","/api/wfh-jobs"];

export default async function handler(req,res){
  if(req.method!=="GET"&&req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  if(!process.env.CRON_SECRET)return res.status(503).json({error:"CRON_SECRET is not configured. Scheduled refresh is disabled until secured."});
  const authorization=String(req.headers.authorization||"");
  const bearer=authorization.startsWith("Bearer ")?authorization.slice(7):"";
  const providedKey=req.headers["x-cron-key"]||req.query.key||bearer;
  if(providedKey!==process.env.CRON_SECRET)return res.status(401).json({error:"Unauthorized"});
  const baseUrl=process.env.SITE_URL||(req.headers.host?`https://${req.headers.host}`:"http://localhost:3000");
  const startedAt=Date.now();
  const results=await Promise.allSettled(SOURCE_ROUTES.map(async route=>{
    const response=await fetch(`${baseUrl}${route}`,{headers:{"User-Agent":"JobsHubKenya-Cron/1.0"}});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const data=await response.json();
    const distribution=await enqueueJobs(Array.isArray(data)?data:[],route);
    return {route,count:Array.isArray(data)?data.length:0,queued:distribution.queued||0};
  }));
  const sources=results.map((result,index)=>result.status==="fulfilled"?{...result.value,status:"ok"}:{route:SOURCE_ROUTES[index],status:"error",error:result.reason?.message||"Source refresh failed"});
  const totalJobs=sources.reduce((sum,source)=>sum+(source.count||0),0);
  const queued=sources.reduce((sum,source)=>sum+(source.queued||0),0);
  const durationMs=Date.now()-startedAt;
  console.log(`[cron/refresh] ${totalJobs} jobs, ${queued} distribution items in ${durationMs}ms`);
  return res.status(200).json({ok:sources.some(s=>s.status==="ok"),durationMs,totalJobs,queued,sources,timestamp:new Date().toISOString()});
}
