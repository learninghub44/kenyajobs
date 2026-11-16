import crypto from "crypto";
import {requireAdmin} from "@/lib/adminAuth";
import {query} from "@/lib/db";
import {getPackage} from "@/lib/packages";
const slugify=(s)=>String(s||"event").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,70)||"event";
export default requireAdmin(async function handler(req,res){
 try{
  if(req.method==="GET"){const {rows}=await query("SELECT * FROM event_submissions ORDER BY created_at DESC LIMIT 200");return res.status(200).json(rows);}
  if(req.method==="POST"){
   const b=req.body||{},id=Number(b.id);if(!Number.isInteger(id)||id<1)return res.status(400).json({error:"Valid event request ID required."});
   const {rows}=await query("SELECT * FROM event_submissions WHERE id=$1 AND status='pending' FOR UPDATE",[id]);const s=rows[0];if(!s)return res.status(404).json({error:"Pending event request not found."});
   if(b.paymentConfirmed!==true)return res.status(409).json({error:"Confirm payment before publishing this paid promotion."});
   const p=getPackage("events",s.package_code);if(!p)return res.status(400).json({error:"The selected package is no longer available. Review and reassign it."});
   const idSlug=slugify(s.title)+"-"+crypto.randomBytes(3).toString("hex"),eventId="event-"+crypto.randomUUID();
   const {rows:created}=await query(`INSERT INTO events(id,title,slug,organiser,event_type,event_date,start_time,end_time,venue,location,description,ticket_price,registration_url,poster_url,website,package_code,package_price,package_started_at,package_expires_at,featured_until,promotions_allowed,source_submission_id)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,now(),now()+($18||' days')::interval,CASE WHEN $19>0 THEN now()+($19||' days')::interval ELSE NULL END,$20,$21) RETURNING *`,
    [eventId,s.title,idSlug,s.organiser,s.event_type,s.event_date,s.start_time,s.end_time,s.venue,s.location,s.description,s.ticket_price,s.registration_url,s.poster_url,s.website,p.code,p.price,p.durationDays,p.limits.featuredDays,p.limits.promotions,id]);
   await query("UPDATE event_submissions SET status='approved',payment_status='confirmed',event_id=$2,reviewed_at=now() WHERE id=$1 AND status='pending'",[id,eventId]);
   return res.status(200).json({ok:true,event:created[0]});
  }
  if(req.method==="PATCH"){
   const b=req.body||{},id=Number(b.id);if(!Number.isInteger(id)||id<1)return res.status(400).json({error:"Valid request ID required."});
   const note=String(b.adminNotes||"").trim().slice(0,2000),pay=b.paymentStatus==="confirmed"?"confirmed":"awaiting_confirmation";
   await query("UPDATE event_submissions SET admin_notes=$2,payment_status=$3 WHERE id=$1",[id,note,pay]);return res.status(200).json({ok:true});
  }
  if(req.method==="DELETE"){const id=Number((req.body||{}).id);await query("UPDATE event_submissions SET status='rejected',reviewed_at=now() WHERE id=$1 AND status='pending'",[id]);return res.status(200).json({ok:true});}
  return res.status(405).json({error:"Method not allowed"});
 }catch(e){console.error("admin event submissions:",e.message);return res.status(500).json({error:"Could not process event request."});}
});
