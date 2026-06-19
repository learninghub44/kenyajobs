/**
 * Fetch with AbortController timeout + sensible default headers.
 */
export function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const defaultHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, application/rss+xml, application/xml, text/xml, */*",
    "Accept-Language": "en-US,en;q=0.9",
  };

  return fetch(url, {
    ...options,
    headers: { ...defaultHeaders, ...(options.headers || {}) },
    signal: controller.signal,
  }).finally(() => clearTimeout(timer));
}
