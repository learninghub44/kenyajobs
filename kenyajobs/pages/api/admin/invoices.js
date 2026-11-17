import crypto from "crypto";
import { requireAdmin } from "@/lib/adminAuth";
import { query } from "@/lib/db";
import { sendApiError } from "@/lib/dbErrors";
const clip=(v,n=2000)=>String(v??"").trim().slice(0,n);
const money=v=>{const n=Number(v);return Number.isFinite(n)&&n>=0?Math.round(n*100)/100:null;};
const hash=v=>crypto.createHash("sha256").update(v).digest("hex");
const siteBase=()=>(process.env.NEXT_PUBLIC_SITE_URL||"https://onlinejobs.christech.co.ke").replace(/\/$/,"");
function build(body){
 const name=clip(body.customerName,180),email=clip(body.customerEmail,254).toLowerCase();
 if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Object.assign(new Error("Customer name and a valid email are required."),{statusCode:400});
 const due=clip(body.dueDate,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(due))throw Object.assign(new Error("A valid due date is required."),{statusCode:400});
 const items=Array.isArray(body.items)?body.items.slice(0,30).map(x=>({description:clip(x.description,240),quantity:money(x.quantity),unitPrice:money(x.unitPrice)})):[];
 if(!items.length||items.some(x=>!x.description||!x.quantity||x.quantity<=0||x.unitPrice===null))throw Object.assign(new Error("Add at least one valid invoice line item."),{statusCode:400});
 const subtotal=Math.round(items.reduce((s,x)=>s+x.quantity*x.unitPrice,0)*100)/100;
 const taxRate=money(body.taxRate??0),discount=money(body.discount??0);
 if(taxRate===null||taxRate>100||discount===null||discount>subtotal)throw Object.assign(new Error("Check the tax rate and discount values."),{statusCode:400});
 const taxAmount=Math.round(subtotal*taxRate)/100,total=Math.max(0,Math.round((subtotal+taxAmount-discount)*100)/100);
 const amountPaid=money(body.amountPaid??0);if(amountPaid===null||amountPaid>total)throw Object.assign(new Error("Amount paid cannot exceed the invoice total."),{statusCode:400});
 const status=amountPaid>=total&&total>0?"paid":amountPaid>0?"partially_paid":body.status==="sent"?"sent":"draft";
 return {name,email,due,items,subtotal,taxRate,taxAmount,discount,total,amountPaid,status};
}
const fields="id,invoice_number,customer_name,customer_company,customer_email,customer_phone,customer_address,currency,issue_date,due_date,items,subtotal,tax_rate,tax_amount,discount,total,status,amount_paid,payment_method,payment_reference,payment_instructions,notes,terms,related_type,related_id,related_title,related_url,shared_at,(share_token_hash IS NOT NULL) AS has_share_link,sent_at,paid_at,created_at,updated_at";
async function issueShare(req,id,sendEmail){
 const raw=crypto.randomBytes(32).toString("base64url"),tokenHash=hash(raw);
 const updated=await query("UPDATE invoices SET share_token_hash=$2,shared_at=now(),status=CASE WHEN status='draft' THEN 'sent' ELSE status END,sent_at=COALESCE(sent_at,now()),updated_at=now() WHERE id=$1 AND status<>'void' RETURNING "+fields,[id,tokenHash]);
 if(!updated.rows[0])return {error:"Invoice not found or is void."};
 const shareUrl=siteBase()+"/invoice/"+raw;
 if(!sendEmail)return {invoice:updated.rows[0],shareUrl};
 const key=process.env.RESEND_API_KEY,from=process.env.RESEND_FROM_EMAIL||process.env.EMAIL_FROM;
 if(!key||!from)return {invoice:updated.rows[0],shareUrl,emailSent:false,emailError:"Invoice link created, but email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL in Vercel."};
 const inv=updated.rows[0],currency=inv.currency||"KES";
 const fmt=n=>new Intl.NumberFormat("en-KE",{style:"currency",currency,maximumFractionDigits:2}).format(Number(n||0));
 const logo=siteBase()+"/zetubiz-logo.svg";
 const html=`<div style="font-family:Arial,sans-serif;color:#17221d;max-width:620px;margin:auto;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden"><div style="padding:26px 30px;background:#103c2b;color:white">${logo?'<img src="'+logo+'" alt="Zetu Business Solutions" style="max-height:48px;max-width:190px;object-fit:contain">':'<strong style="font-size:21px">ZETU BUSINESS SOLUTIONS</strong>'}<p style="margin:8px 0 0;color:#d5e7dc">Invoice available</p></div><div style="padding:30px"><p>Hello ${inv.customer_name.replace(/[&<>"]/g,"")},</p><p>Your invoice <strong>${inv.invoice_number}</strong> is ready. You can securely view, print or download it using the link below.</p><div style="padding:18px;background:#f5f8f6;border-radius:12px;margin:20px 0"><p style="margin:0;color:#66756d;font-size:12px">AMOUNT DUE</p><strong style="font-size:28px">${fmt(Number(inv.total)-Number(inv.amount_paid))}</strong><p style="margin:8px 0 0;font-size:13px">Due date: ${String(inv.due_date).slice(0,10)}</p></div><p><a href="${shareUrl}" style="display:inline-block;background:#17633f;color:white;text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:bold">View & download invoice</a></p><p style="font-size:12px;color:#66756d">If the button does not work, copy this link: ${shareUrl}</p></div></div>`;
 const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({from,to:[inv.customer_email],subject:"Invoice "+inv.invoice_number+" from Zetu Business Solutions",html})});
 if(!response.ok){const detail=await response.text().catch(()=>"");return {invoice:inv,shareUrl,emailSent:false,emailError:"Invoice link created, but email delivery failed: "+detail.slice(0,300)};}
 return {invoice:inv,shareUrl,emailSent:true};
}
export default requireAdmin(async function handler(req,res){
 try{
  if(req.method==="GET"){const {rows}=await query("SELECT "+fields+" FROM invoices ORDER BY created_at DESC LIMIT 300");return res.status(200).json(rows);}
  if(req.method==="POST"){
   const b=req.body||{},v=build(b),currency=b.currency==="USD"?"USD":"KES";
   let related={type:null,id:null,title:null,url:null};
   if(b.relatedType&&b.relatedId){
    if(b.relatedType==="job"){const r=await query("SELECT id,title,company FROM manual_jobs WHERE id=$1 AND published=true",[String(b.relatedId)]);if(!r.rows[0])return res.status(400).json({error:"The selected published job could not be found."});related={type:"job",id:r.rows[0].id,title:r.rows[0].title,url:siteBase()+"/job/"+encodeURIComponent(r.rows[0].id)};}
    else if(b.relatedType==="event"){const r=await query("SELECT id,title,slug FROM events WHERE id=$1 AND published=true",[String(b.relatedId)]);if(!r.rows[0])return res.status(400).json({error:"The selected published event could not be found."});related={type:"event",id:r.rows[0].id,title:r.rows[0].title,url:siteBase()+"/events/"+encodeURIComponent(r.rows[0].slug)};}
    else return res.status(400).json({error:"Invalid linked listing type."});
   }
   const {rows}=await query(`INSERT INTO invoices(customer_name,customer_company,customer_email,customer_phone,customer_address,currency,due_date,items,subtotal,tax_rate,tax_amount,discount,total,status,amount_paid,payment_method,payment_reference,payment_instructions,notes,terms,sent_at,paid_at,related_type,related_id,related_title,related_url)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,CASE WHEN $14 IN ('sent','partially_paid','paid') THEN now() END,CASE WHEN $14='paid' THEN now() END,$21,$22,$23,$24) RETURNING ${fields}`,
    [v.name,clip(b.customerCompany,180),v.email,clip(b.customerPhone,40),clip(b.customerAddress,500),currency,v.due,JSON.stringify(v.items),v.subtotal,v.taxRate,v.taxAmount,v.discount,v.total,v.status,v.amountPaid,clip(b.paymentMethod,80),clip(b.paymentReference,120),clip(b.paymentInstructions,1000),clip(b.notes,3000),clip(b.terms,2000),related.type,related.id,related.title,related.url]);
   return res.status(201).json(rows[0]);
  }
  if(req.method==="PATCH"){
   const id=Number(req.body?.id);if(!Number.isInteger(id)||id<1)return res.status(400).json({error:"Valid invoice ID required."});
   const action=clip(req.body?.action,30);
   if(action==="create-share-link"||action==="send-email"){const result=await issueShare(req,id,action==="send-email");return result.error?res.status(404).json({error:result.error}):res.status(200).json(result);}
   if(action==="void"){const r=await query("UPDATE invoices SET status='void',updated_at=now() WHERE id=$1 AND status<>'paid' RETURNING "+fields,[id]);return r.rows[0]?res.status(200).json(r.rows[0]):res.status(409).json({error:"Paid or missing invoices cannot be voided."});}
   if(action==="mark-sent"){const r=await query("UPDATE invoices SET status=CASE WHEN amount_paid>0 THEN 'partially_paid' ELSE 'sent' END,sent_at=COALESCE(sent_at,now()),updated_at=now() WHERE id=$1 AND status IN ('draft','sent','partially_paid') RETURNING "+fields,[id]);return r.rows[0]?res.status(200).json(r.rows[0]):res.status(404).json({error:"Invoice not found or cannot be sent."});}
   if(action==="record-payment"){const amount=money(req.body.amount);if(amount===null||amount<=0)return res.status(400).json({error:"Enter a valid payment amount."});const r=await query("UPDATE invoices SET amount_paid=amount_paid+$2,status=CASE WHEN amount_paid+$2>=total THEN 'paid' ELSE 'partially_paid' END,payment_method=$3,payment_reference=$4,paid_at=CASE WHEN amount_paid+$2>=total THEN now() ELSE paid_at END,updated_at=now() WHERE id=$1 AND status<>'void' AND amount_paid+$2<=total RETURNING "+fields,[id,amount,clip(req.body.paymentMethod,80),clip(req.body.paymentReference,120)]);return r.rows[0]?res.status(200).json(r.rows[0]):res.status(409).json({error:"Payment exceeds the balance or invoice cannot accept payments."});}
   return res.status(400).json({error:"Unsupported invoice action."});
  }
  return res.status(405).json({error:"Method not allowed"});
 }catch(e){if(e.statusCode)return res.status(e.statusCode).json({error:e.message});return sendApiError(res,"admin/invoices "+req.method,e,"Could not process invoices.");}
});