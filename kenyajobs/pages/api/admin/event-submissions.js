import crypto from "crypto";
import {requireAdmin} from "@/lib/adminAuth";
import {query} from "@/lib/db";
import {getPackage} from "@/lib/packages";
const slugify=s=>String(s||"event").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,70)||"event";
export default requireAdmin(async function handler(req,res){
 try{
  if(req.method==="GET"){const {rows}=await query("SELECT * FROM event_submissions ORDER BY created_at DESC LIMIT 200");return res.status(200).json(rows);}
  if(req.method==="POST"){
   const id=Number(req.body?.id);if(!Number.isInteger(id)||id<1)return res.status(400).json({error:"Valid event request ID required."});
   const found=await query("SELECT * FROM event_submissions WHERE id=$1 AND status='pending'",[id]),first=found.rows[0];if(!first)return res.status(404).json({error:"Pending event request not found."});
   if(req.body?.paymentConfirmed!==true)return res.status(409).json({error:"Confirm payment before publishing this paid promotion."});
   const group=first.group_key,items=group?(await query("SELECT * FROM event_submissions WHERE group_key=$1 AND status='pending' ORDER BY id",[group])).rows:[first];
   const p=getPackage("events",first.package_code),expected=Number(first.package_event_count||1);
   if(!p||items.length!==expected)return res.status(409).json({error:"The event bundle is incomplete or its package is invalid. Review it before publishing."});
   const published=[];
   for(const s of items){
    const eventId="event-"+crypto.randomUUID(),slug=slugify(s.title)+"-"+crypto.randomBytes(3).toString("hex");
    const {rows}=await query(`INSERT INTO events(id,title,slug,organiser,event_type,event_date,start_time,end_time,venue,location,description,ticket_price,registration_url,poster_url,website,package_code,package_price,package_started_at,package_expires_at,featured_until,promotions_allowed,source_submission_id)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,now(),now()+($18 * interval '1 day'),CASE WHEN $19>0 THEN now()+($19 * interval '1 day') ELSE NULL END,$20,$21)
     ON CONFLICT(source_submission_id) WHERE source_submission_id IS NOT NULL DO NOTHING RETURNING *`,
     [eventId,s.title,slug,s.organiser,s.event_type,s.event_date,s.start_time,s.end_time,s.venue,s.location,s.description,s.ticket_price,s.registration_url,s.poster_url,s.website,p.code,p.price,p.durationDays,p.limits.featuredDays,p.limits.promotions,s.id]);
    const event=rows[0]||(await query("SELECT * FROM events WHERE source_submission_id=$1",[s.id])).rows[0];if(!event)throw new Error("Could not publish event "+s.id);published.push(event);
   }
   if(group)await query("UPDATE event_submissions SET status='approved',payment_status='confirmed',event_id=events.id,reviewed_at=now() FROM events WHERE event_submissions.id=events.source_submission_id AND event_submissions.group_key=$1 AND event_submissions.status='pending'",[group]);
   else await query("UPDATE event_submissions SET status='approved',payment_status='confirmed',event_id=$2,reviewed_at=now() WHERE id=$1",[id,published[0].id]);
   return res.status(200).json({ok:true,events:published,event:published[0]});
  }
  if(req.method==="PATCH"){const b=req.body||{},id=Number(b.id);if(!Number.isInteger(id)||id<1)return res.status(400).json({error:"Valid request ID required."});await query("UPDATE event_submissions SET admin_notes=$2,payment_status=$3 WHERE id=$1",[id,String(b.adminNotes||"").trim().slice(0,2000),b.paymentStatus==="confirmed"?"confirmed":"awaiting_confirmation"]);return res.status(200).json({ok:true});}
  if(req.method==="DELETE"){const id=Number(req.body?.id);if(!Number.isInteger(id)||id<1)return res.status(400).json({error:"Valid request ID required."});const r=await query("SELECT group_key FROM event_submissions WHERE id=$1",[id]);if(r.rows[0]?.group_key)await query("UPDATE event_submissions SET status='rejected',reviewed_at=now() WHERE group_key=$1 AND status='pending'",[r.rows[0].group_key]);else await query("UPDATE event_submissions SET status='rejected',reviewed_at=now() WHERE id=$1 AND status='pending'",[id]);return res.status(200).json({ok:true});}
  return res.status(405).json({error:"Method not allowed"});
 }catch(e){console.error("admin event submissions:",e.message);return res.status(500).json({error:"Could not process event bundle."});}
});
