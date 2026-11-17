import crypto from "crypto";
import { checkPassword, createSessionToken, sessionCookie } from "@/lib/adminAuth";
import { rawQuery } from "@/lib/db";
const hash=(value)=>crypto.createHash("sha256").update(value).digest("hex");
export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 if(!process.env.ADMIN_PASSWORD)return res.status(500).json({error:"ADMIN_PASSWORD is not configured on the server."});
 try{
  const forwarded=String(req.headers["x-forwarded-for"]||"").split(",")[0].trim();
  const ip=forwarded||req.socket?.remoteAddress||"unknown";
  const ipHash=hash((process.env.ADMIN_SESSION_SECRET||process.env.ADMIN_PASSWORD)+":"+ip);
  await rawQuery("CREATE TABLE IF NOT EXISTS admin_login_attempts (ip_hash TEXT PRIMARY KEY, attempts INTEGER NOT NULL DEFAULT 0, window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(), locked_until TIMESTAMPTZ)",[]);
  const state=await rawQuery("SELECT attempts,locked_until FROM admin_login_attempts WHERE ip_hash=$1",[ipHash]);
  if(state.rows[0]?.locked_until&&new Date(state.rows[0].locked_until).getTime()>Date.now())return res.status(429).json({error:"Too many sign-in attempts. Try again in 15 minutes."});
  const {password}=req.body||{};
  if(!checkPassword(password)){
   await rawQuery(`INSERT INTO admin_login_attempts(ip_hash,attempts,window_started_at,locked_until) VALUES($1,1,now(),NULL)
    ON CONFLICT(ip_hash) DO UPDATE SET attempts=CASE WHEN admin_login_attempts.window_started_at<now()-interval '15 minutes' THEN 1 ELSE admin_login_attempts.attempts+1 END,
    window_started_at=CASE WHEN admin_login_attempts.window_started_at<now()-interval '15 minutes' THEN now() ELSE admin_login_attempts.window_started_at END,
    locked_until=CASE WHEN (CASE WHEN admin_login_attempts.window_started_at<now()-interval '15 minutes' THEN 1 ELSE admin_login_attempts.attempts+1 END)>=8 THEN now()+interval '15 minutes' ELSE NULL END`,[ipHash]);
   return res.status(401).json({error:"Incorrect password"});
  }
  await rawQuery("DELETE FROM admin_login_attempts WHERE ip_hash=$1",[ipHash]);
  res.setHeader("Set-Cookie",sessionCookie(createSessionToken()));
  return res.status(200).json({ok:true});
 }catch(error){console.error("admin login:",error.message);return res.status(503).json({error:"Sign-in is temporarily unavailable. Please try again."});}
}