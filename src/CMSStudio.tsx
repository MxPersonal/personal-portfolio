import React,{useEffect,useMemo,useState} from 'react';
import {ArrowDown,ArrowUp,Check,Copy,FilePlus2,ImagePlus,LoaderCircle,Plus,RotateCcw,Save,Search,Trash2,X} from 'lucide-react';
import {supabase} from './db';
import {CMS_KINDS,defaultCMS,kindLabels,blankEntry,slugify,safeUrl,type CmsEntry,type CmsKind} from './cms';
import type {Lang,Localized} from './content';

type Editor={item:CmsEntry;metaText:string};
const labels={
 fa:{title:'مدیریت کامل محتوای سایت',subtitle:'متن‌ها، صفحه‌ها، خدمات، مهارت‌ها، لینک‌ها، تصاویر و ترتیب نمایش بدون تغییر کد.',initialize:'راه‌اندازی محتوای قابل ویرایش',initNote:'پیش از شروع، نسخه فعلی محتوا به دیتابیس وارد می‌شود. انتشار یک رکورد را می‌توان جداگانه کنترل کرد.',new:'افزودن',edit:'ویرایش',save:'ذخیره تغییرات',cancel:'بستن',delete:'حذف',confirm:'این مورد واقعاً حذف شود؟',yes:'منتشر شده',no:'پیش‌نویس / مخفی',empty:'موردی در این دسته ثبت نشده است.',search:'جست‌وجو...',slug:'شناسه یکتا (انگلیسی)',fa:'فارسی',en:'انگلیسی',short:'توضیح کوتاه',body:'متن کامل',group:'گروه / دسته',image:'لینک تصویر یا ویدئو',url:'لینک مقصد',order:'ترتیب نمایش',published:'نمایش عمومی',meta:'تنظیمات پیشرفته (JSON)',upload:'آپلود رسانه',error:'خطا',loading:'بارگذاری...',notReady:'برای کارکرد CMS ابتدا اتصال Supabase و جدول‌های دیتابیس را راه‌اندازی کن.',copy:'کپی رکورد',reset:'تازه‌سازی',kind:'نوع محتوا',updated:'تغییرات ذخیره شد',editMeta:'ساختار JSON معتبر نیست.',invalidSlug:'شناسه فقط شامل حروف کوچک انگلیسی، عدد و خط فاصله باشد.',noKey:'لطفاً شناسه‌ای یکتا وارد کن.',reorder:'جابه‌جایی',all:'همه موارد',initProjects:'سه پروژه شناخته‌شده در صورت خالی بودن جدول پروژه‌ها اضافه می‌شوند.'},
 en:{title:'Portfolio CMS Studio',subtitle:'Manage pages, copy, services, skills, social links, media, publication and display order.',initialize:'Initialize editable content',initNote:'Import the existing content into your database, then manage visibility and edits individually.',new:'Add new',edit:'Edit',save:'Save changes',cancel:'Close',delete:'Delete',confirm:'Delete this item permanently?',yes:'Published',no:'Draft / hidden',empty:'No records in this collection.',search:'Search...',slug:'Unique identifier (English)',fa:'Persian',en:'English',short:'Short description',body:'Full body',group:'Group / category',image:'Media URL',url:'Target URL',order:'Display order',published:'Published',meta:'Advanced settings (JSON)',upload:'Upload media',error:'Error',loading:'Loading...',notReady:'Connect Supabase and run the database setup first.',copy:'Duplicate',reset:'Refresh',kind:'Content type',updated:'Changes saved',editMeta:'Invalid JSON settings.',invalidSlug:'Use only lowercase letters, numbers and hyphens.',noKey:'Enter a unique identifier.',reorder:'Reorder',all:'All entries',initProjects:'Three verified repositories will be added if there are no projects.'}
};
const clone=(e:CmsEntry):CmsEntry=>({...e,title:{...e.title},description:{...e.description},body:{...e.body},meta:{...e.meta}});
const isValidUrl=(u:string|null)=>!u||!!safeUrl(u,true);
const fallbackProjectRows=[
 {slug:'personal-portfolio',title:{fa:'وب‌سایت شخصی Mr.HoSSein',en:'Mr.HoSSein Portfolio'},summary:{fa:'پورتفولیوی در حال توسعه',en:'Portfolio in progress'},body:{fa:'',en:''},role:{fa:'توسعه و طراحی',en:'Design and development'},status:'progress',category:'web',stack:['React','TypeScript'],repo_url:'https://github.com/MxPersonal/personal-portfolio',published:true,featured:true,sort_order:10},
 {slug:'noghlijan-ecommerce',title:{fa:'فروشگاه نقلیجان',en:'Noghlijan E-Commerce'},summary:{fa:'فروشگاه اینترنتی در حال توسعه',en:'E-commerce website in progress'},body:{fa:'',en:''},role:{fa:'توسعه وب',en:'Web development'},status:'progress',category:'ecommerce',stack:['Next.js'],repo_url:'https://github.com/MxPersonal/z-noghlijan.ir-temp',published:true,featured:true,sort_order:20},
 {slug:'safir-honar',title:{fa:'چاپ سفیر هنر',en:'Safir Honar Print Center'},summary:{fa:'سامانه چاپ در حال توسعه',en:'Print platform in progress'},body:{fa:'',en:''},role:{fa:'توسعه وب',en:'Web development'},status:'progress',category:'web',stack:['React','Next.js'],repo_url:'https://github.com/MxPersonal/safirehonarchapcenter',published:true,featured:true,sort_order:30}
];
export default function CMSStudio({lang,onRefresh}:{lang:Lang;onRefresh:()=>void}){
 const t=labels[lang];
 const [kind,setKind]=useState<CmsKind>('section'),[items,setItems]=useState<CmsEntry[]>([]),[initialized,setInitialized]=useState(false);
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[search,setSearch]=useState('');
 const [editing,setEditing]=useState<Editor|null>(null);
 const filtered=useMemo(()=>items.filter(x=>x.kind===kind&&(x.slug+' '+x.title.fa+' '+x.title.en).toLowerCase().includes(search.toLowerCase())).sort((a,b)=>a.sort_order-b.sort_order||a.slug.localeCompare(b.slug)),[items,kind,search]);
 async function refresh(){
  if(!supabase){setMessage(t.notReady);setLoading(false);return;}
  setLoading(true);
  const [r,state]=await Promise.all([supabase.from('portfolio_cms_entries').select('*').order('sort_order'),supabase.from('portfolio_settings').select('value').eq('key','cms_initialized').maybeSingle()]);
  if(r.error||state.error){setMessage(r.error?.message||state.error?.message||t.notReady);setItems([])}
  else{setInitialized(state.data?.value===true);setItems((state.data?.value===true?r.data:defaultCMS) as CmsEntry[]);setMessage('')}
  setLoading(false);
 }
 useEffect(()=>{void refresh()},[]);
 async function initialize(){
  if(!supabase)return;
  setBusy(true);setMessage('');
  try{
   const seed=defaultCMS.map(({id,updated_at,...x})=>x);
   const r=await supabase.from('portfolio_cms_entries').upsert(seed,{onConflict:'kind,slug'});
   if(r.error)throw r.error;
   const projects=await supabase.from('portfolio_projects').select('id').limit(1);
   if(projects.error)throw projects.error;
   if(!projects.data?.length){
    const p=await supabase.from('portfolio_projects').insert(fallbackProjectRows);
    if(p.error)throw p.error;
   }
   const s=await supabase.from('portfolio_settings').upsert({key:'cms_initialized',value:true},{onConflict:'key'});
   if(s.error)throw s.error;
   setInitialized(true);await refresh();onRefresh();
  }catch(e){setMessage(String((e as Error).message||e))}
  finally{setBusy(false)}
 }
 function start(entry?:CmsEntry){
  const v=clone(entry||blankEntry(kind));
  setEditing({item:v,metaText:JSON.stringify(v.meta,null,2)});
  setMessage('');
 }
 function patch(partial:Partial<CmsEntry>){setEditing(v=>v?{...v,item:{...v.item,...partial}}:v)}
 function patchLocalized(field:'title'|'description'|'body',key:'fa'|'en',value:string){
  setEditing(v=>v?{...v,item:{...v.item,[field]:{...v.item[field],[key]:value}}}:v);
 }
 async function save(){
  if(!supabase||!editing||!initialized)return;
  const e=editing.item,slug=slugify(e.slug);
  if(!slug){setMessage(t.noKey);return}
  if(slug!==e.slug){setMessage(t.invalidSlug);return}
  let meta:Record<string,unknown>;
  try{const val=JSON.parse(editing.metaText);if(!val||typeof val!=='object'||Array.isArray(val))throw Error();meta=val}
  catch{setMessage(t.editMeta);return}
  if(!isValidUrl(e.image_url)||!isValidUrl(e.link_url)){setMessage(lang==='fa'?'آدرس تصویر یا لینک معتبر نیست.':'Invalid media or link URL');return}
  setBusy(true);setMessage('');
  const {id,updated_at,...fields}=e;
  const record={...fields,meta,image_url:e.image_url? safeUrl(e.image_url,true):null,link_url:e.link_url?safeUrl(e.link_url,true):null};
  const res=id&&!id.startsWith('default-')
   ?await supabase.from('portfolio_cms_entries').update(record).eq('id',id)
   :await supabase.from('portfolio_cms_entries').upsert(record,{onConflict:'kind,slug'});
  if(res.error)setMessage(res.error.message);
  else{setEditing(null);setMessage(t.updated);await refresh();onRefresh()}
  setBusy(false);
 }
 async function remove(e:CmsEntry){
  if(!supabase||!initialized||!confirm(t.confirm))return;
  if(e.id.startsWith('default-'))return;
  const r=await supabase.from('portfolio_cms_entries').delete().eq('id',e.id);
  if(r.error)setMessage(r.error.message);else{await refresh();onRefresh()}
 }
 async function move(e:CmsEntry,direction:-1|1){
  if(!supabase||!initialized)return;
  const pos=filtered.findIndex(x=>x.id===e.id),peer=filtered[pos+direction];
  if(!peer)return;
  setBusy(true);
  const a=await supabase.from('portfolio_cms_entries').update({sort_order:peer.sort_order}).eq('id',e.id);
  const b=await supabase.from('portfolio_cms_entries').update({sort_order:e.sort_order}).eq('id',peer.id);
  if(a.error||b.error)setMessage(a.error?.message||b.error?.message||t.error);
  else{await refresh();onRefresh()}
  setBusy(false);
 }
 async function upload(file:File){
  if(!supabase||!editing)return;
  const mime=['image/jpeg','image/png','image/webp','image/avif','image/gif','video/mp4','video/webm'];
  if(file.size>15*1024*1024||!mime.includes(file.type)){setMessage(lang==='fa'?'فقط تصویر یا ویدیوی مجاز تا ۱۵ مگابایت.':'Image/video up to 15MB only.');return}
  setBusy(true);
  const extension=file.name.split('.').pop()?.replace(/[^a-z0-9]/gi,'').slice(0,8)||'bin';
  const key='site/'+editing.item.kind+'/'+crypto.randomUUID()+'.'+extension;
  const r=await supabase.storage.from('portfolio-media').upload(key,file,{contentType:file.type,upsert:false});
  if(r.error)setMessage(r.error.message);
  else{const url=supabase.storage.from('portfolio-media').getPublicUrl(key).data.publicUrl;patch({image_url:url});setMessage(lang==='fa'?'آپلود موفق؛ برای انتشار «ذخیره تغییرات» را بزن.':'Uploaded. Save this record to publish.')}
  setBusy(false);
 }
 return <div className="cms-studio" dir={lang==='fa'?'rtl':'ltr'}>
  <div className="cms-head"><div><span className="cms-kicker">MR.HOSSEIN / CONTENT MANAGEMENT</span><h2>{t.title}</h2><p>{t.subtitle}</p></div><button className="cms-secondary" onClick={refresh} type="button"><RotateCcw size={16}/>{t.reset}</button></div>
  {message&&<p role="status" className="cms-status">{message}</p>}
  {!initialized&&!loading&&<div className="cms-onboard"><h3>{t.initialize}</h3><p>{t.initNote}</p><p>{t.initProjects}</p><button disabled={busy} onClick={initialize} className="cms-primary">{busy?<LoaderCircle size={17}/>:<Check size={17}/>} {t.initialize}</button></div>}
  <div className="cms-layout"><nav className="cms-sidebar" aria-label={t.kind}>{CMS_KINDS.map(k=><button type="button" key={k} className={kind===k?'selected':''} onClick={()=>{setKind(k);setSearch('');setEditing(null)}}>{kindLabels[k][lang]} <small>{items.filter(x=>x.kind===k).length}</small></button>)}</nav>
   <section className="cms-main"><div className="cms-toolbar"><h3>{kindLabels[kind][lang]}</h3><div className="cms-actions"><label className="cms-search"><Search size={16}/><input placeholder={t.search} value={search} onChange={e=>setSearch(e.target.value)}/></label><button className="cms-primary" onClick={()=>start()} disabled={!initialized}><Plus size={17}/>{t.new}</button></div></div>
    {loading?<p>{t.loading}</p>:filtered.length===0?<p>{t.empty}</p>:<div className="cms-items">{filtered.map((e,i)=><div className="cms-item" key={e.id}><div className="cms-item-thumb">{e.image_url&&safeUrl(e.image_url,true)&&!e.image_url.match(/\.(mp4|webm)(\?|$)/i)?<img src={safeUrl(e.image_url,true)} alt=""/>:<span>{String(i+1).padStart(2,'0')}</span>}</div><div className="cms-item-info"><strong>{e.title[lang]||e.slug}</strong><small dir="ltr">{e.slug}</small><span className={e.published?'cms-published':'cms-draft'}>{e.published?t.yes:t.no}</span></div><div className="cms-item-buttons"><button title="Move up" disabled={busy||!initialized||i===0} onClick={()=>move(e,-1)}><ArrowUp size={16}/></button><button title="Move down" disabled={busy||!initialized||i===filtered.length-1} onClick={()=>move(e,1)}><ArrowDown size={16}/></button><button title={t.edit} disabled={!initialized} onClick={()=>start(e)}><Save size={16}/></button><button title={t.copy} disabled={!initialized} onClick={()=>start({...e,id:'',slug:e.slug+'-copy',published:false})}><Copy size={16}/></button><button title={t.delete} disabled={!initialized} onClick={()=>remove(e)}><Trash2 size={16}/></button></div></div>)}</div>}
   </section></div>
  {editing&&<div className="cms-modal-backdrop" role="presentation" onMouseDown={()=>setEditing(null)}><section className="cms-editor" role="dialog" aria-modal="true" aria-label={t.edit} onMouseDown={e=>e.stopPropagation()}>
   <header><div><span className="cms-kicker">{kindLabels[editing.item.kind][lang]}</span><h3>{editing.item.title[lang]||t.new}</h3></div><button className="cms-icon" onClick={()=>setEditing(null)} aria-label={t.cancel}><X size={22}/></button></header>
   <div className="cms-editor-body">
    <div className="cms-form-grid"><label>{t.slug}<input dir="ltr" required value={editing.item.slug} disabled={!!editing.item.id&&!editing.item.id.startsWith('default-')} onChange={e=>patch({slug:slugify(e.target.value)})}/></label>
    <label>{t.group}<input dir="ltr" value={editing.item.group_key} onChange={e=>patch({group_key:e.target.value})}/></label></div>
    {(['title','description','body'] as const).map(field=><fieldset key={field}><legend>{field==='title'?'Title':field==='description'?t.short:t.body}</legend><div className="cms-form-grid">
      {(['fa','en'] as const).map(locale=><label key={locale}>{locale==='fa'?t.fa:t.en}{field==='title'?<input dir={locale==='fa'?'rtl':'ltr'} value={editing.item[field][locale]} onChange={e=>patchLocalized(field,locale,e.target.value)}/>:<textarea rows={field==='body'?6:3} dir={locale==='fa'?'rtl':'ltr'} value={editing.item[field][locale]} onChange={e=>patchLocalized(field,locale,e.target.value)}/>}</label>)}
    </div></fieldset>)}
    <div className="cms-form-grid"><label>{t.image}<input dir="ltr" value={editing.item.image_url||''} onChange={e=>patch({image_url:e.target.value||null})}/></label><label>{t.url}<input dir="ltr" value={editing.item.link_url||''} onChange={e=>patch({link_url:e.target.value||null})}/></label></div>
    <label className="cms-media-upload"><ImagePlus size={16}/>{t.upload}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm" onChange={e=>{const file=e.target.files?.[0];if(file)void upload(file)}}/></label>
    {editing.item.image_url&&safeUrl(editing.item.image_url,true)&&<div className="cms-media-preview">{editing.item.image_url.match(/\.(mp4|webm)(\?|$)/i)?<video controls preload="metadata" src={safeUrl(editing.item.image_url,true)}/>:<img src={safeUrl(editing.item.image_url,true)} alt="Preview"/>}</div>}
    <div className="cms-form-grid"><label>{t.order}<input type="number" value={editing.item.sort_order} onChange={e=>patch({sort_order:Number(e.target.value)||0})}/></label><label className="cms-switch">{t.published}<input type="checkbox" checked={editing.item.published} onChange={e=>patch({published:e.target.checked})}/></label></div>
    <label>{t.meta}<textarea dir="ltr" rows={4} value={editing.metaText} onChange={e=>setEditing(v=>v?{...v,metaText:e.target.value}:v)}/></label>
    {message&&<p className="cms-status" role="alert">{message}</p>}
   </div><footer><button className="cms-secondary" onClick={()=>setEditing(null)}>{t.cancel}</button><button className="cms-primary" disabled={busy} onClick={save}><Save size={17}/>{t.save}</button></footer></section></div>}
 </div>
}
