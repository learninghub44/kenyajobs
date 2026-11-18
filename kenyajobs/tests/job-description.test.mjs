import test from "node:test";
import assert from "node:assert/strict";
import { decodeJobEntities, toPlainJobText } from "../lib/jobDescription.js";

test("normalizes escaped Word-style HTML and entities", () => {
  const input = "\\<p>\\<strong>\\<span data-contrast=\"auto\">Mission Brief\\</span>\\</strong>\\</p> \\<p>You &amp; your team&nbsp;will lead.</p>";
  assert.equal(toPlainJobText(input), "Mission Brief\nYou & your team will lead.");
});

test("normalizes encoded markup and nested entities", () => {
  assert.equal(toPlainJobText("&amp;lt;p&amp;gt;Hello&amp;lt;/p&amp;gt;"), "Hello");
});

test("preserves paragraphs, headings, list items and literal newline escapes", () => {
  const input = "<h2>Responsibilities</h2><p>Build the practice.</p><ul><li>Lead analysts</li><li>Protect operations</li></ul>Benefits\\nSix weeks leave";
  assert.equal(toPlainJobText(input), "Responsibilities\nBuild the practice.\n• Lead analysts\n• Protect operations\nBenefits\nSix weeks leave");
});

test("removes executable markup and its contents", () => {
  assert.equal(toPlainJobText("<p>Safe</p><script>alert(1)</script><style>.x{}</style>Text"), "Safe\nText");
});

test("decodes decimal and hexadecimal numeric entities", () => {
  assert.equal(decodeJobEntities("&#8217; &#x2019;"), "’ ’");
});
