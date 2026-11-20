import test from "node:test";
import assert from "node:assert/strict";
import { resolveFreshJobs, getMaxAgeDays, getUndatedMaxAgeDays } from "../lib/jobFreshness.js";

const NOW = new Date("2026-11-20T09:00:00Z");
const daysAgo = (n) => new Date(NOW.getTime() - n * 86_400_000);
const run = (jobs, seen = {}) => resolveFreshJobs(jobs, new Map(Object.entries(seen)), { now: NOW });
const one = (job, seen) => run([{ id: "a", ...job }], seen)[0];

test("jobs stay for 30 days from the date the source posted them", () => {
  assert.equal(one({ date: daysAgo(5).toISOString() }).date, daysAgo(5).toISOString());
  assert.ok(one({ date: daysAgo(29).toISOString() }), "29 days old is still live");
  assert.equal(one({ date: daysAgo(31).toISOString() }), undefined, "31 days old is gone");
});

test("different date fields and formats are understood", () => {
  assert.ok(one({ publication_date: daysAgo(3).toISOString() }));
  assert.equal(one({ created_at: Math.floor(daysAgo(60).getTime() / 1000) }), undefined, "unix seconds are not read as 1970");
  assert.ok(one({ created_at: Math.floor(daysAgo(2).getTime() / 1000) }), "recent unix seconds are kept");
});

test("1970 / missing / garbage dates are undated: counted from first sighting, 14 days", () => {
  for (const bad of [0, "0", "1970-01-01", "1970-01-01T00:00:00Z", "garbage", null, undefined, ""]) {
    const fresh = one({ date: bad });
    assert.equal(fresh.date, NOW.toISOString(), `first time seen (${JSON.stringify(bad)}) starts now`);
    assert.ok(one({ date: bad }, { a: daysAgo(10) }), "seen 10 days ago is still live");
    assert.equal(one({ date: bad }, { a: daysAgo(10) }).date, daysAgo(10).toISOString());
    assert.equal(one({ date: bad }, { a: daysAgo(15) }), undefined, "seen 15 days ago has expired");
  }
});

test("a source that stamps 'now' on every fetch cannot keep a job alive forever", () => {
  assert.equal(one({ date: NOW.toISOString() }, { a: daysAgo(40) }), undefined);
  assert.equal(one({ date: NOW.toISOString() }, { a: daysAgo(5) }).date, daysAgo(5).toISOString());
  assert.equal(one({ date: daysAgo(20).toISOString() }, { a: daysAgo(2) }).date, daysAgo(20).toISOString(), "a genuinely older reported date wins");
});

test("closed deadlines drop the job; future ones keep it", () => {
  assert.equal(one({ date: daysAgo(1).toISOString(), applicationDeadline: "2020-01-01" }), undefined);
  assert.equal(one({ date: daysAgo(1).toISOString(), application_deadline: "2026-11-19" }), undefined);
  assert.ok(one({ date: daysAgo(1).toISOString(), applicationDeadline: "2026-11-25" }));
  assert.ok(one({ date: daysAgo(1).toISOString(), applicationDeadline: "not a date" }), "unparseable deadline is ignored");
});

test("a future posted date never extends a job's life", () => {
  const job = one({ date: new Date(NOW.getTime() + 10 * 86_400_000).toISOString() });
  assert.equal(job.date, NOW.toISOString());
});

test("input is not mutated; non-arrays and empty entries are safe", () => {
  const input = [{ id: "x", date: daysAgo(2).toISOString(), title: "T" }];
  const copy = JSON.stringify(input);
  const out = run(input);
  assert.equal(JSON.stringify(input), copy);
  assert.equal(out[0].title, "T");
  assert.deepEqual(resolveFreshJobs(null), []);
  assert.deepEqual(run([null, undefined]), []);
});

test("limits are configurable and clamped", () => {
  assert.equal(getMaxAgeDays({}), 30); assert.equal(getMaxAgeDays({ JOB_MAX_AGE_DAYS: "7" }), 7);
  assert.equal(getMaxAgeDays({ JOB_MAX_AGE_DAYS: "0" }), 30); assert.equal(getMaxAgeDays({ JOB_MAX_AGE_DAYS: "9999" }), 30); assert.equal(getMaxAgeDays({ JOB_MAX_AGE_DAYS: "abc" }), 30);
  assert.equal(getUndatedMaxAgeDays({}), 14); assert.equal(getUndatedMaxAgeDays({ JOB_UNDATED_MAX_AGE_DAYS: "3" }), 3);
});
