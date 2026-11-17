import crypto from "crypto";
import { query } from "@/lib/db";
import { sendApiError } from "@/lib/dbErrors";
const hash=v=>crypto.createHash("sha256").update(v).digest("hex");
export default async function handler(req,res){
 res.setHeader("Cache-Control","private, no-store, max-age=0");
 if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
 const token=String(req.query.token||"");
 if(!/^[A-Za-z0-9_-]{40,60}$/.test(token))return res.status(404).json({error:"This invoice link is invalid or has expired."});
 try{
  const {rows}=await query("SELECT invoice_number,customer_name,customer_company,customer_email,customer_phone,customer_address,currency,issue_date,due_date,items,subtotal,tax_rate,tax_amount,discount,total,status,amount_paid,payment_method,payment_reference,payment_instructions,notes,terms,related_type,related_title,related_url,shared_at FROM invoices WHERE share_token_hash=$1 AND status<>'void' LIMIT 1",[hash(token)]);
  if(!rows[0])return res.status(404).json({error:"This invoice link is invalid or has expired."});
  return res.status(200).json(rows[0]);
 }catch(e){return sendApiError(res,"public invoice GET",e,"Could not load this invoice.");}
}