import {createAuthClient} from '@neondatabase/neon-js/auth';
import type {Localized} from './content';

const authUrl=import.meta.env.VITE_NEON_AUTH_URL as string|undefined;
export const cmsConfigured=Boolean(authUrl);
export const neonAuth=authUrl?createAuthClient(authUrl,{fetchOptions:{credentials:'include'}}):null;

export type ProjectStatus='real'|'progress'|'concept'|'research';
export type Project={
 id:string;slug:string;title:Localized;summary:Localized;body:Localized;status:ProjectStatus;
 category:string;stack:string[];role:Localized;cover_url:string|null;video_url:string|null;demo_url:string|null;repo_url:string|null;
 featured:boolean;published:boolean;sort_order:number;created_at?:string;
};
export type SiteSetting={key:string;value:unknown};
export const emptyProjects:Project[]=[];

type ResponseData={data:any;error:Error|null};
type Filter={field:string;value:string|number|boolean};
type Order={field:string;ascending:boolean};
const resultError=(e:unknown):ResponseData=>({data:null,error:e instanceof Error?e:new Error(String(e))});
const jwt=async()=>{
 if(!neonAuth)return '';
 try{const {data,error}=await neonAuth.token();if(error)throw Error(error.message);return data?.token||''}catch{return ''}
};
export async function cmsFetch(table:string,opts:{mode?:'select'|'insert'|'update'|'delete'|'upsert';data?:unknown;filters?:Filter[];orders?:Order[];limit?:number;auth?:boolean}={}):Promise<ResponseData>{
 try{
  const mode=opts.mode||'select';
  const token=await jwt();
  const headers:Record<string,string>={'Content-Type':'application/json'};
  if(token)headers.Authorization='Bearer '+token;
  const params=new URLSearchParams({table,filters:JSON.stringify(opts.filters||[]),orders:JSON.stringify(opts.orders||[]),limit:String(opts.limit||100)});
  const response=await fetch('/api/cms'+(mode==='select'?'?'+params.toString():''),{
   method:mode==='select'?'GET':mode==='update'?'PATCH':mode==='delete'?'DELETE':'POST',
   headers,
   ...(mode==='select'?{}:{body:JSON.stringify({table,data:opts.data,filters:opts.filters,upsert:mode==='upsert'})})
  });
  const payload=await response.json();
  if(!response.ok)throw Error(payload.error||'Request failed ('+response.status+')');
  return {data:payload.data??null,error:null};
 }catch(e){return resultError(e)}
}
class Query implements PromiseLike<ResponseData>{
 table:string;mode:'select'|'insert'|'update'|'delete'|'upsert'='select';
 fields='*';filters:Filter[]=[];orders:Order[]=[];count=100;single=false;data?:unknown;
 constructor(table:string){this.table=table}
 select(fields:string){this.fields=fields;return this}
 eq(field:string,value:string|number|boolean){this.filters.push({field,value});return this}
 order(field:string,opts?:{ascending?:boolean}){this.orders.push({field,ascending:opts?.ascending!==false});return this}
 limit(value:number){this.count=value;return this}
 maybeSingle(){this.single=true;return this}
 insert(data:unknown){this.mode='insert';this.data=data;return this}
 upsert(data:unknown,_options?:{onConflict?:string}){this.mode='upsert';this.data=data;return this}
 update(data:Record<string,unknown>){this.mode='update';this.data=data;return this}
 delete(){this.mode='delete';return this}
 async perform():Promise<ResponseData>{
  const result=await cmsFetch(this.table,{mode:this.mode,data:this.data,filters:this.filters,orders:this.orders,limit:this.count});
  if(result.error)return result;
  return {...result,data:this.single?(result.data?.[0]??null):result.data};
 }
 then<TResult1=ResponseData,TResult2=never>(onfulfilled?:((value:ResponseData)=>TResult1|PromiseLike<TResult1>)|null,onrejected?:((reason:any)=>TResult2|PromiseLike<TResult2>)|null):Promise<TResult1|TResult2>{
  return this.perform().then(onfulfilled,onrejected)
 }
}
async function upload(_bucket:string,path:string,file:File){
 try{
  if(!file.size||file.size>4*1024*1024)throw Error('Upload limit: 4 MB. Use a hosted image URL for larger media.');
  const token=await jwt();
  if(!token)throw Error('Sign in to upload files');
  const bytes=new Uint8Array(await file.arrayBuffer());let binary='';
  for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.slice(i,i+0x8000));
  const r=await fetch('/api/upload',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({name:path,type:file.type,data:btoa(binary)})});
  const response=await r.json();
  if(!r.ok)throw Error(response.error||'Upload failed');
  return {data:{path:response.url},error:null};
 }catch(e){return resultError(e)}
}
export const supabase=cmsConfigured?{
 from:(table:string)=>new Query(table),
 auth:{
  getSession:async()=>{
   if(!neonAuth)return {data:{session:null}};
   try{const r=await neonAuth.getSession();return {data:{session:r.data?.session??null}}}catch{return {data:{session:null}}}
  },
  getUser:async()=>{
   if(!neonAuth)return {data:{user:null}};
   try{const r=await neonAuth.getSession();return {data:{user:r.data?.user??null}}}catch{return {data:{user:null}}}
  },
  signOut:async()=>{if(!neonAuth)return;await neonAuth.signOut();window.location.assign('/admin')},
  signInWithPassword:async({email,password}:{email:string;password:string})=>{
   if(!neonAuth)return {error:new Error('Auth unavailable')};
   const r=await neonAuth.signIn.email({email,password});return {error:r.error?new Error(r.error.message):null}
  },
  signUpWithPassword:async({email,password}:{email:string;password:string})=>{
   if(!neonAuth)return {error:new Error('Auth unavailable'),requiresVerification:false};
   const r=await neonAuth.signUp.email({name:email.split('@')[0]||'Portfolio Admin',email,password});
   return {error:r.error?new Error(r.error.message):null,requiresVerification:!!r.data?.user&&!r.data.user.emailVerified}
  },
  verifyEmail:async({email,otp}:{email:string;otp:string})=>{
   if(!neonAuth)return {error:new Error('Auth unavailable')};
   const r=await neonAuth.emailOtp.verifyEmail({email,otp});return {error:r.error?new Error(r.error.message):null}
  }
 },
 storage:{from:(bucket:string)=>({
  upload:(path:string,file:File,_options?:unknown)=>upload(bucket,path,file),
  getPublicUrl:(path:string)=>({data:{publicUrl:path}})
 })}
}:null;

export async function loadProjects():Promise<Project[]>{
 if(!supabase)return [];
 const {data,error}=await supabase.from('portfolio_projects').select('*').eq('published',true).order('sort_order',{ascending:true}).order('created_at',{ascending:false});
 if(error)throw error;return (data||[]) as Project[];
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
