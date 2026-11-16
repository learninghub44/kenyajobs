import {requireAdmin} from "@/lib/adminAuth";
import {query} from "@/lib/db";
import {createJob} from "@/lib/manualJobs";
import {getPackage} from "@/lib/packages";
export default requireAdmin(async function handler(req,res){
 try{
  if(req.method==="GET"){const {rows}=await query("SELECT * FROM job_submissions ORDER BY created_at DESC LIMIT 200");return res.status(200).json(rows);}
  if(req.method==="POST"){const id=Number((req.body||{}).id);if(!Number.isInteger(id)||id<1)return res.status(400).json({error:"Valid submission ID required."});
   const {rows}=await query("SELECT * FROM job_submissions WHERE id=$1 AND status='pending'",[id]);if(!rows[0])return res.status(404).json({error:"Pending submission not found."});
   const s=rows[0];if((req.body||{}).paymentConfirmed!==true)return res.status(409).json({error:"Confirm package payment before publishing this paid job."});
   const p=getPackage("jobs",s.package_code);if(!p)return res.status(400).json({error:"The selected package is unavailable. Review the request before publishing."});
   const existingJob=await query("SELECT * FROM manual_jobs WHERE source_submission_id=$1 LIMIT 1",[id]);
   if(existingJob.rows[0]){
    const existing=existingJob.rows[0];
    await query("UPDATE manual_jobs SET package_code=$2,package_price=$3,package_started_at=COALESCE(package_started_at,now()),package_expires_at=COALESCE(package_expires_at,now()+($4 * interval '1 day')),featured_until=CASE WHEN $5>0 THEN COALESCE(featured_until,now()+($5 * interval '1 day')) ELSE NULL END,renewal_status='active' WHERE id=$1",[existing.id,p.code,p.price,p.durationDays,p.limits.featuredDays]);
    await query("UPDATE job_submissions SET status='approved',payment_status='confirmed',reviewed_at=now(),job_id=$2 WHERE id=$1 AND status='pending'",[id,existing.id]);
    return res.status(200).json({ok:true,job:existing,recovered:true});
   }
   const job=await createJob({sourceSubmissionId:id,title:s.title,company:s.company,location:s.location,type:s.type,salary:s.salary,description:s.description,requirements:s.requirements,responsibilities:s.responsibilities,qualifications:s.qualifications,experience:s.experience,education:s.education,benefits:s.benefits,categories:s.categories,applicationDeadline:s.application_deadline,url:s.application_url,applicationInstructions:s.application_instructions,companyWebsite:s.company_website,companyLogo:s.company_logo,featured:p.limits.featuredDays>0,published:true});
   await query("UPDATE manual_jobs SET package_code=$2,package_price=$3,package_started_at=now(),package_expires_at=now()+($4 * interval '1 day'),featured_until=CASE WHEN $5>0 THEN now()+($5 * interval '1 day') ELSE NULL END,renewal_status='active',source_submission_id=$6 WHERE id=$1",[job.id,p.code,p.price,p.durationDays,p.limits.featuredDays,id]);
   await query("UPDATE job_submissions SET status='approved',payment_status='confirmed',reviewed_at=now(),job_id=$2 WHERE id=$1 AND status='pending'",[id,job.id]);return res.status(200).json({ok:true,job});
  }
  if(req.method==="DELETE"){const id=Number((req.body||{}).id);await query("UPDATE job_submissions SET status='rejected',reviewed_at=now() WHERE id=$1 AND status='pending'",[id]);return res.status(200).json({ok:true});}
  return res.status(405).json({error:"Method not allowed"});
 }catch(e){console.error("admin job submissions:",e.message);return res.status(500).json({error:"Could not process submission."});}
});