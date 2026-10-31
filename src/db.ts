import type {Localized} from './content';

export const cmsConfigured=true;

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
type AdminStatus={admin:boolean;reason:string};
export async function adminStatus():Promise<AdminStatus>{
 try{
  const r=await fetch('/api/admin-status',{credentials:'same-origin',cache:'no-store'});
  const body=await r.json() as {admin?:boolean;reason?:string};
  return {admin:r.ok&&body.admin===true,reason:body.reason||'unknown'};
 }catch{return {admin:false,reason:'connection_failed'}}
}
export async function adminLogin(email:string,password:string):Promise<void>{
 const r=await fetch('/api/admin-session',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password}),cache:'no-store'});
 const response=await r.json() as {error?:string};
 if(!r.ok)throw new Error(response.error||'Admin login failed');
}
export async function adminLogout():Promise<void>{
 const r=await fetch('/api/admin-session',{method:'DELETE',credentials:'same-origin',cache:'no-store'});
 if(!r.ok)throw new Error('Could not sign out');
 window.location.assign('/cms/admin');
}
export async function cmsFetch(table:string,opts:{mode?:'select'|'insert'|'update'|'delete'|'upsert';data?:unknown;filters?:Filter[];orders?:Order[];limit?:number;auth?:boolean}={}):Promise<ResponseData>{
 try{
  const mode=opts.mode||'select';
  const headers:Record<string,string>={'Content-Type':'application/json'};
  const params=new URLSearchParams({table,filters:JSON.stringify(opts.filters||[]),orders:JSON.stringify(opts.orders||[]),limit:String(opts.limit||100)});
  const response=await fetch('/api/cms'+(mode==='select'?'?'+params.toString():''),{
   method:mode==='select'?'GET':mode==='update'?'PATCH':mode==='delete'?'DELETE':'POST',
   headers,
   credentials:'same-origin',
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
  const bytes=new Uint8Array(await file.arrayBuffer());let binary='';
  for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.slice(i,i+0x8000));
  const r=await fetch('/api/upload',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:path,type:file.type,data:btoa(binary)})});
  const response=await r.json();
  if(!r.ok)throw Error(response.error||'Upload failed');
  return {data:{path:response.url},error:null};
 }catch(e){return resultError(e)}
}
export const supabase={
 from:(table:string)=>new Query(table),
 storage:{from:(bucket:string)=>({
  upload:(path:string,file:File,_options?:unknown)=>upload(bucket,path,file),
  getPublicUrl:(path:string)=>({data:{publicUrl:path}})
 })}
};

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
export async function isAdmin():Promise<boolean>{return (await adminStatus()).admin}
export const imgSrc=(src?:string|null)=>src||'';
