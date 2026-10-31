import {createHash,createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
import type {VercelRequest,VercelResponse} from '@vercel/node';

const COOKIE='__Host-mrh_cms';
const SESSION_SECONDS=8*60*60;

export const adminConfigured=()=>{
 const email=process.env.ADMIN_EMAIL?.trim();
 const password=process.env.ADMIN_PASSWORD;
 return !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !!password && password.length>=16;
};
const safeMatch=(first:string,second:string)=>{
 const a=createHash('sha256').update(first).digest();
 const b=createHash('sha256').update(second).digest();
 return timingSafeEqual(Uint8Array.from(a),Uint8Array.from(b));
};
export const validCredentials=(email:unknown,password:unknown)=>{
 if(!adminConfigured()||typeof email!=='string'||typeof password!=='string')return false;
 return safeMatch(email.trim().toLowerCase(),process.env.ADMIN_EMAIL!.trim().toLowerCase())
   && safeMatch(password,process.env.ADMIN_PASSWORD!);
};
const key=()=>createHmac('sha256',process.env.ADMIN_PASSWORD!)
 .update('mrhossein-cms-cookie-v1:'+process.env.ADMIN_EMAIL!.trim().toLowerCase()).digest();
const signature=(value:string)=>createHmac('sha256',Uint8Array.from(key())).update(value).digest();
const cookieHeader=(token:string,maxAge:number)=>COOKIE+'='+token+'; Path=/; Max-Age='+maxAge+'; HttpOnly; Secure; SameSite=Strict';
export const createAdminSession=(res:VercelResponse)=>{
 const expires=Date.now()+SESSION_SECONDS*1000;
 const data='v1.'+expires+'.'+randomBytes(24).toString('base64url');
 const token=data+'.'+signature(data).toString('base64url');
 res.setHeader('Set-Cookie',cookieHeader(token,SESSION_SECONDS));
};
export const clearAdminSession=(res:VercelResponse)=>res.setHeader('Set-Cookie',cookieHeader('',0));
export const hasAdminSession=(req:VercelRequest)=>{
 if(!adminConfigured())return false;
 const token=req.cookies?.[COOKIE];
 if(typeof token!=='string'||token.length>200)return false;
 const parts=token.split('.');
 if(parts.length!==4||parts[0]!=='v1'||!/^\d{13}$/.test(parts[1])||!/^[A-Za-z0-9_-]{32}$/.test(parts[2]))return false;
 const expiry=Number(parts[1]);
 if(!Number.isSafeInteger(expiry)||expiry<=Date.now()||expiry>Date.now()+SESSION_SECONDS*1000)return false;
 try{
  const actual=Buffer.from(parts[3],'base64url');
  const expected=signature(parts.slice(0,3).join('.'));
  return actual.length===expected.length&&timingSafeEqual(Uint8Array.from(actual),Uint8Array.from(expected));
 }catch{return false}
};
