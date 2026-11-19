import test from "node:test";
import assert from "node:assert/strict";
import { composeSalary, formatJobRef, parseJobRef, parseDeadline, isDeadlinePassed, sanitizeJobDetails } from "../lib/jobOptions.js";

test("job references format and parse both ways", () => {
  assert.equal(formatJobRef(1001), "JH-1001");
  assert.equal(formatJobRef(0), ""); assert.equal(formatJobRef(null), "");
  for (const v of ["JH-1001", "jh1001", " 1001 ", "jh 1001"]) assert.equal(parseJobRef(v), 1001, v);
  for (const v of ["abc", "", "JH-", "1e5x", "12345678901234"]) assert.equal(parseJobRef(v), null, v);
});

test("salary range text", () => {
  assert.equal(composeSalary({ salaryMin: 40000, salaryMax: 50000 }), "KES 40,000 - 50,000 / month");
  assert.equal(composeSalary({ salaryMin: 40000, salaryCurrency: "USD", salaryPeriod: "year" }), "USD From 40,000 / year");
  assert.equal(composeSalary({ salaryMax: 90000 }), "KES Up to 90,000 / month");
  assert.equal(composeSalary({ salaryMin: 5, salaryMax: 5 }), "KES 5 / month");
  assert.equal(composeSalary({}), "");
});

test("a plain-date deadline closes at the end of that day in Nairobi", () => {
  assert.equal(parseDeadline("2026-11-20").toISOString(), "2026-11-20T20:59:59.000Z");
  assert.equal(isDeadlinePassed("2026-11-20", new Date("2026-11-20T20:00:00Z")), false);
  assert.equal(isDeadlinePassed("2026-11-20", new Date("2026-11-20T21:30:00Z")), true);
  assert.equal(isDeadlinePassed("", new Date()), false);
  assert.equal(isDeadlinePassed("not a date", new Date()), false);
});

test("job details are normalised and validated; partial input stays partial", () => {
  assert.deepEqual(sanitizeJobDetails({ industry: "Energy" }), { industry: "Energy" });
  const full = sanitizeJobDetails({ workMode: "Hybrid", salaryMin: "40,000", salaryMax: 50000, skills: "SEO, Ads, seo,,", requiredDocuments: ["portfolio", "bogus"], experienceLevel: "MID" });
  assert.deepEqual(full, { workMode: "hybrid", salaryMin: 40000, salaryMax: 50000, skills: ["SEO", "Ads"], requiredDocuments: ["resume", "portfolio"], experienceLevel: "mid" });
  assert.equal(sanitizeJobDetails({ workMode: "" }).workMode, null);
  assert.equal(sanitizeJobDetails({ skills: Array.from({ length: 40 }, (_, i) => "s" + i) }).skills.length, 20);
  for (const bad of [{ workMode: "moon" }, { experienceLevel: "god" }, { salaryMin: -1 }, { salaryMin: "abc" }, { salaryMin: 9, salaryMax: 1 }, { salaryCurrency: "KESH" }, { salaryPeriod: "decade" }]) {
    assert.throws(() => sanitizeJobDetails(bad), Error, JSON.stringify(bad));
  }
});
