import type {VercelRequest,VercelResponse} from '@vercel/node';
import {getUser,noStore,query} from './_db.js';

export default async function handler(req:VercelRequest,res:VercelResponse){
 noStore(res);
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const present=typeof req.headers.authorization==='string'&&req.headers.authorization.startsWith('Bearer ');
 if(!present)return res.status(200).json({authenticated:false,admin:false,reason:'token_missing'});
 if(!process.env.NEON_AUTH_BASE_URL)return res.status(503).json({authenticated:false,admin:false,reason:'auth_config_missing'});
 const id=await getUser(req);
 if(!id)return res.status(200).json({authenticated:false,admin:false,reason:'token_invalid_or_expired'});
 try{
  const r=await query('SELECT EXISTS(SELECT 1 FROM public.portfolio_admins WHERE user_id=$1::uuid) AS approved',[id]);
  return res.status(200).json({authenticated:true,admin:r.rows[0]?.approved===true,reason:r.rows[0]?.approved===true?'ok':'admin_role_missing'});
 }catch(err){
  console.error('CMS admin permission lookup failed',err instanceof Error?err.message:'unknown');
  return res.status(503).json({authenticated:true,admin:false,reason:'database_unavailable'});
 }
}
