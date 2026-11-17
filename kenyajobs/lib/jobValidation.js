// Conservative employment-only quality gate shared by public feeds and social publishing.
const NON_JOB_TITLE = /\b(scholarships?|bursar(?:y|ies)|fellowships?|grants?|funding|competitions?|awards?|prizes?|conferences?|webinars?|summits?|workshops?|events?|bootcamps?|training|courses?|mentorship|calls for proposals|tenders?|rfp|rfq|procurement|hackathons?|essay contests?|travel grants?|career fairs?|how to|top \d+|steps to|guide to|tips for|why (?:you|employers)|what employers|skills employers|mistakes|failure|success|explained|checklist|compliance|pay[e]?|nssf|sha contributions?)\b/i;
const NON_JOB_CONTEXT = /\b(scholarship|fellowship|grant|funding opportunity|competition|conference|webinar|summit|workshop|bootcamp|training programme|training program|online course|mentorship programme|call for proposals|tender|procurement notice|hackathon|career advice|how to recruit|how to hire|recruitment tips|employer guide|payroll compliance|statutory remittance|skills employers look for)\b/i;
const ROLE_TITLE = /\b(accountant|administrator|analyst|architect|assistant|associate|auditor|barista|chef|cashier|clerk|consultant|coordinator|counsell?or|customer service (?:officer|representative|agent|assistant)|data entry|designer|developer|devops|driver|editor|electrician|engineer|executive|finance officer|guard|hr officer|human resource|inspector|lecturer|lawyer|legal officer|machine operator|manager|mechanic|nurse|officer|operator|pharmacist|photographer|plumber|procurement officer|professor|receptionist|researcher|sales (?:representative|executive|officer|manager)|scientist|secretary|security officer|social worker|supervisor|technician|therapist|tutor|teacher|doctor|dentist|midwife|veterinarian|waiter|waitress|writer|intern|trainee|caregiver|cleaner|cook|housekeeper|welder|surveyor|technologist|specialist|strategist|project manager|product manager|business development|marketing officer|human resources|software|frontend|backend|quality assurance|support engineer|recruiter|laboratory|clinical|medical|field officer|programme officer|program officer|logistics|supply chain|communications|journalist|content creator|copywriter|translator|interpreter|quantity surveyor|site supervisor|construction|shop attendant|storekeeper|warehouse)\b/i;
const HIRING_EVIDENCE = /\b(we are (?:seeking|looking for|hiring|recruiting)|we're (?:seeking|looking for|hiring)|is seeking to recruit|invites applications|applications are invited|apply now|submit (?:your )?(?:cv|resume|application)|send (?:your )?(?:cv|resume)|job vacancy|vacancies|employment opportunity|position available|role available|join our team|to fill the position|recruitment for|job description|key responsibilities|job requirements|how to apply)\b/i;
const ARTICLE_SIGNALS = /\b(the post .* appeared first|read more|subscribe|in this article|this article|here are \d+|top \d+|steps to|tips for|guide to|learn how|we explain|explained|what you need to know|employers look for|how to recruit|how to hire|payroll|compliance|remit paye|nssf and sha)\b/i;
function plain(value) {
 return String(value || "").replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]*>/g," ")
 .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)))
 .replace(/&nbsp;|&#160;/gi," ").replace(/&amp;/gi,"&").replace(/&quot;/gi,'"').replace(/&#0?39;|&apos;/gi,"'").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/\s+/g," ").trim();
}
export function getEmploymentRejectionReason(job = {}) {
 const title=plain(job.title||job.job_title||job.name);
 const description=plain(job.description||job.job_description||job.contents||job.content);
 const type=plain(job.type||job.job_type||job.employment_type).toLowerCase();
 const combined=title+" "+description;
 if(!title) return "missing_title";
 if(NON_JOB_TITLE.test(title)) return "non_job_title";
 if(NON_JOB_CONTEXT.test(combined)) return "non_job_content";
 if(ARTICLE_SIGNALS.test(title)) return "article_not_vacancy";
 if(!ROLE_TITLE.test(title) && !/\b(internship|graduate trainee|apprentice|apprenticeship)\b/i.test(type)) return "no_recognisable_job_role";
 // Social queue accepts only explicit vacancy evidence. A role-like blog headline is not enough.
 if(!HIRING_EVIDENCE.test(combined) && !/\b(internship|graduate trainee|apprentice|apprenticeship)\b/i.test(type)) return "no_hiring_evidence";
 return "";
}
export function isEmploymentVacancy(job={}) { return !getEmploymentRejectionReason(job); }
export function filterEmploymentVacancies(jobs=[]) { return (Array.isArray(jobs)?jobs:[]).filter(isEmploymentVacancy); }
