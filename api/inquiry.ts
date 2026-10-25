// Vercel serverless route. It never exposes the service-role key to the browser.
import type {VercelRequest,VercelResponse} from '@vercel/node';
const cors=(res:VercelResponse)=>{res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');};
const limited=(x:unknown,max:number)=>typeof x==='string'?x.trim().slice(0,max):'';
export default async function handler(req:VercelRequest,res:VercelResponse){
 cors(res);
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const origin=req.headers.origin;
 const host=req.headers.host;
 if(origin&&host){try{if(new URL(origin).host!==host)return res.status(403).json({error:'Invalid origin'});}catch{return res.status(403).json({error:'Invalid origin'});}}
 const size=Number(req.headers['content-length']||0);if(size>12000)return res.status(413).json({error:'Request too large'});
 const data=req.body||{};
 if(data.website)return res.status(202).json({ok:true}); // hidden honeypot
 const full_name=limited(data.full_name,90),email=limited(data.email,160),message=limited(data.message,4000),budget=limited(data.budget,120),service=limited(data.service,140);
 if(full_name.length<2||!/^\S+@\S+\.\S+$/.test(email)||message.length<20)return res.status(400).json({error:'Please provide a name, valid email and at least 20 characters of project details.'});
 const secret=process.env.TURNSTILE_SECRET_KEY;
 if(secret){
  const token=limited(data.captcha,3000);if(!token)return res.status(400).json({error:'CAPTCHA required'});
  try{
   const verify=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret,response:token})});
   const result=await verify.json() as {success:boolean};if(!result.success)return res.status(403).json({error:'CAPTCHA failed'});
  }catch{return res.status(503).json({error:'CAPTCHA verification unavailable'});}
 }
 const sbUrl=process.env.SUPABASE_URL,serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!sbUrl||!serviceKey)return res.status(503).json({error:'Secure inquiry backend is not configured yet. Please use direct contact.'});
 try{
  const stored=await fetch(sbUrl+'/rest/v1/portfolio_inquiries',{method:'POST',headers:{apikey:serviceKey,Authorization:'Bearer '+serviceKey,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({full_name,email,message,budget,service,locale:data.locale==='en'?'en':'fa'})});
  if(!stored.ok)return res.status(503).json({error:'Could not store inquiry'});
  const result=await stored.json() as Array<{reference:string}>;
  return res.status(201).json({ok:true,reference:result?.[0]?.reference||null});
 }catch{return res.status(503).json({error:'Inquiry service temporarily unavailable'});}
}
