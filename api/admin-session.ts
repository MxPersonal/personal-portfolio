import type {VercelRequest,VercelResponse} from '@vercel/node';
import {adminConfigured,clearAdminSession,createAdminSession,validCredentials} from '../lib/admin-session.js';
import {noStore,sameOrigin} from './_db.js';

// Best effort per-instance throttle; use platform-level WAF for distributed protection.
const attempts=new Map<string,{count:number;reset:number}>();
const WINDOW_MS=15*60*1000;
const MAX_ATTEMPTS=6;
export default function handler(req:VercelRequest,res:VercelResponse){
 noStore(res);
 if(req.method!=='POST'&&req.method!=='DELETE')return res.status(405).json({error:'Method not allowed'});
 if(!sameOrigin(req))return res.status(403).json({error:'Invalid origin'});
 if(req.method==='DELETE'){clearAdminSession(res);return res.status(200).json({ok:true});}
 if(!adminConfigured())return res.status(503).json({error:'Admin credentials are not configured (minimum 16-character password)'});
 if(Number(req.headers['content-length']||0)>4096)return res.status(413).json({error:'Request too large'});
 const ip=String(req.headers['x-real-ip']||req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
 const now=Date.now();
 if(attempts.size>3000)attempts.clear();
 const existing=attempts.get(ip);
 const entry=existing&&existing.reset>now?existing:{count:0,reset:now+WINDOW_MS};
 if(entry.count>=MAX_ATTEMPTS){
  res.setHeader('Retry-After',String(Math.ceil((entry.reset-now)/1000)));
  return res.status(429).json({error:'Too many login attempts. Try again later.'});
 }
 const {email,password}=req.body||{};
 if(!validCredentials(email,password)){
  entry.count++;attempts.set(ip,entry);
  return res.status(401).json({error:'Invalid email or password'});
 }
 attempts.delete(ip);
 createAdminSession(res);
 return res.status(200).json({ok:true});
}
