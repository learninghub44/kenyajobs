import {query} from "@/lib/db";
export default async function handler(req,res){
 const secret=process.env.CRON_SECRET;
 if(!secret||req.headers.authorization!=="Bearer "+secret)return res.status(401).json({error:"Unauthorized"});
 if(req.method!=="GET"&&req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 try{
  const [jobs,featured,events]=await Promise.all([
   query("UPDATE manual_jobs SET published=false,renewal_status='renewal_due',updated_at=now() WHERE published=true AND package_expires_at IS NOT NULL AND package_expires_at<=now() RETURNING id"),
   query("UPDATE manual_jobs SET featured=false WHERE featured=true AND featured_until IS NOT NULL AND featured_until<=now() RETURNING id"),
   query("UPDATE events SET published=false,renewal_status='renewal_due',updated_at=now() WHERE published=true AND package_expires_at IS NOT NULL AND package_expires_at<=now() RETURNING id")
  ]);
  return res.status(200).json({ok:true,expiredJobs:jobs.rowCount,expiredEvents:events.rowCount,featuredPlacementsEnded:featured.rowCount});
 }catch(e){console.error("expiry cron:",e.message);return res.status(503).json({error:"Expiry processing failed."});}
}
