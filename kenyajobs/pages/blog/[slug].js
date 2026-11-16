import Head from "next/head";
import Link from "next/link";
import { query } from "@/lib/db";
export async function getServerSideProps({params}){
 try{const {rows}=await query("SELECT * FROM blog_posts WHERE slug=$1 AND status='published' LIMIT 1",[params.slug]);if(!rows[0])return {notFound:true};const p=rows[0];return {props:{post:{id:p.id,slug:p.slug,title:p.title,excerpt:p.excerpt||"",category:p.category||"Career Advice",content:p.content,coverImage:p.cover_image||"",author:p.author||"JOBS HUB KENYA",publishedAt:p.published_at?new Date(p.published_at).toISOString():null}}};}
 catch(e){console.error("blog article:",e.message);return {notFound:true};}
}
export default function BlogArticle({post}){
 return <><Head>
 <title>{post.title} | JOBS HUB KENYA</title>
 <meta name="description" content={(post.excerpt||post.title).slice(0,155)}/>
 <meta name="robots" content="index,follow,max-image-preview:large"/>
 <link rel="canonical" href={"https://onlinejobs.christech.co.ke/blog/"+post.slug}/>
 <meta property="og:type" content="article"/><meta property="og:site_name" content="JOBS HUB KENYA"/>
 <meta property="og:title" content={post.title+" | JOBS HUB KENYA"}/>
 <meta property="og:description" content={post.excerpt||post.title}/>
 <meta property="og:url" content={"https://onlinejobs.christech.co.ke/blog/"+post.slug}/>
 {post.coverImage&&<meta property="og:image" content={post.coverImage}/>}
 <meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content={post.title}/>
 <meta name="twitter:description" content={post.excerpt||post.title}/>
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"Article","headline":post.title,"description":post.excerpt||post.title,"author":{"@type":"Organization","name":post.author},"publisher":{"@type":"Organization","name":"JOBS HUB KENYA","url":"https://onlinejobs.christech.co.ke/"},"datePublished":post.publishedAt||undefined,"mainEntityOfPage":"https://onlinejobs.christech.co.ke/blog/"+post.slug,...(post.coverImage?{"image":post.coverImage}:{})})}}/>
 </Head>
 <main className="mx-auto max-w-3xl px-4 py-12"><Link href="/blog" className="text-sm font-semibold text-blue-700 hover:underline">← Back to articles</Link><p className="mt-8 text-xs font-bold uppercase tracking-wider text-blue-700">{post.category}</p><h1 className="mt-3 text-3xl font-extrabold leading-tight text-gray-950 sm:text-4xl">{post.title}</h1>{post.excerpt&&<p className="mt-4 text-lg leading-relaxed text-gray-600">{post.excerpt}</p>}<p className="mt-4 text-sm text-gray-500">By {post.author}{post.publishedAt?" · "+new Date(post.publishedAt).toLocaleDateString("en-KE",{day:"numeric",month:"long",year:"numeric"}):""}</p>{post.coverImage&&<img src={post.coverImage} alt="" className="mt-8 w-full rounded-2xl object-cover"/>}<article className="prose prose-lg mt-9 max-w-none text-gray-800">{post.content.split(/\r?\n\s*\r?\n/).map((paragraph,i)=><p key={i} className="mb-5 whitespace-pre-line leading-8">{paragraph}</p>)}</article><div className="mt-12 rounded-2xl bg-blue-50 p-6"><h2 className="font-bold text-gray-900">Find your next opportunity</h2><p className="mt-1 text-sm text-gray-600">Explore current openings on Online Jobs.</p><Link href="/" className="mt-4 inline-flex rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-bold text-white">Browse jobs</Link></div></main></>;
}