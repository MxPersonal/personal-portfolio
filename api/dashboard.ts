import type {VercelRequest,VercelResponse} from '@vercel/node';
import {getAdmin,noStore,query} from './_db.js';

export default async function dashboard(req:VercelRequest,res:VercelResponse){
 noStore(res);
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 if(!process.env.DATABASE_URL)return res.status(503).json({error:'Neon database connection is missing'});
 try{
  const admin=await getAdmin(req);
  if(!admin)return res.status(403).json({error:'Admin authorization required'});
  const [projects,content,settings,inquiries]=await Promise.all([
   query('SELECT * FROM public.portfolio_projects ORDER BY sort_order ASC,created_at DESC LIMIT 400'),
   query('SELECT * FROM public.portfolio_cms_entries ORDER BY kind,sort_order ASC,slug ASC LIMIT 1200'),
   query('SELECT key,value,updated_at FROM public.portfolio_settings ORDER BY key LIMIT 100'),
   query('SELECT id,reference,full_name,email,service,message,budget,locale,status,created_at FROM public.portfolio_inquiries ORDER BY created_at DESC LIMIT 150')
  ]);
  return res.status(200).json({projects:projects.rows,entries:content.rows,settings:settings.rows,inquiries:inquiries.rows,counts:{projects:projects.rowCount,content:content.rowCount,inquiries:inquiries.rowCount}});
 }catch(error){
  console.error('CMS dashboard read failed',error instanceof Error?error.message:'unknown');
  return res.status(503).json({error:'Neon dashboard query failed. Check Vercel runtime logs.'});
 }
}