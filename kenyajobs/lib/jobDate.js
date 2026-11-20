// Normalize dates supplied by job APIs. Some providers return Unix seconds,
// while JavaScript Date(number) expects milliseconds (otherwise dates land in 1970).
export function parseJobDate(value) {
  if (value === null || value === undefined || value === "") return null;

  let date;
  if (typeof value === "number" || (typeof value === "string" && /^[0-9]{9,13}(?:[.][0-9]+)?$/.test(value.trim()))) {
    let timestamp = Number(value);
    if (!Number.isFinite(timestamp)) return null;
    if (Math.abs(timestamp) < 1e12) timestamp *= 1000;
    date = new Date(timestamp);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) return null;
  // A job board should not display Unix epoch/obviously corrupt dates as real postings.
  const year = date.getUTCFullYear();
  // new Date("0") is the year 2000, so the floor is well above the epoch-era values.
  if (year < 2015 || year > new Date().getUTCFullYear() + 1) return null;
  return date;
}

export function normalizeJobDate(value) {
  const date = parseJobDate(value);
  return date ? date.toISOString() : null;
}
