// End-to-end checks for job numbers, structured details and in-platform
// applications. Needs `npm run build` and TEST_DATABASE_URL (a database that
// has had `npm run db:migrate` applied). Skipped - not passed - otherwise.
import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";

const built = fs.existsSync(new URL("../.next/BUILD_ID", import.meta.url));
const DB = process.env.TEST_DATABASE_URL;
const skip = (!built && "run `npm run build` first") || (!DB && "TEST_DATABASE_URL not set (database integration NOT run)");
const PDF = Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n");
let base, cookie, child, log = "";
const key = () => "test-key-" + Math.random().toString(36).slice(2).padEnd(20, "x");
const json = (method, path, body, headers = {}) => fetch(base + path, { method, headers: { "content-type": "application/json", ...headers }, body: body ? JSON.stringify(body) : undefined });
const admin = (method, path, body) => json(method, path, body, { cookie });
const apply = (jobId, over = {}) => json("POST", "/api/job-applications", {
  jobId, submissionKey: key(), firstName: "Wanjiru", lastName: "Kamau", email: `w${Math.random().toString(36).slice(2, 8)}@example.com`, phone: "+254712345678",
  acceptTerms: true, resume: { name: "My CV.pdf", data: PDF.toString("base64") }, ...over,
});

before(async () => {
  if (skip) return;
  const port = await new Promise((r) => { const s = net.createServer().listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });
  child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    cwd: new URL("..", import.meta.url).pathname, stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, DATABASE_URL: DB, ADMIN_PASSWORD: "test-admin-password" },
  });
  child.stdout.on("data", (d) => (log += d)); child.stderr.on("data", (d) => (log += d));
  for (let i = 0; i < 60 && !/Ready in/.test(log); i++) await new Promise((r) => setTimeout(r, 250));
  base = `http://127.0.0.1:${port}`;
  const login = await json("POST", "/api/admin/login", { password: "test-admin-password" });
  cookie = login.headers.get("set-cookie").split(";")[0];
});
after(() => child?.kill());

const platformJob = { title: "Social Media Manager", company: "Ubetter Technology", description: "We are seeking a skilled Social Media Manager to run our social channels.", applicationMethod: "platform",
  workMode: "onsite", industry: "Energy", experienceLevel: "mid", salaryMin: 40000, salaryMax: 50000, skills: "Paid adverts, Video editing, paid adverts",
  requiredDocuments: ["portfolio"], applicationDeadline: "2099-01-01", location: "Nairobi, Kenya", categories: ["general"] };
let job, external;

test("admin creates a platform job: numbered, structured, no external URL needed", { skip }, async () => {
  const res = await admin("POST", "/api/admin/jobs", platformJob);
  assert.equal(res.status, 201);
  job = await res.json();
  assert.match(job.jobRef, /^JH-\d+$/);
  assert.equal(job.applicationMethod, "platform");
  assert.equal(job.url, `/job/${job.id}`);
  assert.equal(job.salary, "KES 40,000 - 50,000 / month");
  assert.deepEqual(job.skills, ["Paid adverts", "Video editing"]);
  assert.deepEqual(job.requiredDocuments, ["resume", "portfolio"]);
  assert.equal(job.workMode, "onsite");
  const ext = await admin("POST", "/api/admin/jobs", { title: "Driver", company: "Acme", description: "We are seeking a reliable driver. Apply now.", url: "https://acme.co.ke/apply", categories: ["general"] });
  external = await ext.json();
  assert.equal(ext.status, 201);
  assert.equal(external.jobNumber, job.jobNumber + 1, "numbers are sequential");
  assert.equal(external.applicationMethod, "website");
});

test("admin job validation", { skip }, async () => {
  assert.equal((await admin("POST", "/api/admin/jobs", { ...platformJob, workMode: "moon" })).status, 400);
  assert.equal((await admin("POST", "/api/admin/jobs", { ...platformJob, salaryMin: 9, salaryMax: 1 })).status, 400);
  assert.equal((await admin("POST", "/api/admin/jobs", { title: "Accountant", company: "y", description: "We are seeking staff." })).status, 400, "non-platform jobs still need a URL");
  assert.equal((await json("POST", "/api/admin/jobs", platformJob)).status, 401, "no session");
});

test("public lookup exposes details; /j/<number> redirects", { skip }, async () => {
  const data = await (await fetch(`${base}/api/job-lookup/${job.id}`)).json();
  assert.equal(data.jobRef, job.jobRef); assert.equal(data.industry, "Energy");
  const redirect = await fetch(`${base}/j/${job.jobRef}`, { redirect: "manual" });
  assert.ok([302, 307].includes(redirect.status)); assert.equal(redirect.headers.get("location"), `/job/${job.id}`);
  assert.equal((await fetch(`${base}/j/JH-999999`, { redirect: "manual" })).status, 404);
  assert.equal((await fetch(`${base}/j/nonsense`, { redirect: "manual" })).status, 404);
});

test("application is validated, stored once, and the CV round-trips", { skip }, async () => {
  assert.equal((await apply(job.id)).status, 400, "portfolio is required for this job");
  const email = `ann${Math.random().toString(36).slice(2, 8)}@example.com`, k = key();
  const ok = await apply(job.id, { email, portfolio: "https://ann.dev", submissionKey: k });
  assert.equal(ok.status, 201);
  const { reference } = await ok.json(); assert.match(reference, /^APP-\d+$/);
  assert.equal((await apply(job.id, { email, portfolio: "https://ann.dev" })).status, 409, "one application per email per job");
  const retry = await apply(job.id, { email, portfolio: "https://ann.dev", submissionKey: k });
  assert.equal(retry.status, 200); assert.equal((await retry.json()).reference, reference, "same key is idempotent");

  const bad = (over, status, msg) => apply(job.id, { portfolio: "https://p.dev", ...over }).then((r) => assert.equal(r.status, status, msg));
  await bad({ resume: { name: "x.pdf", data: Buffer.from("not a pdf at all").toString("base64") } }, 400, "non-PDF content");
  await bad({ resume: { name: "x.pdf", data: Buffer.concat([Buffer.from("%PDF-"), Buffer.alloc(3 * 1024 * 1024)]).toString("base64") } }, 400, "over 3 MB");
  await bad({ resume: undefined }, 400, "no resume");
  await bad({ acceptTerms: false }, 400, "terms");
  await bad({ phone: "0712" }, 400, "phone");
  await bad({ email: "nope" }, 400, "email");
  await bad({ linkedin: "javascript:alert(1)" }, 400, "unsafe link");
  await bad({ jobId: external.id }, 400, "job that applies elsewhere");
  await bad({ jobId: "manual-does-not-exist" }, 404, "unknown job");
  assert.deepEqual(await (await apply(job.id, { website: "bot" })).json(), { ok: true, reference: "received" }, "honeypot");

  const list = await (await admin("GET", `/api/admin/applications?q=${email}`)).json();
  assert.equal(list.length, 1); assert.equal(Number(list[0].job_number), job.jobNumber); assert.equal(list[0].email, email);
  assert.equal((await fetch(`${base}/api/admin/applications`)).status, 401);
  assert.equal((await fetch(`${base}/api/admin/applications/${list[0].id}/resume`)).status, 401, "CV is private");
  const cv = await fetch(`${base}/api/admin/applications/${list[0].id}/resume`, { headers: { cookie } });
  assert.equal(cv.headers.get("content-type"), "application/pdf");
  assert.ok(Buffer.from(await cv.arrayBuffer()).equals(PDF), "downloaded CV is byte-identical");

  assert.equal((await admin("PATCH", "/api/admin/applications", { id: list[0].id, status: "shortlisted", adminNotes: "Strong" })).status, 200);
  assert.equal((await admin("PATCH", "/api/admin/applications", { id: list[0].id, status: "bogus" })).status, 400);
  assert.equal((await admin("PATCH", "/api/admin/applications", { id: "x" })).status, 400);
  assert.equal((await admin("DELETE", "/api/admin/applications", { id: list[0].id })).status, 200);
  assert.equal((await (await admin("GET", `/api/admin/applications?q=${email}`)).json()).length, 0);
});

test("closed jobs reject applications", { skip }, async () => {
  const closed = await (await admin("POST", "/api/admin/jobs", { ...platformJob, title: "Accountant", applicationDeadline: "2020-01-01", requiredDocuments: [] })).json();
  assert.equal((await apply(closed.id)).status, 410);
});

test("deleting a job keeps its applications", { skip }, async () => {
  const j = await (await admin("POST", "/api/admin/jobs", { ...platformJob, title: "Temp Assistant", requiredDocuments: [] })).json();
  const keepEmail = `keep${Math.random().toString(36).slice(2, 8)}@example.com`;
  const r = await apply(j.id, { email: keepEmail }); assert.equal(r.status, 201);
  assert.equal((await admin("DELETE", `/api/admin/jobs/${j.id}`)).status < 300, true);
  const left = await (await admin("GET", `/api/admin/applications?q=${keepEmail}`)).json();
  assert.equal(left.length, 1); assert.equal(left[0].job_id, null); assert.equal(left[0].job_title, "Temp Assistant");
});

test("employer submission with platform apply + details carries through approval", { skip }, async () => {
  const sub = await json("POST", "/api/job-submissions", {
    title: "Marketing Manager", company: "Savanna Foods", contactName: "Jane", email: "jane@savanna.co.ke", phone: "+254712345678",
    location: "Nairobi", type: "Full-time", description: "We are seeking a Marketing Manager to lead campaigns across Kenya. Apply now.",
    packageCode: "job_basic", categories: ["general"], submissionKey: key(), applicationMethod: "platform",
    workMode: "hybrid", industry: "FMCG", experienceLevel: "senior", salaryMin: 120000, salaryMax: 180000, skills: ["Brand strategy", "Analytics"], requiredDocuments: ["linkedin"],
  });
  const created = await sub.json();
  assert.equal(sub.status, 201, JSON.stringify(created));
  const bad = await json("POST", "/api/job-submissions", { title: "Marketing Manager", company: "x", contactName: "J", email: "j@x.co", phone: "+254712345678", description: "We are seeking staff. Apply now.", packageCode: "job_basic", categories: ["general"], submissionKey: key(), applicationMethod: "platform", workMode: "moon" });
  assert.equal(bad.status, 400);

  const approve = await admin("POST", "/api/admin/job-submissions", { id: created.reference, paymentConfirmed: true });
  assert.equal(approve.status, 200, await approve.clone().text());
  const jobs = await (await admin("GET", "/api/admin/jobs")).json();
  const made = jobs.find((j) => j.title === "Marketing Manager" && j.company === "Savanna Foods");
  assert.ok(made, "job was created on approval");
  assert.equal(made.applicationMethod, "platform"); assert.equal(made.url, `/job/${made.id}`);
  assert.equal(made.workMode, "hybrid"); assert.equal(made.industry, "FMCG"); assert.equal(made.experienceLevel, "senior");
  assert.equal(made.salary, "KES 120,000 - 180,000 / month"); assert.deepEqual(made.skills, ["Brand strategy", "Analytics"]);
  assert.deepEqual(made.requiredDocuments, ["resume", "linkedin"]);
  assert.match(made.jobRef, /^JH-\d+$/);
});

test("admin jobs are queued for Telegram and WhatsApp with a link to apply on the site", { skip }, async () => {
  const queueFor = async (jobId) => (await (await admin("GET", "/api/admin/distribution")).json()).queue.filter((q) => q.job_id === jobId);
  const base = { ...platformJob, requiredDocuments: [] };

  // A town that is not in the auto-import location list must still be shared.
  const kericho = await (await admin("POST", "/api/admin/jobs", { ...base, title: "Field Officer", location: "Kericho" })).json();
  const items = await queueFor(kericho.id);
  assert.deepEqual(items.map((q) => q.channel).sort(), ["telegram", "whatsapp"]);
  const msg = items[0].message;
  assert.ok(msg.includes(`/job/${kericho.id}`), "links to the job page on the site");
  assert.ok(msg.includes("APPLY DIRECTLY ON JOBS HUB KENYA"), "says candidates can apply on the site");
  assert.ok(msg.includes(kericho.jobRef), "includes the job number");
  assert.match(msg, /Deadline: .*2099/);
  assert.match(msg, /KES 40,000 - 50,000/);
  assert.ok(msg.startsWith("📢 KENYA JOB"));

  // An external-apply job is shared too, but does not claim on-site applications.
  const ext = await (await admin("POST", "/api/admin/jobs", { title: "Sales Executive", company: "Acme", description: "We are seeking a sales executive. Apply now.", url: "https://acme.co.ke/apply-sales-" + Math.random().toString(36).slice(2, 8), location: "Mombasa", categories: ["general"] })).json();
  const extItems = await queueFor(ext.id);
  assert.equal(extItems.length, 2); assert.ok(!extItems[0].message.includes("APPLY DIRECTLY"));

  // The owner can opt a job out of sharing; closed jobs are never shared.
  const quiet = await (await admin("POST", "/api/admin/jobs", { ...base, title: "Quiet Accountant", shareToChannels: false })).json();
  assert.equal((await queueFor(quiet.id)).length, 0);
  const closed = await (await admin("POST", "/api/admin/jobs", { ...base, title: "Closed Accountant", applicationDeadline: "2020-01-01" })).json();
  assert.equal((await queueFor(closed.id)).length, 0);
});
