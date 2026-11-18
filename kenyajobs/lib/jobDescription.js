const NAMED_ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
  bull: "•", hellip: "…", copy: "©", reg: "®", trade: "™"
};

export function decodeJobEntities(value) {
  let text = String(value ?? "");
  for (let pass = 0; pass < 4; pass += 1) {
    const next = text
      .replace(/&#(x[\da-f]+|\d+);?/gi, (match, code) => {
        const point = code[0].toLowerCase() === "x"
          ? Number.parseInt(code.slice(1), 16)
          : Number.parseInt(code, 10);
        if (!Number.isFinite(point) || point <= 0 || point > 0x10ffff) return match;
        try { return String.fromCodePoint(point); } catch { return match; }
      })
      .replace(/&([a-z][a-z\d]+);/gi, (match, name) =>
        Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, name.toLowerCase())
          ? NAMED_ENTITIES[name.toLowerCase()]
          : match
      );
    if (next === text) break;
    text = next;
  }
  return text;
}

/**
 * Convert untrusted job-feed HTML, escaped HTML and plain text into readable
 * text. The page renders text rather than source HTML, preventing markup
 * attributes and executable elements from reaching the browser.
 */
export function toPlainJobText(value) {
  if (Array.isArray(value)) value = value.filter(Boolean).join("\n");
  let text = decodeJobEntities(value);

  text = text
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, " ")
    .replace(/\\(?=<\/?[a-z][^>]*>)/gi, "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<br\b[^>]*\/?\s*>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "\n• ")
    .replace(/<\/(?:li|p|div|h[1-6]|section|article|tr|blockquote)>/gi, "\n")
    .replace(/<(?:p|div|h[1-6]|section|article|tr|blockquote)\b[^>]*>/gi, "\n")
    .replace(/<[^>]*>/g, " ");

  text = decodeJobEntities(text)
    .replace(/\\n/g, "\n")
    .replace(/\\r\n|\\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[\t\f\v ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/(?:\n)?\s*•\s*(?:\n)?/g, "\n• ")
    .trim();

  return text;
}
