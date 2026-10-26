import type {VercelRequest,VercelResponse} from '@vercel/node';
import {put} from '@vercel/blob';
import {getAdmin,noStore,sameOrigin} from './_db';
const types=new Set(['image/jpeg','image/png','image/webp','image/avif','image/gif','video/mp4','video/webm']);
export default async function handler(req:VercelRequest,res:VercelResponse){
 noStore(res);
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!sameOrigin(req))return res.status(403).json({error:'Invalid origin'});
 if(Number(req.headers['content-length']||0)>5_800_000)return res.status(413).json({error:'File too large'});
 try{
  const admin=await getAdmin(req);
  if(!admin)return res.status(403).json({error:'Admin authorization required'});
  if(!process.env.BLOB_READ_WRITE_TOKEN)return res.status(503).json({error:'Media storage is not connected. Add Vercel Blob to enable uploads, or use an image URL.'});
  const {name,type,data}=req.body||{};
  if(typeof name!=='string'||!name.startsWith('site/')&&!name.startsWith('projects/')||name.length>260||typeof type!=='string'||!types.has(type)||typeof data!=='string'||data.length>5_600_000)return res.status(400).json({error:'Invalid file'});
  const bytes=Buffer.from(data,'base64');if(!bytes.length||bytes.byteLength>4*1024*1024)return res.status(413).json({error:'Maximum upload size is 4 MB'});
  const clean=name.replace(/[^a-zA-Z0-9/_.-]/g,'-');
  const blob=await put('portfolio/'+clean,bytes,{access:'public',addRandomSuffix:true,contentType:type});
  return res.status(201).json({url:blob.url});
 }catch(e){console.error('Media upload failed',e instanceof Error?e.message:'Unknown');return res.status(503).json({error:'Media upload failed'})}
}
