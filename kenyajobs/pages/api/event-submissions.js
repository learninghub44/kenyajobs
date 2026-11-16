import crypto from "crypto";
import {query,withTransaction} from "@/lib/db";
import {getPackage} from "@/lib/packages";
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
 const b=req.body||{},submissionKey=clip(b.submissionKey,80),events=Array.isArray(b.events)?b.events:[b];
 if(!/^[A-Za-z0-9_-]{20,80}$/.test(submissionKey))return res.status(400).json({error:"Refresh the form and try submitting again."});
 if(clip(b.websiteTrap,200))return res.status(200).json({ok:true,reference:"received"});
 const count=events.length,p=getPackage("events",clip(b.packageCode,50));
 if(!p||count!==p.listingLimit||count<1||count>10)return res.status(400).json({error:"The selected event bundle does not match the number of event forms."});
 const contact={organiser:clip(b.organiser,180),contactName:clip(b.contactName,120),email:clip(b.email,254).toLowerCase(),phone:clip(b.phone,30)};
 for(const k of ["organiser","contactName","email","phone"])if(!contact[k])return res.status(400).json({error:k+" is required."});
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email))return res.status(400).json({error:"Enter a valid email address."});
 const digits=contact.phone.replace(/\D/g,"");if(digits.length<9||digits.length>15)return res.status(400).json({error:"Enter a valid phone number with country code."});
 const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Nairobi"}).format(new Date());
 const prepared=[];
 for(let i=0;i<events.length;i++){const e=events[i]||{},f={title:clip(e.title,160),eventType:clip(e.eventType,80)||"Other",eventDate:clip(e.eventDate,20),startTime:clip(e.startTime,10),endTime:clip(e.endTime,10),venue:clip(e.venue,180),location:clip(e.location,180)||"Kenya",description:clip(e.description,5000),ticketPrice:clip(e.ticketPrice,120),registrationUrl:clip(e.registrationUrl,2048),posterUrl:clip(e.posterUrl,2048),website:clip(e.website,2048)};
  for(const k of ["title","eventDate","description"])if(!f[k])return res.status(400).json({error:"Event "+(i+1)+": "+k+" is required."});
  if(!/^\d{4}-\d{2}-\d{2}$/.test(f.eventDate)||f.eventDate<today)return res.status(400).json({error:"Event "+(i+1)+" must have a valid future date."});
  if(!validUrl(f.registrationUrl)||!validUrl(f.posterUrl)||!validUrl(f.website))return res.status(400).json({error:"Event "+(i+1)+" contains an invalid URL."});
  prepared.push(f);
 }
 try{
  const result=await withTransaction(async client=>{
   const groupKey=submissionKey;
   const existing=await client.query("SELECT id FROM event_submissions WHERE group_key=$1 ORDER BY id",[groupKey]);
   if(existing.rows.length)return {ids:existing.rows.map(x=>x.id),duplicate:true};
   const ip=String(req.headers["x-forwarded-for"]||req.socket?.remoteAddress||"unknown").split(",")[0];
   const ipHash=crypto.createHash("sha256").update((process.env.ADMIN_SESSION_SECRET||process.env.ADMIN_PASSWORD||"events-rate-limit")+":"+ip).digest("hex");
   const rate=await client.query("SELECT count(DISTINCT COALESCE(group_key,submission_key,id::text))::int AS total FROM event_submissions WHERE ip_hash=$1 AND created_at>now()-interval '1 hour'",[ipHash]);
   if(rate.rows[0]?.total>=5)throw Object.assign(new Error("Too many event requests. Please try again later."),{statusCode:429});
   const ids=[];
   for(let i=0;i<prepared.length;i++){const f=prepared[i],key=groupKey+"-"+(i+1);
    const {rows}=await client.query(`INSERT INTO event_submissions(title,organiser,contact_name,email,phone,event_type,event_date,start_time,end_time,venue,location,description,ticket_price,registration_url,poster_url,website,ip_hash,submission_key,package_code,package_price,package_duration_days,group_key,package_event_count)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23) RETURNING id`,
     [f.title,contact.organiser,contact.contactName,contact.email,contact.phone,f.eventType,f.eventDate,f.startTime||null,f.endTime||null,f.venue||null,f.location,f.description,f.ticketPrice||null,f.registrationUrl||null,f.posterUrl||null,f.website||null,ipHash,key,p.code,p.price,p.durationDays,groupKey,count]);
    ids.push(rows[0].id);
   }
   return {ids,duplicate:false};
  });
  return res.status(result.duplicate?200:201).json({ok:true,reference:result.ids[0],references:result.ids,duplicate:result.duplicate,package:{name:p.name,price:p.price,durationDays:p.durationDays,eventCount:count},message:"Your event bundle has been received. Our events team will contact you to confirm the total payment before publishing."});
 }catch(e){console.error("event submission:",e.message);return res.status(e.statusCode||503).json({error:e.statusCode===429?e.message:"We could not save the complete event bundle. Please try again later."});}
}
export const config={api:{bodyParser:{sizeLimit:"1mb"}}};
