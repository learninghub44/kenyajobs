import crypto from "crypto";
import { query } from "@/lib/db";
import { createJob } from "@/lib/manualJobs";
const hash=(value)=>crypto.createHash("sha256").update(value).digest("hex");
const clip=(value,max=5000)=>String(value||"").trim().slice(0,max);
function validUrl(value){try{const u=new URL(value);return ["http:","https:"].includes(u.protocol)&&Boolean(u.hostname)&&!u.username&&!u.password;}catch{return false;}}
export default async function handler(req,res){
 if(req.method==="GET"){
  res.setHeader("Cache-Control","private, no-store, max-age=0");
  const token=String(req.query.invite||"");
  if(!/^[A-Za-z0-9_-]{40,60}$/.test(token))return res.status(404).json({error:"This posting link is invalid or expired."});
  try{const {rows}=await query("SELECT id,label,auto_publish,max_uses,uses,expires_at FROM job_posting_links WHERE token_hash=$1 AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at>now()) AND uses<max_uses",[hash(token)]);
   if(!rows[0])return res.status(404).json({error:"This posting link is invalid, expired, or has reached its usage limit."});
   return res.status(200).json({label:rows[0].label,autoPublish:rows[0].auto_publish,remaining:rows[0].max_uses-rows[0].uses});
  }catch(e){return res.status(503).json({error:"Could not verify this posting link."});}
 }
 if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 const b=req.body||{};
 // Honeypot field catches basic automated form submissions.
 if(clip(b.website,200))return res.status(200).json({ok:true,reference:"received"});
 const fields={title:clip(b.title,180),company:clip(b.company,180),contactName:clip(b.contactName,120),email:clip(b.email,254).toLowerCase(),location:clip(b.location,180)||"Kenya",type:clip(b.type,80)||"Full-time",salary:clip(b.salary,120),description:clip(b.description,12000),requirements:clip(b.requirements,8000),responsibilities:clip(b.responsibilities,8000),qualifications:clip(b.qualifications,5000),experience:clip(b.experience,300),education:clip(b.education,500),benefits:clip(b.benefits,5000),applicationDeadline:clip(b.applicationDeadline,30),url:clip(b.url,2048),applicationInstructions:clip(b.applicationInstructions,5000),companyWebsite:clip(b.companyWebsite,2048),companyLogo:clip(b.companyLogo,2048),categories:Array.isArray(b.categories)?[...new Set(b.categories.filter(x=>["remote","entry","graduate","wfh","general"].includes(x)))]:[]};
 for(const key of ["title","company","contactName","email","description","url"])if(!fields[key])return res.status(400).json({error:key+" is required."});
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))return res.status(400).json({error:"Enter a valid contact email."});
 if(!validUrl(fields.url)|| (fields.companyWebsite&&!validUrl(fields.companyWebsite)) || (fields.companyLogo&&!validUrl(fields.companyLogo)))return res.status(400).json({error:"Use valid http or https links for application, company website and logo."});
 if(fields.applicationDeadline&&!/^\d{4}-\d{2}-\d{2}$/.test(fields.applicationDeadline))return res.status(400).json({error:"Application deadline must use YYYY-MM-DD."});
 try{
  const forwarded=String(req.headers["x-forwarded-for"]||"").split(",")[0].trim();
  const ip=forwarded||req.socket?.remoteAddress||"unknown";
  const ipHash=hash((process.env.ADMIN_SESSION_SECRET||process.env.ADMIN_PASSWORD||"jobs-hub-rate-limit")+":"+ip);
  const rate=await query("SELECT count(*)::int AS total FROM job_submissions WHERE ip_hash=$1 AND created_at>now()-interval '1 hour'",[ipHash]);
  if(rate.rows[0]?.total>=8)return res.status(429).json({error:"Too many submissions. Please try again later."});
  const token=String(b.postingToken||"");let link=null;
  if(token){
   if(!/^[A-Za-z0-9_-]{40,60}$/.test(token))return res.status(404).json({error:"This posting link is invalid or expired."});
   const reserved=await query("UPDATE job_posting_links SET uses=uses+1 WHERE token_hash=$1 AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at>now()) AND uses<max_uses RETURNING id,label,auto_publish",[hash(token)]);
   if(!reserved.rows[0])return res.status(404).json({error:"This posting link is invalid, expired, or has reached its usage limit."});
   link=reserved.rows[0];
  }
  let job=null;
  if(link?.auto_publish){
   job=await createJob({title:fields.title,company:fields.company,location:fields.location,type:fields.type,salary:fields.salary,description:fields.description,requirements:fields.requirements,responsibilities:fields.responsibilities,qualifications:fields.qualifications,experience:fields.experience,education:fields.education,benefits:fields.benefits,categories:fields.categories,applicationDeadline:fields.applicationDeadline,url:fields.url,applicationInstructions:fields.applicationInstructions,companyWebsite:fields.companyWebsite,companyLogo:fields.companyLogo,published:true});
  }
  const status=job?"approved":"pending";
  const {rows}=await query(`INSERT INTO job_submissions(title,company,contact_name,email,location,type,salary,description,requirements,responsibilities,qualifications,experience,education,benefits,application_deadline,application_url,application_instructions,company_website,company_logo,categories,status,job_id,posting_link_id,ip_hash,reviewed_at)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25) RETURNING id`,
   [fields.title,fields.company,fields.contactName,fields.email,fields.location,fields.type,fields.salary||null,fields.description,fields.requirements,fields.responsibilities,fields.qualifications,fields.experience,fields.education,fields.benefits,fields.applicationDeadline||null,fields.url,fields.applicationInstructions,fields.companyWebsite||null,fields.companyLogo||null,fields.categories,status,job?.id||null,link?.id||null,ipHash,job?new Date():null]);
  return res.status(201).json({ok:true,reference:rows[0].id,jobId:job?.id||null,status,autoPublished:Boolean(job)});
 }catch(e){console.error("job submission:",e.message);return res.status(503).json({error:"We could not save this job. Please try again later."});}
}
export const config={api:{bodyParser:{sizeLimit:"1mb"}}};