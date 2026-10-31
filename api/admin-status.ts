import type {VercelRequest,VercelResponse} from '@vercel/node';
import {adminConfigured,hasAdminSession} from '../lib/admin-session.js';
import {noStore} from './_db.js';

export default function handler(req:VercelRequest,res:VercelResponse){
 noStore(res);
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 if(!adminConfigured())return res.status(503).json({authenticated:false,admin:false,reason:'admin_config_missing'});
 const admin=hasAdminSession(req);
 return res.status(200).json({authenticated:admin,admin,reason:admin?'ok':'session_missing_or_expired'});
}
