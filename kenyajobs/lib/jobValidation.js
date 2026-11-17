// Shared quality gate for every public job feed and social publishing route.
// This is a conservative filter: listings without a recognisable role title or
// that advertise non-employment opportunities are withheld from public results.
const NON_JOB_TITLE = /\b(scholarships?|bursar(?:y|ies)|fellowships?|grants?|funding|competitions?|awards?|prizes?|conferences?|webinars?|summits?|workshops?|events?|bootcamps?|training|courses?|mentorship|exchange programmes?|exchange programs?|calls for proposals|tenders?|rfp|rfq|procurement|hackathons?|essay contests?|travel grants?|career fairs?|internship fairs?)\b/i;
const NON_JOB_CONTEXT = /\b(scholarship|bursar(?:y|ies)|fellowship|grant|funding opportunity|competition|award|prize|conference|webinar|summit|workshop|bootcamp|training programme|training program|online course|mentorship programme|mentorship program|exchange programme|exchange program|call for proposals|tender|procurement notice|hackathon|essay contest|travel grant)\b/i;
const ROLE_TITLE = /\b(accountant|accounting|administrator|analyst|architect|assistant|associate|auditor|barista|chef|cashier|clerk|consultant|coordinator|counsell?or|customer service|data entry|designer|developer|devops|driver|editor|electrician|engineer|executive|finance officer|guard|hr officer|human resource|inspector|lecturer|lawyer|legal officer|machine operator|manager|mechanic|nurse|officer|operator|pharmacist|photographer|plumber|procurement officer|professor|receptionist|researcher|sales (?:representative|executive|officer|manager)|scientist|secretary|security officer|social worker|supervisor|technician|therapist|tutor|teacher|doctor|dentist|midwife|veterinarian|waiter|waitress|writer|intern|internship|trainee|caregiver| cleaner|cook|housekeeper|welder|surveyor|technologist|specialist|strategist|account manager|project manager|product manager|business development|marketing|human resources|software|frontend|backend|full.stack|quality assurance|qa engineer|support engineer|recruiter|legal assistant|laboratory|lab technician|phlebotomist|pharmacy|community health|clinical|medical|research assistant|field officer|programme officer|program officer|monitoring and evaluation|m&e officer|logistics|supply chain|procurement|communications|journalist|content creator|copywriter|proofreader|translator|interpreter|architectural|civil|mechanical|electrical|quantity surveyor|site supervisor|construction|security|cleaner|salesperson|shop attendant|storekeeper|warehouse|waiter|receptionist)\b/i;
const CLEAR_HIRING = /\b(job vacancy|vacanc(?:y|ies)|now hiring|we are hiring|we're hiring|recruit(?:ing|ment)|employment opportunity|job opportunity|apply for (?:the )?(?:position|role|job)|submit (?:your )?application|applications are (?:open|invited)|full[- ]time|part[- ]time|permanent position|contract position|employment type|job description|key responsibilities|job requirements|salary range|remuneration|internship opportunity|internship position|graduate trainee)\b/i;

export function getEmploymentRejectionReason(job = {}) {
  const strip = (value) => String(value || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
  const title = strip(job.title || job.job_title || job.name);
  const description = strip(job.description || job.job_description || job.contents || job.content);
  const type = strip(job.type || job.job_type || job.employment_type).toLowerCase();
  const combined = title + " " + description;
  if (!title) return "missing_title";
  if (NON_JOB_TITLE.test(title)) return "non_job_title";
  if (NON_JOB_CONTEXT.test(combined) && !CLEAR_HIRING.test(title)) return "non_job_content";
  if (!ROLE_TITLE.test(title) && !/\b(internship|graduate trainee|apprentice|apprenticeship)\b/i.test(type)) return "no_recognisable_job_role";
  // For ambiguous titles, require explicit hiring language. Recognisable role
  // titles from job-board APIs are accepted unless the content is non-employment.
  if (!ROLE_TITLE.test(title) && !CLEAR_HIRING.test(combined)) return "no_hiring_evidence";
  return "";
}

export function isEmploymentVacancy(job = {}) {
  return !getEmploymentRejectionReason(job);
}

export function filterEmploymentVacancies(jobs = []) {
  return (Array.isArray(jobs) ? jobs : []).filter(isEmploymentVacancy);
}
