import crypto from "crypto";
import { query } from "@/lib/db";
import { getPackage } from "@/lib/packages";
const clip=(v,n=5000)=>String(v||"").trim().slice(0,n);
const validUrl=(v)=>{if(!v)return true;try{const u=new URL(v);return ["http:","https:"].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}};
export default async function handler(req,res){
 if(req.method==="GET"){
  res.setHeader("Cache-Control","no-store");
  const fields="id,title,slug,organiser,event_type,event_date,start_time,end_time,venue,location,description,ticket_price,registration_url,poster_url,website,package_code,package_price,package_expires_at,featured_until";
  if(req.query.slug){const {rows}=await query("SELECT "+fields+" FROM events WHERE slug=$1 AND published=true AND package_expires_at>now() AND event_date>=CURRENT_DATE",[String(req.query.slug)]);return rows[0]?res.status(200).json(rows[0]):res.status(404).json({error:"Event not found."});}
  const {rows}=await query("SELECT "+fields+" FROM events WHERE published=true AND package_expires_at>now() AND event_date>=CURRENT_DATE ORDER BY COALESCE(featured_until>now(),false) DESC,event_date ASC LIMIT 100");
  return res.status(200).json(rows);
 }
 if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 const b=req.body||{};
 const submissionKey=clip(b.submissionKey,80);if(!/^[A-Za-z0-9_-]{20,80}$/.test(submissionKey))return res.status(400).json({error:"Refresh the form and try submitting again."});
 if(clip(b.websiteTrap,200))return res.status(200).json({ok:true,reference:"received"});
 const f={title:clip(b.title,160),organiser:clip(b.organiser,180),contactName:clip(b.contactName,120),email:clip(b.email,254).toLowerCase(),phone:clip(b.phone,30),eventType:clip(b.eventType,80)||"Other",eventDate:clip(b.eventDate,20),startTime:clip(b.startTime,10),endTime:clip(b.endTime,10),venue:clip(b.venue,180),location:clip(b.location,180)||"Kenya",description:clip(b.description,10000),ticketPrice:clip(b.ticketPrice,120),registrationUrl:clip(b.registrationUrl,2048),posterUrl:clip(b.posterUrl,2048),website:clip(b.website,2048),packageCode:clip(b.packageCode,50)};
 const required=["title","organiser","contactName","email","phone","eventDate","description","packageCode"];
 for(const k of required)if(!f[k])return res.status(400).json({error:k+" is required."});
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))return res.status(400).json({error:"Enter a valid email address."});
 if(!/^\d{4}-\d{2}-\d{2}$/.test(f.eventDate)||f.eventDate<new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Nairobi"}).format(new Date()))return res.status(400).json({error:"Choose a valid future event date."});
 if(!validUrl(f.registrationUrl)||!validUrl(f.posterUrl)||!validUrl(f.website))return res.status(400).json({error:"Use valid http or https URLs."});
 const p=getPackage("events",f.packageCode);if(!p)return res.status(400).json({error:"Choose a valid event promotion package."});
 if(f.description.length>p.limits.description)return res.status(400).json({error:"Your event description exceeds the "+p.limits.description+" character limit for this package."});
 const digits=f.phone.replace(/\D/g,"");if(digits.length<9||digits.length>15)return res.status(400).json({error:"Enter a valid phone number with country code."});
 try{
  const existing=await query("SELECT id FROM event_submissions WHERE submission_key=$1",[submissionKey]);
  if(existing.rows[0])return res.status(200).json({ok:true,reference:existing.rows[0].id,duplicate:true,package:{name:p.name,price:p.price,durationDays:p.durationDays}});
  const ip=String(req.headers["x-forwarded-for"]||req.socket?.remoteAddress||"unknown").split(",")[0];
  const ipHash=crypto.createHash("sha256").update((process.env.ADMIN_SESSION_SECRET||process.env.ADMIN_PASSWORD||"events-rate-limit")+":"+ip).digest("hex");
  const rate=await query("SELECT count(*)::int AS total FROM event_submissions WHERE ip_hash=$1 AND created_at>now()-interval '1 hour'",[ipHash]);
  if(rate.rows[0]?.total>=5)return res.status(429).json({error:"Too many event requests. Please try again later."});
  const {rows}=await query(`INSERT INTO event_submissions(title,organiser,contact_name,email,phone,event_type,event_date,start_time,end_time,venue,location,description,ticket_price,registration_url,poster_url,website,ip_hash,submission_key,package_code,package_price,package_duration_days)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) ON CONFLICT(submission_key) WHERE submission_key IS NOT NULL DO NOTHING RETURNING id`,
   [f.title,f.organiser,f.contactName,f.email,f.phone,f.eventType,f.eventDate,f.startTime||null,f.endTime||null,f.venue||null,f.location,f.description,f.ticketPrice||null,f.registrationUrl||null,f.posterUrl||null,f.website||null,ipHash,submissionKey,p.code,p.price,p.durationDays]);
  if(!rows[0]){const duplicate=await query("SELECT id FROM event_submissions WHERE submission_key=$1",[submissionKey]);if(duplicate.rows[0])return res.status(200).json({ok:true,reference:duplicate.rows[0].id,duplicate:true,package:{name:p.name,price:p.price,durationDays:p.durationDays}});return res.status(409).json({error:"This event request is already being processed."});}
  return res.status(201).json({ok:true,reference:rows[0].id,package:{name:p.name,price:p.price,durationDays:p.durationDays},message:"The events team will contact you to confirm payment and schedule your promotion."});
 }catch(e){console.error("event submission:",e.message);return res.status(503).json({error:"We could not save this event request. Please try again later."});}
}
export const config={api:{bodyParser:{sizeLimit:"1mb"}}};
