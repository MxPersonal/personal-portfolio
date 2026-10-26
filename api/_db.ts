import {Pool} from '@neondatabase/serverless';
import {createRemoteJWKSet,jwtVerify} from 'jose';
import type {VercelRequest,VercelResponse} from '@vercel/node';

let pool:Pool|undefined;
export const query=async (sql:string,values:unknown[]=[])=>{
 if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is not configured');
 pool??=new Pool({connectionString:process.env.DATABASE_URL,max:3});
 return pool.query(sql,values);
};
export const noStore=(res:VercelResponse)=>{
 res.setHeader('Cache-Control','no-store');
 res.setHeader('X-Content-Type-Options','nosniff');
};
export const sameOrigin=(req:VercelRequest)=>{
 const origin=req.headers.origin,host=req.headers.host;
 if(!origin||!host)return true;
 try{return new URL(origin).host===host && new URL(origin).protocol==='https:'}catch{return false}
};
export const getUser=async(req:VercelRequest):Promise<string|null>=>{
 const header=req.headers.authorization||'';
 if(!header.startsWith('Bearer '))return null;
 const base=process.env.NEON_AUTH_BASE_URL;
 if(!base)return null;
 try{
  const jwks=createRemoteJWKSet(new URL(base.replace(/\/$/,'')+'/.well-known/jwks.json'));
  const {payload}=await jwtVerify(header.slice(7),jwks,{issuer:new URL(base).origin});
  return typeof payload.sub==='string'&&/^[a-f0-9-]{36}$/i.test(payload.sub)?payload.sub:null;
 }catch{return null}
};
export const getAdmin=async(req:VercelRequest):Promise<string|null>=>{
 const userId=await getUser(req);
 if(!userId)return null;
 const r=await query('SELECT user_id FROM public.portfolio_admins WHERE user_id=$1::uuid LIMIT 1',[userId]);
 return r.rowCount?userId:null;
};
