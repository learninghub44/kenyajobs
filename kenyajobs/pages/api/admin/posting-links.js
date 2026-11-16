import crypto from "crypto";
import { requireAdmin } from "@/lib/adminAuth";
import { query } from "@/lib/db";
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const baseUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://onlinejobs.christech.co.ke").replace(/\/$/, "");
export default requireAdmin(async function handler(req,res) {
  try {
    if (req.method === "GET") {
      const { rows } = await query("SELECT id,label,auto_publish,max_uses,uses,expires_at,revoked_at,created_at FROM job_posting_links ORDER BY created_at DESC LIMIT 100");
      return res.status(200).json(rows);
    }
    if (req.method === "POST") {
      const body=req.body||{}, label=String(body.label||"").trim().slice(0,100);
      const maxUses=Math.max(1,Math.min(1000,Number(body.maxUses)||1));
      const days=body.expiresInDays===""||body.expiresInDays==null?null:Math.max(1,Math.min(365,Number(body.expiresInDays)||30));
      if(!label)return res.status(400).json({error:"Give this posting link a name."});
      const token=crypto.randomBytes(32).toString("base64url");
      const expires=days?new Date(Date.now()+days*86400000):null;
      const {rows}=await query("INSERT INTO job_posting_links(label,token_hash,auto_publish,max_uses,expires_at) VALUES($1,$2,$3,$4,$5) RETURNING id,label,auto_publish,max_uses,uses,expires_at,created_at",[label,hash(token),body.autoPublish === true,maxUses,expires]);
      return res.status(201).json({...rows[0],url:baseUrl()+"/post-job?invite="+token});
    }
    if(req.method==="DELETE"){
      const id=Number((req.body||{}).id);if(!Number.isInteger(id)||id<1)return res.status(400).json({error:"Valid link ID required."});
      await query("UPDATE job_posting_links SET revoked_at=now() WHERE id=$1 AND revoked_at IS NULL",[id]);
      return res.status(200).json({ok:true});
    }
    return res.status(405).json({error:"Method not allowed"});
  }catch(error){console.error("posting links admin:",error.message);return res.status(500).json({error:"Could not manage posting links."});}
});