import {Pool} from '@neondatabase/serverless';
import type {VercelRequest,VercelResponse} from '@vercel/node';
import {hasAdminSession} from '../lib/admin-session.js';

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
 try{return new URL(origin).host===host&&new URL(origin).protocol==='https:'}catch{return false}
};
export const getAdmin=async(req:VercelRequest):Promise<string|null>=>hasAdminSession(req)?'environment-admin':null;
