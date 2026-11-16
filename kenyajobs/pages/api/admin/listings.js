import {requireAdmin} from "@/lib/adminAuth";
import {query} from "@/lib/db";
import {getPackage} from "@/lib/packages";
export default requireAdmin(async function handler(req,res){
 try{
  if(req.method==="GET"){
   const [jobs,events]=await Promise.all([
    query("SELECT id,title,company AS owner,package_code,package_price,package_expires_at,published,renewal_status,'job' AS kind FROM manual_jobs WHERE package_code IS NOT NULL ORDER BY package_expires_at ASC NULLS LAST LIMIT 300"),
    query("SELECT id,title,organiser AS owner,package_code,package_price,package_expires_at,published,renewal_status,'event' AS kind FROM events ORDER BY package_expires_at ASC NULLS LAST LIMIT 300")
   ]);
   return res.status(200).json([...jobs.rows,...events.rows].map(x=>({...x,lifecycle:!x.package_expires_at?"needs_review":new Date(x.package_expires_at)<=new Date()?"expired":(new Date(x.package_expires_at)-Date.now())<7*86400000?"expiring_soon":"active"})).sort((a,b)=>new Date(a.package_expires_at||0)-new Date(b.package_expires_at||0)));
  }
  if(req.method==="POST"){
   const b=req.body||{},id=String(b.id||""),kind=b.kind==="event"?"event":"job",action=b.action;
   if(!id||!["renew","delete"].includes(action))return res.status(400).json({error:"Valid listing and action required."});
   const table=kind==="event"?"events":"manual_jobs";
   if(action==="delete"){await query("DELETE FROM "+table+" WHERE id=$1",[id]);return res.status(200).json({ok:true});}
   const p=getPackage(kind==="event"?"events":"jobs",String(b.packageCode||""));
   if(!p)return res.status(400).json({error:"Choose a valid renewal package."});
   if(kind==="event")await query("UPDATE events SET package_code=$2,package_price=$3,package_started_at=now(),package_expires_at=now()+($4 * interval '1 day'),featured_until=CASE WHEN $5>0 THEN now()+($5 * interval '1 day') ELSE NULL END,promotions_allowed=$6,promotions_used=0,published=true,renewal_status='active',updated_at=now() WHERE id=$1",[id,p.code,p.price,p.durationDays,p.limits.featuredDays,p.limits.promotions]);
   else await query("UPDATE manual_jobs SET package_code=$2,package_price=$3,package_started_at=now(),package_expires_at=now()+($4 * interval '1 day'),published=true,featured=($5>0),featured_until=CASE WHEN $5>0 THEN now()+($5 * interval '1 day') ELSE NULL END,renewal_status='active',updated_at=now() WHERE id=$1",[id,p.code,p.price,p.durationDays,p.limits.featuredDays]);
   return res.status(200).json({ok:true});
  }
  return res.status(405).json({error:"Method not allowed"});
 }catch(e){console.error("listing lifecycle:",e.message);return res.status(500).json({error:"Could not update listing lifecycle."});}
});
