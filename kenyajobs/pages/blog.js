import Head from "next/head";
import Link from "next/link";
import {query} from "@/lib/db";
export async function getServerSideProps(){
 try{const {rows}=await query("SELECT id,slug,title,excerpt,category,cover_image,author,published_at,created_at FROM blog_posts WHERE status='published' ORDER BY COALESCE(published_at,created_at) DESC");return {props:{posts:rows.map(p=>({id:p.id,slug:p.slug,title:p.title,excerpt:p.excerpt||"",category:p.category||"Career Advice",coverImage:p.cover_image||"",author:p.author||"JOBS HUB KENYA",date:p.published_at?new Date(p.published_at).toISOString():new Date(p.created_at).toISOString()}))}};}
 catch(e){console.error("blog index:",e.message);return {props:{posts:[]}};}
}
export default function Blog({posts}){
 return <><Head>
 <title>Career Advice & Job Search Guides | JOBS HUB KENYA</title>
 <meta name="description" content="Practical career advice, job-search guides, CV tips and employment resources from JOBS HUB KENYA."/>
 <link rel="canonical" href="https://onlinejobs.christech.co.ke/blog"/>
 <meta name="robots" content="index,follow,max-image-preview:large"/>
 <meta property="og:type" content="website"/><meta property="og:site_name" content="JOBS HUB KENYA"/>
 <meta property="og:title" content="Career Advice & Job Search Guides | JOBS HUB KENYA"/>
 <meta property="og:description" content="Career advice, job-search guides and employment resources."/>
 <meta property="og:url" content="https://onlinejobs.christech.co.ke/blog"/>
 <meta property="og:image" content="https://onlinejobs.christech.co.ke/og-image.jpg"/>
 <meta name="twitter:card" content="summary_large_image"/>
 </Head>
 <main className="mx-auto max-w-5xl px-4 py-12"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-widest text-blue-700">JOBS HUB KENYA · INSIGHTS</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-950">Career advice that moves you forward.</h1><p className="mt-4 text-lg leading-7 text-gray-600">Practical guides, job-search resources and updates written by our editorial team.</p></div>
 {posts.length===0?<div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center"><h2 className="font-bold text-gray-900">No articles published yet</h2><p className="mt-2 text-sm text-gray-500">New articles will appear here when the editorial team publishes them.</p></div>:<div className="mt-10 grid gap-5 md:grid-cols-2">{posts.map(p=><Link key={p.id} href={"/blog/"+p.slug} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">{p.coverImage&&<img src={p.coverImage} alt="" className="h-48 w-full object-cover"/>}<div className="p-6"><p className="text-xs font-bold uppercase tracking-wider text-blue-700">{p.category}</p><h2 className="mt-3 text-xl font-bold leading-snug text-gray-950 group-hover:text-blue-700">{p.title}</h2><p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{p.excerpt}</p><p className="mt-5 text-xs text-gray-500">By {p.author} · {new Date(p.date).toLocaleDateString("en-KE",{day:"numeric",month:"short",year:"numeric"})}</p></div></Link>)}</div>}
 </main></>;
}