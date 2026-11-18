import React from "react";

const money=(value,currency="KES")=>new Intl.NumberFormat("en-KE",{style:"currency",currency,maximumFractionDigits:2}).format(Number(value||0));
const date=value=>{if(!value)return "—";const d=new Date(value);return Number.isNaN(d.getTime())?String(value).slice(0,10):new Intl.DateTimeFormat("en-KE",{day:"2-digit",month:"short",year:"numeric"}).format(d);};
const clean=value=>value===null||value===undefined?"":String(value);
export default function InvoiceDocument({invoice}){
 if(!invoice)return null;
 const currency=invoice.currency||"KES";
 const balance=Math.max(0,Number(invoice.total||0)-Number(invoice.amount_paid||0));
 const logo=process.env.NEXT_PUBLIC_ZETU_BUSINESS_LOGO_URL||"/zetubiz-logo.svg";
 const items=Array.isArray(invoice.items)?invoice.items:[];
 return <article id="invoice-paper" className="invoice-document mx-auto w-full max-w-[820px] overflow-hidden bg-white text-slate-800 shadow-sm">
  <header className="relative overflow-hidden bg-[#123d2d] px-7 py-8 text-white sm:px-11 sm:py-10">
   <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[28px] border-white/5"/>
   <div className="relative flex flex-wrap items-start justify-between gap-7">
    <div className="max-w-[55%]">
     {logo?<img src={logo} alt="Zetu Business Solutions" className="mb-5 max-h-14 max-w-[205px] object-contain object-left brightness-0 invert"/>:<p className="mb-5 text-lg font-black tracking-wide">ZETU BUSINESS SOLUTIONS</p>}
     <p className="text-[10px] font-bold uppercase tracking-[.22em] text-emerald-100">Issued by</p>
     <p className="mt-1 text-sm font-semibold">Zetu Business Solutions</p>
     <p className="mt-1 text-xs text-emerald-100/75">Recruitment, advertising & business services</p>
    </div>
    <div className="min-w-[190px] text-left sm:text-right">
     <p className="text-[11px] font-bold uppercase tracking-[.3em] text-emerald-100">Invoice</p>
     <p className="mt-2 break-words text-2xl font-black tracking-tight sm:text-3xl">{clean(invoice.invoice_number)}</p>
     <span className="mt-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">{clean(invoice.status).replaceAll("_"," ")||"Issued"}</span>
    </div>
   </div>
  </header>
  <div className="px-7 py-7 sm:px-11 sm:py-9">
   <section className="grid gap-7 border-b border-slate-200 pb-7 sm:grid-cols-3">
    <div className="sm:col-span-1"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Billed to</p><p className="mt-3 text-base font-bold text-slate-900">{clean(invoice.customer_name)||"Customer"}</p>{invoice.customer_company&&<p className="mt-1 text-sm font-medium text-slate-600">{invoice.customer_company}</p>}{invoice.customer_email&&<p className="mt-2 break-all text-xs text-slate-500">{invoice.customer_email}</p>}{invoice.customer_phone&&<p className="mt-1 text-xs text-slate-500">{invoice.customer_phone}</p>}{invoice.customer_address&&<p className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-500">{invoice.customer_address}</p>}</div>
    <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Invoice dates</p><dl className="mt-3 space-y-3 text-xs"><div><dt className="text-slate-400">Issue date</dt><dd className="mt-1 font-semibold text-slate-800">{date(invoice.issue_date)}</dd></div><div><dt className="text-slate-400">Payment due</dt><dd className="mt-1 font-semibold text-slate-800">{date(invoice.due_date)}</dd></div></dl></div>
    <div>{invoice.related_title?<><p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Related listing</p><p className="mt-3 text-sm font-semibold text-slate-800">{invoice.related_title}</p><p className="mt-1 text-xs capitalize text-slate-500">{clean(invoice.related_type)}</p>{invoice.related_url&&<a href={invoice.related_url} className="mt-2 inline-block text-xs font-semibold text-emerald-800 underline">View listing</a>}</>:<><p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Reference</p><p className="mt-3 text-sm font-semibold text-slate-800">{clean(invoice.invoice_number)}</p><p className="mt-1 text-xs text-slate-500">Please quote this number when making payment.</p></>}</div>
   </section>
   <section className="mt-8">
    <div className="mb-3 flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-emerald-800">Invoice details</p><h2 className="mt-1 text-lg font-bold text-slate-900">Services supplied</h2></div><p className="text-[10px] font-medium text-slate-400">{items.length} {items.length===1?"item":"items"}</p></div>
    <div className="overflow-x-auto"><table className="w-full min-w-[500px] border-collapse text-sm"><thead><tr className="bg-[#f1f6f3] text-[10px] font-bold uppercase tracking-wider text-slate-500"><th className="px-3 py-3 text-left">Description</th><th className="px-3 py-3 text-center">Qty</th><th className="px-3 py-3 text-right">Unit price</th><th className="px-3 py-3 text-right">Amount</th></tr></thead><tbody>{items.map((item,index)=><tr key={index} className="border-b border-slate-100"><td className="px-3 py-4 font-medium text-slate-800">{clean(item.description)}</td><td className="px-3 py-4 text-center tabular-nums text-slate-600">{item.quantity}</td><td className="px-3 py-4 text-right tabular-nums text-slate-600">{money(item.unitPrice,currency)}</td><td className="px-3 py-4 text-right font-semibold tabular-nums text-slate-900">{money(Number(item.quantity||0)*Number(item.unitPrice||0),currency)}</td></tr>)}</tbody></table></div>
   </section>
   <section className="mt-7 flex flex-col-reverse justify-between gap-7 sm:flex-row">
    <div className="max-w-[340px] flex-1">
     {invoice.payment_instructions&&<div className="rounded-xl border border-emerald-100 bg-[#f5f9f6] p-4"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald-900">How to pay</p><p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-600">{invoice.payment_instructions}</p>{invoice.payment_method&&<p className="mt-3 border-t border-emerald-100 pt-2 text-[11px] text-slate-500">Preferred method: <b className="text-slate-700">{invoice.payment_method}</b></p>}{invoice.payment_reference&&<p className="mt-1 text-[11px] text-slate-500">Payment reference: <b className="text-slate-700">{invoice.payment_reference}</b></p>}</div>}
     {invoice.notes&&<div className="mt-4"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Additional notes</p><p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-600">{invoice.notes}</p></div>}
    </div>
    <div className="w-full rounded-xl bg-slate-50 p-5 sm:max-w-[285px]">
     <div className="space-y-3 text-xs"><div className="flex justify-between gap-4"><span className="text-slate-500">Subtotal</span><b className="tabular-nums">{money(invoice.subtotal,currency)}</b></div><div className="flex justify-between gap-4"><span className="text-slate-500">Tax ({Number(invoice.tax_rate||0)}%)</span><b className="tabular-nums">{money(invoice.tax_amount,currency)}</b></div><div className="flex justify-between gap-4"><span className="text-slate-500">Discount</span><b className="tabular-nums">−{money(invoice.discount,currency)}</b></div></div>
     <div className="mt-4 border-t border-slate-200 pt-4"><div className="flex items-center justify-between gap-3"><span className="text-sm font-bold text-slate-800">Total due</span><span className="text-xl font-black tabular-nums text-[#123d2d]">{money(invoice.total,currency)}</span></div><div className="mt-3 flex justify-between gap-3 text-xs"><span className="text-slate-500">Amount paid</span><b className="tabular-nums text-emerald-800">{money(invoice.amount_paid,currency)}</b></div><div className="mt-3 flex justify-between gap-3 border-t border-slate-200 pt-3"><span className="text-xs font-bold text-slate-700">Balance payable</span><b className="text-sm tabular-nums text-slate-950">{money(balance,currency)}</b></div></div>
    </div>
   </section>
   {invoice.terms&&<section className="mt-8 border-t border-slate-200 pt-5"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Terms & conditions</p><p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-500">{invoice.terms}</p></section>}
   <footer className="mt-8 border-t border-slate-200 pt-5 text-center"><p className="text-sm font-bold text-[#123d2d]">Thank you for your business.</p><p className="mt-1 text-[10px] text-slate-400">Zetu Business Solutions · Invoice {clean(invoice.invoice_number)}</p></footer>
  </div>
 </article>;
}
