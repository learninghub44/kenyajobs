import {query} from "@/lib/db";
export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 const b=req.body||{};
 const required=["title","company","contactName","email","description","url"];
 for(const key of required)if(!String(b[key]||"").trim())return res.status(400).json({error:key+" is required."});
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(b.email)))return res.status(400).json({error:"Enter a valid contact email."});
 try{const u=new URL(String(b.url));if(!["http:","https:"].includes(u.protocol))throw Error();}catch{return res.status(400).json({error:"Enter a valid application URL."});}
 try{const {rows}=await query(`INSERT INTO job_submissions(title,company,contact_name,email,location,type,salary,description,requirements,responsibilities,application_deadline,application_url,application_instructions)
 VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
 [b.title.trim(),b.company.trim(),b.contactName.trim(),b.email.trim().toLowerCase(),b.location||"Kenya",b.type||"Full-time",b.salary||null,b.description,b.requirements||"",b.responsibilities||"",b.applicationDeadline||null,b.url,b.applicationInstructions||""]);
 return res.status(201).json({ok:true,reference:rows[0].id});
 }catch(e){console.error("job submission:",e.message);return res.status(503).json({error:"We could not save your submission. Please try again later."});}
}