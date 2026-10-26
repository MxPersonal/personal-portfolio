import type {VercelRequest,VercelResponse} from '@vercel/node';
import {getAdmin,noStore,query,sameOrigin} from './_db.js';

type Spec={fields:readonly string[];key:readonly string[];public:boolean};
const specs:Record<string,Spec>={
 portfolio_projects:{fields:['id','slug','title','summary','body','role','status','category','stack','cover_url','video_url','demo_url','repo_url','featured','published','sort_order','created_at','updated_at'],key:['slug'],public:true},
 portfolio_cms_entries:{fields:['id','kind','slug','title','description','body','group_key','image_url','link_url','published','sort_order','meta','created_at','updated_at'],key:['kind','slug'],public:true},
 portfolio_settings:{fields:['key','value','updated_at'],key:['key'],public:true},
 portfolio_inquiries:{fields:['id','reference','full_name','email','service','message','budget','locale','status','created_at'],key:[],public:false},
 portfolio_admins:{fields:['user_id','created_at'],key:[],public:false}
};
const writable:Record<string,string[]>={
 portfolio_projects:['slug','title','summary','body','role','status','category','stack','cover_url','video_url','demo_url','repo_url','featured','published','sort_order'],
 portfolio_cms_entries:['kind','slug','title','description','body','group_key','image_url','link_url','published','sort_order','meta'],
 portfolio_settings:['key','value'],
 portfolio_inquiries:['status']
};
const publicSettings=new Set(['availability','cms_initialized','availability_visible']);
const allowedKinds=new Set(['section','copy','service_group','service','skill','social','gallery','journey','page']);
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isObj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const goodUrl=(x:unknown)=>{
 if(x===null||x==='')return true;
 if(typeof x!=='string'||x.length>2048)return false;
 if(x.startsWith('/')&&!x.startsWith('//'))return true;
 try{return ['https:','http:'].includes(new URL(x).protocol)}catch{return false}
};
const quote=(key:string)=>'"'+key+'"';
const parseFilters=(raw:unknown,spec:Spec)=>{
 if(!Array.isArray(raw)||raw.length>8)throw Error('Invalid filters');
 return raw.map(x=>{
  if(!isObj(x)||typeof x.field!=='string'||!spec.fields.includes(x.field)||!['string','number','boolean'].includes(typeof x.value))throw Error('Invalid filter');
  return {field:x.field,value:x.value};
 });
};
const boolKeys=new Set(['featured','published']);
const localizedKeys=new Set(['title','summary','body','role','description']);
function validate(table:string,body:unknown){
 if(!isObj(body))throw Error('Invalid data');
 const keys=Object.keys(body);
 if(!keys.length||keys.length>30||keys.some(k=>!writable[table]?.includes(k)))throw Error('Unsupported fields');
 for(const key of keys){
  const v=body[key];
  if(localizedKeys.has(key)&&(!isObj(v)||typeof v.fa!=='string'||typeof v.en!=='string'||v.fa.length>12000||v.en.length>12000))throw Error('Invalid bilingual text');
  if(['image_url','link_url','cover_url','video_url','repo_url','demo_url'].includes(key)&&!goodUrl(v))throw Error('Invalid URL');
  if(['slug'].includes(key)&&(typeof v!=='string'||v.length>95||!slug.test(v)))throw Error('Invalid slug');
  if(key==='kind'&&!allowedKinds.has(String(v)))throw Error('Invalid type');
  if(key==='status'&&!(table==='portfolio_inquiries'?['new','reviewing','replied','closed']:['real','progress','concept','research']).includes(String(v)))throw Error('Invalid status');
  if(boolKeys.has(key)&&typeof v!=='boolean')throw Error('Invalid boolean');
  if(key==='sort_order'&&(typeof v!=='number'||!Number.isInteger(v)||Math.abs(v)>1000000))throw Error('Invalid sort order');
  if(key==='stack'&&(!Array.isArray(v)||v.length>30||v.some(x=>typeof x!=='string'||x.length>80)))throw Error('Invalid stack');
  if(key==='meta'&&(!isObj(v)||JSON.stringify(v).length>15000))throw Error('Invalid meta');
  if(key==='value'&&JSON.stringify(v).length>15000)throw Error('Invalid value');
  if(key==='key'&&(!['availability','availability_visible','cms_initialized'].includes(String(v))))throw Error('Setting not allowed');
  if(key==='group_key'&&(typeof v!=='string'||v.length>100))throw Error('Invalid group');
 }
 return body;
}
const fail=(res:VercelResponse,code:number,error:string)=>res.status(code).json({error});
export default async function handler(req:VercelRequest,res:VercelResponse){
 noStore(res);
 if(!['GET','POST','PATCH','DELETE'].includes(req.method||''))return fail(res,405,'Method not allowed');
 if(req.method!=='GET'&&!sameOrigin(req))return fail(res,403,'Invalid origin');
 if(Number(req.headers['content-length']||0)>180000)return fail(res,413,'Request too large');
 const isGet=req.method==='GET';
 const table=String(isGet?req.query.table:(req.body||{}).table||'');
 const spec=specs[table];if(!spec)return fail(res,400,'Unsupported table');
 if(!process.env.DATABASE_URL)return fail(res,503,'Neon database is not configured');
 try{
  const admin=await getAdmin(req);
  if(!isGet&&!admin)return fail(res,403,'Admin role required');
  if(isGet&&!admin&&!spec.public)return fail(res,403,'Admin role required');
  if(isGet){
   const filters=parseFilters(JSON.parse(String(req.query.filters||'[]')),spec);
   const sorts=JSON.parse(String(req.query.orders||'[]'));
   if(!Array.isArray(sorts)||sorts.length>3)throw Error('Invalid order');
   let terms:string[]=[];let values:unknown[]=[];
   for(const f of filters){values.push(f.value);terms.push(quote(f.field)+'=$'+values.length)}
   if(!admin){
    if(table==='portfolio_projects'||table==='portfolio_cms_entries')terms.push('"published"=true');
    if(table==='portfolio_settings'){
     if(filters.find(f=>f.field==='key'&&!publicSettings.has(String(f.value))))return fail(res,403,'Private setting');
     terms.push('"key" IN (\'availability\',\'cms_initialized\',\'availability_visible\')');
    }
   }
   const orders=sorts.map(x=>{if(!isObj(x)||typeof x.field!=='string'||!spec.fields.includes(x.field))throw Error('Invalid order');return quote(x.field)+(x.ascending===false?' DESC':' ASC')}).join(',');
   const limit=Math.min(150,Math.max(1,Number(req.query.limit)||100));
   const sql='SELECT * FROM public.'+quote(table)+(terms.length?' WHERE '+terms.join(' AND '):'')+(orders?' ORDER BY '+orders:'')+' LIMIT '+limit;
   const r=await query(sql,values);
   return res.status(200).json({data:r.rows});
  }
  if(req.method==='DELETE'){
   const filters=parseFilters(req.body?.filters,spec);
   if(table==='portfolio_admins'||table==='portfolio_inquiries')return fail(res,403,'Protected table');
   if(filters.length!==1||filters[0].field!=='id')return fail(res,400,'Primary key required');
   const r=await query('DELETE FROM public.'+quote(table)+' WHERE "id"=$1 RETURNING *',[filters[0].value]);
   return res.status(200).json({data:r.rows});
  }
  const input=req.body?.data;
  let rows=Array.isArray(input)?input.map(x=>validate(table,x)):[validate(table,input)];
  if(!rows.length||rows.length>120)throw Error('Invalid batch');
  // The legacy default seed used to produce duplicate (kind,slug) keys for C and C++.
  // PostgreSQL does not permit updating the same conflicting row twice in one INSERT.
  // Keep the last row for duplicate keys in a single upsert request.
  if(req.method==='POST'&&req.body?.upsert&&spec.key.length){
   const unique=new Map<string,Record<string,unknown>>();
   for(const row of rows)unique.set(JSON.stringify(spec.key.map(k=>row[k])),row);
   rows=[...unique.values()];
  }
  const keys=Object.keys(rows[0]);
  if(rows.some(d=>JSON.stringify(Object.keys(d).sort())!==JSON.stringify([...keys].sort())))throw Error('Invalid batch keys');
  if(req.method==='POST'){
   if(table==='portfolio_admins'||table==='portfolio_inquiries')return fail(res,403,'Protected table');
   if(!rows.every(r=>spec.key.every(k=>k in r))&&req.body?.upsert)throw Error('Invalid upsert key');
   const values=rows.flatMap(row=>keys.map(k=>row[k]));
   const tuples=rows.map((_,r)=>'('+keys.map((_,c)=>'$'+(r*keys.length+c+1)).join(',')+')').join(',');
   const conflict=spec.key.map(quote).join(',');
   const updatable=keys.filter(k=>!spec.key.includes(k));
   const upsertSql=req.body?.upsert&&conflict?' ON CONFLICT ('+conflict+') '+(updatable.length?'DO UPDATE SET '+updatable.map(k=>quote(k)+'=EXCLUDED.'+quote(k)).join(','):'DO NOTHING'):'';
   const sql='INSERT INTO public.'+quote(table)+' ('+keys.map(quote).join(',')+') VALUES '+tuples+upsertSql+' RETURNING *';
   const r=await query(sql,values);
   return res.status(200).json({data:r.rows});
  }
  const filters=parseFilters(req.body?.filters,spec);
  if(filters.length!==1||!(table==='portfolio_settings'?filters[0].field==='key':filters[0].field==='id'))return fail(res,400,'Only primary-key writes are allowed');
  if(table==='portfolio_admins'||table==='portfolio_inquiries'&&keys.some(k=>k!=='status'))return fail(res,403,'Protected fields');
  const data=rows[0];
  const values=keys.map(k=>data[k]);
  const setter=keys.map((k,i)=>quote(k)+'=$'+(i+1)).join(',');
  const r=await query('UPDATE public.'+quote(table)+' SET '+setter+' WHERE '+quote(filters[0].field)+'=$'+(keys.length+1)+' RETURNING *',[...values,filters[0].value]);
  return res.status(200).json({data:r.rows});
 }catch(e){
  const message=e instanceof Error?e.message:'Unknown error';
  if(/^(Invalid|Unsupported|Setting not allowed)/.test(message))return fail(res,400,message);
  console.error('CMS operation failed:',message);
  return fail(res,503,'Database operation failed');
 }
}
