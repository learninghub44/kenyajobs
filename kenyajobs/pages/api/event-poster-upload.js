import crypto from "crypto";
const MAX_BYTES=5*1024*1024;
export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 const url=String(process.env.SUPABASE_URL||"").replace(/\/$/,""),key=process.env.SUPABASE_SERVICE_ROLE_KEY,bucket=process.env.SUPABASE_EVENT_BUCKET||"event-posters";
 if(!url||!key)return res.status(503).json({error:"Event image storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then create a public Storage bucket named event-posters."});
 const {mimeType,data}=req.body||{},allowed=["image/jpeg","image/png","image/webp"];
 if(!allowed.includes(mimeType)||typeof data!=="string")return res.status(400).json({error:"Upload a JPG, PNG or WebP image."});
 const buffer=Buffer.from(data,"base64");if(!buffer.length||buffer.length>MAX_BYTES)return res.status(413).json({error:"Each banner must be 5 MB or smaller."});
 const ext={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"}[mimeType],path="events/"+new Date().toISOString().slice(0,10)+"/"+crypto.randomUUID()+"."+ext;
 const auth={Authorization:"Bearer "+key,apikey:key};
 try{
  const check=await fetch(url+"/storage/v1/bucket/"+encodeURIComponent(bucket),{headers:auth});
  if(check.status===404){const create=await fetch(url+"/storage/v1/bucket",{method:"POST",headers:{...auth,"Content-Type":"application/json"},body:JSON.stringify({id:bucket,name:bucket,public:true,file_size_limit:MAX_BYTES,allowed_mime_types:allowed})});if(!create.ok&&create.status!==409)throw new Error("Could not create event image bucket.");}
  const uploaded=await fetch(url+"/storage/v1/object/"+encodeURIComponent(bucket)+"/"+path.split("/").map(encodeURIComponent).join("/"),{method:"POST",headers:{...auth,"Content-Type":mimeType,"x-upsert":"false"},body:buffer});
  if(!uploaded.ok)throw new Error("Storage rejected upload: "+uploaded.status);
  return res.status(201).json({ok:true,url:url+"/storage/v1/object/public/"+encodeURIComponent(bucket)+"/"+path.split("/").map(encodeURIComponent).join("/")});
 }catch(e){console.error("event banner upload:",e.message);return res.status(503).json({error:"Banner upload failed. Check the Supabase Storage bucket and server credentials."});}
}
export const config={api:{bodyParser:{sizeLimit:"7mb"}}};
