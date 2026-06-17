// lib/ads.js
import crypto from "crypto";
import { query } from "@/lib/db";

const VALID_PLACEMENTS = ["all", "homepage-grid", "listing-grid", "sidebar"];

function sanitizePlacement(placement) {
  return VALID_PLACEMENTS.includes(placement) ? placement : "all";
}

function rowToAd(row) {
  return {
    id: row.id,
    title: row.title,
    company: row.company || "",
    description: row.description || "",
    url: row.url,
    imageUrl: row.image_url || undefined,
    placement: row.placement,
    active: Boolean(row.active),
    priority: row.priority,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

export function newAdId() {
  return `ad-${crypto.randomUUID()}`;
}

// An ad matches a requested placement if it's pinned to that exact placement,
// or tagged "all" (runs everywhere).
export async function listActiveAds({ placement } = {}) {
  const params = [];
  let where = "active = true";
  if (placement) {
    params.push(placement);
    where += ` AND (placement = $${params.length} OR placement = 'all')`;
  }
  const { rows } = await query(
    `SELECT * FROM ads WHERE ${where} ORDER BY priority DESC, created_at DESC`,
    params
  );
  return rows.map(rowToAd);
}

export async function listAllAds() {
  const { rows } = await query(`SELECT * FROM ads ORDER BY created_at DESC`);
  return rows.map(rowToAd);
}

export async function getAdById(id) {
  const { rows } = await query(`SELECT * FROM ads WHERE id = $1`, [id]);
  return rows[0] ? rowToAd(rows[0]) : null;
}

export async function createAd(data) {
  const id = newAdId();
  const { rows } = await query(
    `INSERT INTO ads (id, title, company, description, url, image_url, placement, active, priority)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      id,
      data.title,
      data.company || null,
      data.description || "",
      data.url,
      data.imageUrl || null,
      sanitizePlacement(data.placement),
      data.active !== false,
      Number.isFinite(Number(data.priority)) ? Number(data.priority) : 0,
    ]
  );
  return rowToAd(rows[0]);
}

export async function updateAd(id, data) {
  const { rows } = await query(
    `UPDATE ads SET
      title = $2, company = $3, description = $4, url = $5, image_url = $6,
      placement = $7, active = $8, priority = $9, updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      data.title,
      data.company || null,
      data.description || "",
      data.url,
      data.imageUrl || null,
      sanitizePlacement(data.placement),
      data.active !== false,
      Number.isFinite(Number(data.priority)) ? Number(data.priority) : 0,
    ]
  );
  return rows[0] ? rowToAd(rows[0]) : null;
}

export async function deleteAd(id) {
  await query(`DELETE FROM ads WHERE id = $1`, [id]);
}

export { VALID_PLACEMENTS };
