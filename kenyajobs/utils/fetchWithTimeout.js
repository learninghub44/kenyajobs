/**
 * Fetch with an AbortController timeout.
 * @param {string} url
 * @param {RequestInit} options
 * @param {number} timeoutMs  default 8000ms
 */
export function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}
