import type {VercelRequest,VercelResponse} from '@vercel/node';
import {noStore,query,sameOrigin} from './_db';
const cut=(x:unknown,max:number)=>typeof x==='string'?x.trim().slice(0,max):'';
export default async function handler(req:VercelRequest,res:VercelResponse){
 noStore(res);
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!sameOrigin(req))return res.status(403).json({error:'Invalid origin'});
 if(Number(req.headers['content-length']||0)>12000)return res.status(413).json({error:'Request too large'});
 const b=req.body||{};
 if(b.website)return res.status(202).json({ok:true});
 const full_name=cut(b.full_name,90),email=cut(b.email,160),message=cut(b.message,4000);
 const budget=cut(b.budget,120),service=cut(b.service,140),locale=b.locale==='en'?'en':'fa';
 if(full_name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||message.length<20)
  return res.status(400).json({error:'Please provide a valid name, email, and project details.'});
 if(process.env.TURNSTILE_SECRET_KEY){
  const captcha=cut(b.captcha,3000);
  if(!captcha)return res.status(400).json({error:'CAPTCHA required'});
  try{
   const verify=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY,response:captcha})});
   const checked=await verify.json() as {success:boolean};
   if(!checked.success)return res.status(403).json({error:'Invalid CAPTCHA'});
  }catch{return res.status(503).json({error:'Verification unavailable'})}
 }
 if(!process.env.DATABASE_URL)return res.status(503).json({error:'Inquiry backend not configured'});
 try{
  const r=await query('INSERT INTO public.portfolio_inquiries (full_name,email,message,budget,service,locale) VALUES ($1,$2,$3,$4,$5,$6) RETURNING reference',[full_name,email,message,budget,service,locale]);
  return res.status(201).json({ok:true,reference:r.rows[0]?.reference});
 }catch(e){console.error('Inquiry failed',e instanceof Error?e.message:'Unknown');return res.status(503).json({error:'Inquiry service unavailable'})}
}
