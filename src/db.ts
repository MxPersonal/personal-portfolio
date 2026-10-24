import {createClient} from '@supabase/supabase-js';
import type {Localized} from './content';
const url=import.meta.env.VITE_SUPABASE_URL as string|undefined;
const key=import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined;
export const cmsConfigured=Boolean(url&&key);
export const supabase=cmsConfigured?createClient(url!,key!,{auth:{persistSession:true,autoRefreshToken:true}}):null;
export type ProjectStatus='real'|'progress'|'concept'|'research';
export type Project={id:string;slug:string;title:Localized;summary:Localized;body:Localized;status:ProjectStatus;category:string;stack:string[];role:Localized;cover_url:string|null;video_url:string|null;demo_url:string|null;repo_url:string|null;featured:boolean;published:boolean;sort_order:number;created_at?:string;};
export type SiteSetting={key:string;value:unknown};
export const emptyProjects:Project[]=[];
export async function loadProjects():Promise<Project[]>{
 if(!supabase)return [];
 const {data,error}=await supabase.from('portfolio_projects').select('id,slug,title,summary,body,status,category,stack,role,cover_url,video_url,demo_url,repo_url,featured,published,sort_order,created_at').eq('published',true).order('sort_order',{ascending:true}).order('created_at',{ascending:false});
 if(error)throw error;
 return (data||[]) as Project[];
}
export async function loadSetting(keyName:string):Promise<unknown>{
 if(!supabase)return null;
 const {data}=await supabase.from('portfolio_settings').select('value').eq('key',keyName).maybeSingle();
 return data?.value??null;
}
export async function isAdmin():Promise<boolean>{
 if(!supabase)return false;
 const {data:user}=await supabase.auth.getUser();
 if(!user.user)return false;
 const {data,error}=await supabase.from('portfolio_admins').select('user_id').eq('user_id',user.user.id).maybeSingle();
 return !error&&Boolean(data);
}
export const imgSrc=(src?:string|null)=>src||'';