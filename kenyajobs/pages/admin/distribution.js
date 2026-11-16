import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import AdminLayout from "@/components/admin/AdminLayout";
import { MessageCircle, Send, Save, RefreshCw, Copy, ExternalLink, CheckCircle2, Clock3, AlertCircle, Radio, ScanSearch } from "lucide-react";

const defaults = {whatsapp_channel_url:"",telegram_channel_url:"",whatsapp_enabled:true,telegram_enabled:true,auto_queue:true,approval_required:true,kenya_enabled:true,africa_enabled:true,remote_enabled:true};
const inputClass = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100";

export default function AdminDistribution() {
  const [settings,setSettings] = useState(defaults);
  const [queue,setQueue] = useState([]);
  const [botConfigured,setBotConfigured] = useState(false);
  const [loading,setLoading] = useState(true);\n  const [scanning,setScanning] = useState(false);
  const [saving,setSaving] = useState(false);
  const [busyId,setBusyId] = useState(null);
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");
  const [filter,setFilter] = useState("all");

  async function load() {
    setLoading(true); setError("");
    try {
      const response=await fetch("/api/admin/distribution");
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"Could not load distribution settings.");
      setSettings({...defaults,...(data.settings||{})});
      setQueue(Array.isArray(data.queue)?data.queue:[]);
      setBotConfigured(Boolean(data.telegramBotConfigured));
    } catch(err) {setError(err.message);} finally {setLoading(false);}
  }
  useEffect(()=>{load();},[]);
  function set(field,value){setSettings(current=>({...current,[field]:value}));}

  async function save(){
    setSaving(true);setError("");setNotice("");
    try{
      const response=await fetch("/api/admin/distribution",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(settings)});
      const data=await response.json();if(!response.ok)throw new Error(data.error||"Could not save settings.");
      setSettings({...defaults,...(data.settings||{})});setNotice("Distribution settings saved.");
    }catch(err){setError(err.message);}finally{setSaving(false);}
  }
  async function scanNow(){
    setScanning(true);setError("");setNotice("");
    try{
      const response=await fetch("/api/admin/distribution",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"scan"})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||"Could not scan current jobs.");
      setNotice(`Scan complete. ${data.queued||0} new channel announcements queued.`);await load();
    }catch(err){setError(err.message);}finally{setScanning(false);}
  }
  async function act(item,action){
    setBusyId(item.id);setError("");setNotice("");
    try{
      const response=await fetch(`/api/admin/distribution/${item.id}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||"Action failed.");
      setNotice(action==="send_telegram"?"Telegram message sent.":action==="mark_posted"?"Publication recorded.":"Queue item updated.");await load();
    }catch(err){setError(err.message);}finally{setBusyId(null);}
  }
  async function copyMessage(message){
    try{await navigator.clipboard.writeText(message);setNotice("Announcement copied.");}
    catch{setError("Clipboard access was blocked by your browser.");}
  }
  const counts=useMemo(()=>({pending:queue.filter(x=>x.status==="pending_approval").length,ready:queue.filter(x=>x.status==="ready").length,posted:queue.filter(x=>x.status==="posted").length,failed:queue.filter(x=>x.status==="failed").length}),[queue]);
  const visible=filter==="all"?queue:queue.filter(x=>x.status===filter);

  return (
    <AdminLayout active="distribution">
      <Head><title>Distribution Centre | Admin</title><meta name="robots" content="noindex,nofollow"/></Head>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-green-700">Audience growth</p><h2 className="mt-1 text-2xl font-bold text-gray-900">Distribution Centre</h2><p className="mt-1 text-sm text-gray-500">Manage channel links, job categories and announcement approvals.</p></div><div className="flex gap-2"><button onClick={load} disabled={loading||scanning} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700"><RefreshCw size={15}/>Refresh</button><button onClick={scanNow} disabled={scanning||loading} className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"><ScanSearch size={15}/>{scanning?"Scanning…":"Scan jobs now"}</button></div></div>
      {error&&<div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {notice&&<div role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</div>}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">{[["Awaiting approval",counts.pending,Clock3],["Ready to publish",counts.ready,Radio],["Published",counts.posted,CheckCircle2],["Failed",counts.failed,AlertCircle]].map(([label,value,Icon])=><div key={label} className="rounded-xl border border-gray-200 bg-white p-4"><div className="flex items-center justify-between text-gray-500"><span className="text-xs">{label}</span><Icon size={16}/></div><p className="mt-2 text-2xl font-bold tabular-nums text-gray-900">{value}</p></div>)}</div>

      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4"><h3 className="font-bold text-gray-900">Channel configuration</h3><p className="mt-1 text-xs text-gray-500">These links power the public website buttons. Changes take effect without redeployment.</p></div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-3"><div className="flex items-center gap-2 text-sm font-semibold text-gray-800"><MessageCircle size={17} className="text-green-600"/>WhatsApp Channel</div><input aria-label="WhatsApp channel URL" className={inputClass} value={settings.whatsapp_channel_url} onChange={e=>set("whatsapp_channel_url",e.target.value)} placeholder="https://whatsapp.com/channel/..."/><Toggle label="Show WhatsApp join button" checked={settings.whatsapp_enabled} onChange={v=>set("whatsapp_enabled",v)}/><p className="text-xs text-gray-500">Channel publishing is admin-assisted: copy the post, open your channel and publish it. WhatsApp does not expose a supported public Channel publishing API.</p></div>
          <div className="space-y-3"><div className="flex items-center gap-2 text-sm font-semibold text-gray-800"><Send size={17} className="text-sky-600"/>Telegram Channel</div><input aria-label="Telegram channel URL" className={inputClass} value={settings.telegram_channel_url} onChange={e=>set("telegram_channel_url",e.target.value)} placeholder="https://t.me/yourchannel"/><Toggle label="Show Telegram join button" checked={settings.telegram_enabled} onChange={v=>set("telegram_enabled",v)}/><p className="text-xs text-gray-500">{botConfigured?"Telegram bot connected. Approved announcements can be sent automatically.":"For automatic Telegram publishing, add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to your hosting environment. Otherwise use copy-and-post."}</p></div>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="font-bold text-gray-900">Automation rules</h3><p className="mt-1 mb-4 text-xs text-gray-500">Jobs detected by the scheduled source refresh are queued once per job and channel. Expired listings are skipped.</p>
        <div className="grid gap-3 sm:grid-cols-2"><Toggle label="Automatically prepare announcements" checked={settings.auto_queue} onChange={v=>set("auto_queue",v)}/><Toggle label="Require admin approval before publishing" checked={settings.approval_required} onChange={v=>set("approval_required",v)}/><Toggle label="Kenyan jobs" checked={settings.kenya_enabled} onChange={v=>set("kenya_enabled",v)}/><Toggle label="Other African jobs" checked={settings.africa_enabled} onChange={v=>set("africa_enabled",v)}/><Toggle label="Worldwide remote jobs" checked={settings.remote_enabled} onChange={v=>set("remote_enabled",v)}/></div>
        <div className="mt-5 flex justify-end"><button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"><Save size={15}/>{saving?"Saving...":"Save settings"}</button></div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-5"><div><h3 className="font-bold text-gray-900">Announcement queue</h3><p className="mt-1 text-xs text-gray-500">Review, copy, publish and track job announcements.</p></div><select aria-label="Filter queue" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option><option value="pending_approval">Awaiting approval</option><option value="ready">Ready</option><option value="posted">Published</option><option value="failed">Failed</option></select></div>
        {loading?<p className="p-8 text-center text-sm text-gray-500">Loading queue…</p>:visible.length===0?<div className="p-10 text-center"><Radio size={24} className="mx-auto mb-2 text-gray-300"/><p className="font-semibold text-gray-700">No announcements in this view</p><p className="mt-1 text-xs text-gray-500">Run a scan or wait for the next secured scheduled refresh.</p></div>:<div className="divide-y divide-gray-100">{visible.map(item=><article key={item.id} className="p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{item.channel}</span><span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">{item.category}</span><Status status={item.status}/></div><h4 className="mt-2 font-semibold text-gray-900">{item.payload?.title||item.payload?.job_title||"Job opportunity"}</h4><p className="mt-0.5 text-xs text-gray-500">{item.payload?.company||item.payload?.company_name||"Company"} · {item.payload?.location||"Location not specified"}</p></div><span className="text-xs text-gray-400">#{item.id}</span></div><pre className="mt-3 whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-3 font-sans text-xs leading-relaxed text-gray-700">{item.message}</pre>{item.error&&<p className="mt-2 text-xs text-red-600">{item.error}</p>}<div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>copyMessage(item.message)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700"><Copy size={13}/>Copy post</button>{item.channel==="whatsapp"&&<a href={settings.whatsapp_channel_url||"https://whatsapp.com"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700"><ExternalLink size={13}/>Open channel</a>}{item.channel==="telegram"&&<a href={settings.telegram_channel_url||"https://t.me"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700"><ExternalLink size={13}/>Open channel</a>}{item.status==="pending_approval"&&<button disabled={busyId===item.id} onClick={()=>act(item,"approve")} className="rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">Approve</button>}{item.channel==="telegram"&&botConfigured&&item.status==="ready"&&<button disabled={busyId===item.id} onClick={()=>act(item,"send_telegram")} className="rounded-lg bg-sky-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">{busyId===item.id?"Sending…":"Send via bot"}</button>}{item.status==="ready"&&<button disabled={busyId===item.id} onClick={()=>act(item,"mark_posted")} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 disabled:opacity-60">Mark as published</button>}{item.status==="failed"&&<button disabled={busyId===item.id} onClick={()=>act(item,"retry")} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700">Retry</button>}</div></article>)}</div>}
      </section>
    </AdminLayout>
  );
}
function Toggle({label,checked,onChange}){return <label className="flex items-center gap-2.5 text-sm text-gray-700"><input type="checkbox" checked={Boolean(checked)} onChange={e=>onChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-600"/>{label}</label>;}
function Status({status}){const map={pending_approval:"bg-amber-50 text-amber-800 border-amber-200",ready:"bg-green-50 text-green-800 border-green-200",posted:"bg-emerald-50 text-emerald-800 border-emerald-200",failed:"bg-red-50 text-red-800 border-red-200"};const label={pending_approval:"Awaiting approval",ready:"Ready",posted:"Published",failed:"Failed"}[status]||status;return <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${map[status]||"bg-gray-50 text-gray-700 border-gray-200"}`}>{label}</span>;}
