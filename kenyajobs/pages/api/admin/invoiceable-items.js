import {requireAdmin} from "@/lib/adminAuth";
import {query} from "@/lib/db";
import {sendApiError} from "@/lib/dbErrors";
export default requireAdmin(async function handler(req,res){
 if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
 try{
  const [jobs,events]=await Promise.all([
   query("SELECT id,title,company,location,created_at FROM manual_jobs WHERE published=true ORDER BY created_at DESC LIMIT 300"),
   query("SELECT id,title,organiser,slug,event_date,location,created_at FROM events WHERE published=true ORDER BY created_at DESC LIMIT 300")
  ]);
  return res.status(200).json({jobs:jobs.rows,events:events.rows});
 }catch(e){return sendApiError(res,"admin/invoiceable-items GET",e,"Could not load published jobs and events.");}
});