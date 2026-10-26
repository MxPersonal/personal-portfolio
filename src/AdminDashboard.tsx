import React,{useCallback,useEffect,useMemo,useState} from 'react';
import axios from 'axios';
import {Activity,ArrowDown,ArrowLeft,ArrowRight,ArrowUp,ArrowUpRight,Check,CheckCircle2,ChevronDown,Copy,ExternalLink,FolderKanban,Image as ImageIcon,Layers3,LayoutDashboard,LoaderCircle,Menu,MessageSquare,Plus,RefreshCw,Save,Search,Settings2,ShieldCheck,SlidersHorizontal,Trash2,X} from 'lucide-react';
import {getAuthToken,supabase,type Project,type ProjectStatus} from './db';
import {blankEntry,CMS_KINDS,kindLabels,slugify,safeUrl,type CmsEntry,type CmsKind} from './cms';
import type {Lang,Localized} from './content';
import './admin-v3.css';

type Inquiry={id:string;reference:string;full_name:string;email:string;service:string;message:string;budget:string;locale:string;status:string;created_at:string};
type StoredSetting={key:string;value:unknown};
type Dashboard={projects:Project[];entries:CmsEntry[];settings:StoredSetting[];inquiries:Inquiry[]};
type Preset={id:string;fa:string;en:string};
type Tab='overview'|'projects'|'settings'|'inquiries'|CmsKind;
type Editor={type:'project';value:Project}|{type:'entry';value:CmsEntry};
const empty:L= {fa:'',en:''};
type L=Localized;
const DEFAULT_PRESETS:Preset[]=[
 {id:'available',fa:'آماده همکاری حرفه‌ای',en:'Open to Collaboration'},
 {id:'busy',fa:'مشغول پروژه',en:'Currently Busy'},
 {id:'limited',fa:'پذیرش محدود پروژه',en:'Limited Availability'},
 {id:'unavailable',fa:'فعلاً در دسترس نیستم',en:'Not Available'}
];
const texts={
 fa:{dashboard:'استودیوی مدیریت',subtitle:'فرماندهی کامل محتوای سایت Mr.HoSSein',overview:'داشبورد',projects:'پروژه‌ها',settings:'وضعیت همکاری',inquiries:'درخواست‌ها',content:'مدیریت محتوا',workspace:'مدیریت سایت',all:'همه',draft:'پیش‌نویس',published:'منتشرشده',new:'افزودن مورد جدید',addProject:'پروژه جدید',save:'ذخیره تغییرات',saving:'در حال ذخیره...',cancel:'انصراف',close:'بستن',remove:'حذف',confirm:'آیا از حذف این مورد مطمئنی؟ این عمل قابل برگشت نیست.',search:'جست‌وجو در محتوا...',refresh:'بارگذاری دوباره',name:'عنوان',summary:'توضیح کوتاه',body:'محتوای کامل',role:'نقش شما',slug:'شناسه انگلیسی / Slug',group:'گروه',image:'تصویر / رسانه',link:'آدرس لینک',sort:'ترتیب',status:'وضعیت پروژه',category:'دسته‌بندی',stack:'فناوری‌ها (با ویرگول جدا کن)',repo:'مخزن GitHub',demo:'دموی زنده',media:'نشانی ویدئو',featured:'پروژه ویژه',visible:'انتشار عمومی',updated:'تغییرات با موفقیت ذخیره شد.',failed:'خطا در ارتباط با دیتابیس',empty:'در این بخش موردی وجود ندارد.',edit:'ویرایش',preview:'مشاهده سایت',loading:'در حال دریافت اطلاعات...',localize:'متن فارسی و انگلیسی یک رکورد',advanced:'گزینه‌های پیشرفته JSON',noDeleteSection:'برای حذف بخش اصلی از سایت، وضعیت انتشار را خاموش کن.',presetHeading:'وضعیت‌های همکاری',presetHelp:'هر وضعیت یک گزینه مستقل با متن فارسی و انگلیسی دارد. برای تغییر، روی مورد دلخواه بزن و در سمت دیگر ویرایش کن.',newPreset:'افزودن وضعیت',activate:'انتخاب به‌عنوان وضعیت فعال',active:'وضعیت فعال سایت',selectPreset:'یک وضعیت را از فهرست انتخاب کن',presetSave:'ذخیره فهرست وضعیت‌ها',presetName:'نام این وضعیت',noProjects:'هنوز هیچ پروژه‌ای در CMS پیدا نشد.',authError:'دسترسی مدیر یا ارتباط با Neon تأیید نشد.',retry:'تلاش مجدد',language:'زبان پنل',welcome:'به مرکز کنترل سایت خوش آمدی',count:'مورد',projectTech:'فناوری',deleteRecord:'حذف مورد',reorder:'تغییر ترتیب',addFirst:'اولین مورد را ایجاد کن',quick:'دسترسی سریع',viewAll:'مشاهده همه',serviceDetails:'جزئیات خدمت',settingSaved:'تنظیم وضعیت‌ها ذخیره شد.',unsaved:'تغییرات ذخیره‌نشده',newProject:'پروژه جدید',mediaHelp:'برای تصویر می‌توانی لینک HTTPS وارد کنی. آپلود مستقیم نیازمند Vercel Blob است.',inquiry:'درخواست همکاری',inquiryNew:'جدید',inquiryReview:'در حال بررسی',inquiryReplied:'پاسخ داده شده',inquiryClosed:'بسته شده',noMedia:'بدون تصویر',approval:'امنیت و مجوز',cmsCount:'آیتم‌های محتوا',allProjects:'پروژه‌های ثبت‌شده',actions:'عملیات',copy:'کپی',url:'آدرس'},
 en:{dashboard:'CMS Studio',subtitle:'Full content control for Mr.HoSSein',overview:'Overview',projects:'Projects',settings:'Availability statuses',inquiries:'Inquiries',content:'Content management',workspace:'Workspace',all:'All',draft:'Draft',published:'Published',new:'Add new item',addProject:'New project',save:'Save changes',saving:'Saving...',cancel:'Cancel',close:'Close',remove:'Delete',confirm:'Permanently delete this record? This cannot be undone.',search:'Search records...',refresh:'Refresh',name:'Title',summary:'Short description',body:'Full content',role:'Your role',slug:'English slug',group:'Group',image:'Image / media',link:'Link URL',sort:'Display order',status:'Project status',category:'Category',stack:'Tech stack (comma separated)',repo:'GitHub repository',demo:'Live demo',media:'Video URL',featured:'Featured project',visible:'Published publicly',updated:'Changes saved successfully.',failed:'Database connection failed',empty:'No items in this collection.',edit:'Edit',preview:'View website',loading:'Loading content...',localize:'Persian and English for the same record',advanced:'Advanced JSON settings',noDeleteSection:'Hide a built-in section by disabling publication.',presetHeading:'Collaboration statuses',presetHelp:'Each status is one bilingual item. Choose a status from the list to edit both languages in one place.',newPreset:'Add status',activate:'Make this status active',active:'Active site status',selectPreset:'Select an item from the list',presetSave:'Save statuses',presetName:'Status label',noProjects:'No projects found in the CMS.',authError:'Admin permissions or Neon connection could not be verified.',retry:'Retry',language:'Panel language',welcome:'Welcome to your website control center',count:'items',projectTech:'Technology',deleteRecord:'Delete record',reorder:'Reorder',addFirst:'Create your first item',quick:'Quick access',viewAll:'View all',serviceDetails:'Service details',settingSaved:'Availability statuses saved.',unsaved:'Unsaved changes',newProject:'New project',mediaHelp:'Paste an HTTPS image URL. Direct uploads require Vercel Blob.',inquiry:'Project inquiry',inquiryNew:'New',inquiryReview:'Reviewing',inquiryReplied:'Replied',inquiryClosed:'Closed',noMedia:'No image',approval:'Security & permissions',cmsCount:'Content items',allProjects:'Registered projects',actions:'Actions',copy:'Duplicate',url:'URL'}
};
const projectStatuses:Record<ProjectStatus,L>={real:{fa:'تکمیل‌شده',en:'Completed'},progress:{fa:'در حال توسعه',en:'In progress'},concept:{fa:'مفهومی',en:'Concept'},research:{fa:'تحقیق و آزمایش',en:'Research'}};
const presetFromValue=(value:unknown):Preset[]=>{
 if(!Array.isArray(value))return [];
 return value.filter(x=>x&&typeof x==='object'&&typeof x.id==='string'&&typeof x.fa==='string'&&typeof x.en==='string').map(x=>({id:x.id,fa:x.fa,en:x.en}));
};
const cleanLocal=(value:unknown):L=>value&&typeof value==='object'&&typeof (value as L).fa==='string'&&typeof (value as L).en==='string'?value as L:empty;
const cloneEntry=(e:CmsEntry):CmsEntry=>({...e,title:{...e.title},description:{...e.description},body:{...e.body},meta:{...e.meta}});
const freshProject=():Project=>({id:'',slug:'',title:{...empty},summary:{...empty},body:{...empty},role:{...empty},status:'progress',category:'web',stack:[],cover_url:null,video_url:null,demo_url:null,repo_url:null,featured:false,published:false,sort_order:100});
const isEnglishSlug=(slug:string)=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
function PanelIcon({tab}:{tab:Tab}){
 const props={size:19,strokeWidth:1.8};
 if(tab==='overview')return <LayoutDashboard {...props}/>;
 if(tab==='projects')return <FolderKanban {...props}/>;
 if(tab==='settings')return <SlidersHorizontal {...props}/>;
 if(tab==='inquiries')return <MessageSquare {...props}/>;
 if(tab==='gallery')return <ImageIcon {...props}/>;
 if(tab==='section'||tab==='page')return <Layers3 {...props}/>;
 return <Settings2 {...props}/>;
}
export default function AdminDashboard({lang,onRefresh}:{lang:Lang;onRefresh:()=>void}){
 const t=texts[lang];
 const [tab,setTab]=useState<Tab>('overview'),[mobileMenu,setMobileMenu]=useState(false);
 const [data,setData]=useState<Dashboard>({projects:[],entries:[],settings:[],inquiries:[]});
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [search,setSearch]=useState(''),[filter,setFilter]=useState<'all'|'published'|'draft'>('all');
 const [editor,setEditor]=useState<Editor|null>(null),[metaString,setMetaString]=useState('{}');
 const [presets,setPresets]=useState<Preset[]>(DEFAULT_PRESETS),[presetId,setPresetId]=useState('available'),[activePreset,setActivePreset]=useState('available');
 const [presetsDirty,setPresetsDirty]=useState(false);

 const request=useCallback(async(method:'GET'|'POST'|'PATCH'|'DELETE',endpoint:string,body?:unknown)=>{
  const token=await getAuthToken();
  if(!token)throw Error(lang==='fa'?'توکن ورود موجود نیست. دوباره وارد شو.':'No access token; please sign in again.');
  try{
   const result=await axios({method,url:endpoint,data:body,headers:{Authorization:'Bearer '+token},timeout:22000});
   return result.data;
  }catch(e){
   if(axios.isAxiosError(e))throw Error(typeof e.response?.data?.error==='string'?e.response.data.error:e.message);
   throw e;
  }
 },[lang]);
 const reload=useCallback(async()=>{
  setLoading(true);setError('');
  try{
   const result=await request('GET','/api/dashboard') as Dashboard;
   setData({projects:result.projects||[],entries:result.entries||[],settings:result.settings||[],inquiries:result.inquiries||[]});
   const current=cleanLocal(result.settings?.find(x=>x.key==='availability')?.value);
   const stored=presetFromValue(result.settings?.find(x=>x.key==='availability_presets')?.value);
   const base=stored.length?stored:[{id:'available',fa:current.fa||DEFAULT_PRESETS[0].fa,en:current.en||DEFAULT_PRESETS[0].en},...DEFAULT_PRESETS.slice(1)];
   const storedActive=result.settings?.find(x=>x.key==='active_availability_preset')?.value;
   const active=typeof storedActive==='string'&&base.some(x=>x.id===storedActive)?storedActive:base.find(x=>x.fa===current.fa&&x.en===current.en)?.id||base[0].id;
   setPresets(base);setActivePreset(active);setPresetId(x=>base.some(p=>p.id===x)?x:active);setPresetsDirty(false);
  }catch(e){setError(e instanceof Error?e.message:t.failed)}finally{setLoading(false)}
 },[request,t.failed]);
 useEffect(()=>{void reload()},[reload]);
 const currentKind=CMS_KINDS.includes(tab as CmsKind)?tab as CmsKind:null;
 const entries=useMemo(()=>data.entries.filter(e=>e.kind===currentKind),[data.entries,currentKind]);
 const records=useMemo(()=>{
  const src=currentKind?entries:data.projects;
  return src.filter(e=>{
   const text=('slug' in e?e.slug:'')+' '+e.title.fa+' '+e.title.en;
   return text.toLowerCase().includes(search.toLowerCase())&&(filter==='all'||e.published===(filter==='published'));
  }).sort((a,b)=>a.sort_order-b.sort_order||a.slug.localeCompare(b.slug));
 },[currentKind,entries,data.projects,search,filter]);
 const selectedPreset=presets.find(p=>p.id===presetId)??presets[0];
 const choose=(next:Tab)=>{setTab(next);setMobileMenu(false);setSearch('');setFilter('all');setNotice('');setError('')};
 const open=(item:Editor)=>{
  setEditor(item.type==='entry'?{type:'entry',value:cloneEntry(item.value)}:{type:'project',value:JSON.parse(JSON.stringify(item.value)) as Project});
  setMetaString(item.type==='entry'?JSON.stringify(item.value.meta,null,2):'{}');setError('');setNotice('');
 };
 const setField=(field:string,value:unknown)=>{
  setEditor(prev=>prev?({...prev,value:{...prev.value,[field]:value}} as Editor):prev);
 };
 const setLocalized=(field:string,key:'fa'|'en',value:string)=>{
  setEditor(prev=>{
   if(!prev)return prev;
   const current=(prev.value as unknown as Record<string,L>)[field]||{...empty};
   return {...prev,value:{...prev.value,[field]:{...current,[key]:value}}} as Editor;
  });
 };
 const save=async()=>{
  if(!editor)return;
  const draft=editor.value;
  if(!isEnglishSlug(draft.slug)){setError(lang==='fa'?'شناسه باید با حروف کوچک انگلیسی، عدد و خط فاصله باشد.':'Use a lowercase English slug.');return}
  if(!draft.title.fa.trim()||!draft.title.en.trim()){setError(lang==='fa'?'عنوان فارسی و انگلیسی الزامی است.':'Both titles are required.');return}
  setBusy(true);setError('');setNotice('');
  try{
   const {id,...rest}=draft;
   const clean={...rest} as Record<string,unknown>;
   delete clean.created_at;delete clean.updated_at;
   if(editor.type==='entry'){
    let meta:Record<string,unknown>;
    try{const parsed=JSON.parse(metaString);if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error();meta=parsed}catch{throw Error(lang==='fa'?'فرمت JSON در تنظیمات پیشرفته نامعتبر است.':'Invalid advanced JSON settings.')}
    const value={...clean,meta};
    if(id&&!id.startsWith('default-'))await request('PATCH','/api/cms',{table:'portfolio_cms_entries',data:value,filters:[{field:'id',value:id}]});
    else await request('POST','/api/cms',{table:'portfolio_cms_entries',data:value,upsert:true});
   }else{
    if(id)await request('PATCH','/api/cms',{table:'portfolio_projects',data:clean,filters:[{field:'id',value:id}]});
    else await request('POST','/api/cms',{table:'portfolio_projects',data:clean});
   }
   setEditor(null);setNotice(t.updated);await reload();onRefresh();
  }catch(e){setError(e instanceof Error?e.message:t.failed)}finally{setBusy(false)}
 };
 const remove=async(item:Project|CmsEntry)=>{
  if(currentKind==='section'){setError(t.noDeleteSection);return}
  if(!window.confirm(t.confirm))return;
  setBusy(true);setError('');
  try{
   const table=currentKind?'portfolio_cms_entries':'portfolio_projects';
   await request('DELETE','/api/cms',{table,filters:[{field:'id',value:item.id}]});
   setNotice(t.updated);await reload();onRefresh();
  }catch(e){setError(e instanceof Error?e.message:t.failed)}finally{setBusy(false)}
 };
 const changeOrder=async(index:number,direction:-1|1)=>{
  const target=records[index],adjacent=records[index+direction];if(!target||!adjacent)return;
  setBusy(true);setError('');
  try{
   const table=currentKind?'portfolio_cms_entries':'portfolio_projects';
   const top=Math.min(target.sort_order,adjacent.sort_order);
   const bottom=Math.max(target.sort_order,adjacent.sort_order);
   const a=target.sort_order===adjacent.sort_order?top:adjacent.sort_order;
   const b=target.sort_order===adjacent.sort_order?bottom+1:target.sort_order;
   await request('PATCH','/api/cms',{table,data:{sort_order:a},filters:[{field:'id',value:target.id}]});
   await request('PATCH','/api/cms',{table,data:{sort_order:b},filters:[{field:'id',value:adjacent.id}]});
   await reload();onRefresh();
  }catch(e){setError(e instanceof Error?e.message:t.failed)}finally{setBusy(false)}
 };
 const changeInquiry=async(item:Inquiry,status:string)=>{
  setBusy(true);setError('');
  try{await request('PATCH','/api/cms',{table:'portfolio_inquiries',data:{status},filters:[{field:'id',value:item.id}]});await reload()}catch(e){setError(e instanceof Error?e.message:t.failed)}finally{setBusy(false)}
 };
 const editPreset=(field:'fa'|'en',value:string)=>{
  setPresets(prev=>prev.map(x=>x.id===presetId?{...x,[field]:value}:x));setPresetsDirty(true)
 };
 const addPreset=()=>{
  let index=presets.length+1,slug='custom-'+index;while(presets.some(x=>x.id===slug)){index++;slug='custom-'+index}
  setPresets(prev=>[...prev,{id:slug,fa:'',en:''}]);setPresetId(slug);setPresetsDirty(true)
 };
 const savePresets=async()=>{
  if(!presets.length||presets.some(x=>!x.fa.trim()||!x.en.trim())){setError(lang==='fa'?'تمام وضعیت‌ها باید متن فارسی و انگلیسی داشته باشند.':'All statuses need Persian and English labels.');return}
  if(new Set(presets.map(x=>x.id)).size!==presets.length){setError('Duplicate status ID');return}
  const current=presets.find(x=>x.id===activePreset)||presets[0];
  setBusy(true);setError('');
  try{
   await request('POST','/api/cms',{table:'portfolio_settings',upsert:true,data:[
    {key:'availability_presets',value:presets},
    {key:'active_availability_preset',value:current.id},
    {key:'availability',value:{fa:current.fa,en:current.en}}
   ]});
   setNotice(t.settingSaved);await reload();onRefresh();
  }catch(e){setError(e instanceof Error?e.message:t.failed)}finally{setBusy(false)}
 };
 const sideTabs:{id:Tab;name:string;count?:number}[]=[
  {id:'overview',name:t.overview},
  {id:'projects',name:t.projects,count:data.projects.length},
  {id:'settings',name:t.settings},
  {id:'inquiries',name:t.inquiries,count:data.inquiries.length},
  ...CMS_KINDS.map(id=>({id,name:kindLabels[id][lang],count:data.entries.filter(x=>x.kind===id).length}))
 ];
 const itemRow=(item:Project|CmsEntry,index:number)=>{
  const src='cover_url' in item?item.cover_url:item.image_url;
  const status='status' in item?projectStatuses[item.status]?.[lang]||item.status:item.kind;
  return <div className="v3-record" key={item.id}>
   <div className="v3-thumb">{src&&safeUrl(src,true)?<img alt="" loading="lazy" src={safeUrl(src,true)}/>:<span>{String(index+1).padStart(2,'0')}</span>}</div>
   <div className="v3-record-text"><strong>{item.title[lang]||item.title.en||item.slug}</strong><small dir="ltr">{item.slug}</small><div className="v3-subline"><span className={'v3-dot '+(item.published?'good':'muted')}/>{item.published?t.published:t.draft} <span>· {status}</span></div></div>
   <div className="v3-record-actions">
    <button aria-label="Up" disabled={busy||index===0} onClick={()=>changeOrder(index,-1)}><ArrowUp size={16}/></button>
    <button aria-label="Down" disabled={busy||index===records.length-1} onClick={()=>changeOrder(index,1)}><ArrowDown size={16}/></button>
    <button aria-label={t.edit} onClick={()=>open(currentKind?{type:'entry',value:item as CmsEntry}:{type:'project',value:item as Project})}><Settings2 size={17}/></button>
    <button aria-label={t.copy} onClick={()=>{const value={...item,id:'',slug:item.slug+'-copy',published:false};open(currentKind?{type:'entry',value:value as CmsEntry}:{type:'project',value:value as Project})}}><Copy size={17}/></button>
    {currentKind!=='section'&&<button aria-label={t.remove} className="danger" onClick={()=>remove(item)}><Trash2 size={17}/></button>}
   </div>
  </div>
 };
 const editableField=(field:'title'|'description'|'summary'|'body'|'role',multi:boolean)=>{
  if(!editor)return null;
  const value=(editor.value as unknown as Record<string,L>)[field];if(!value)return null;
  return <div className="v3-localized-field" key={field}>
   <strong>{field==='title'?t.name:field==='summary'||field==='description'?t.summary:field==='body'?t.body:t.role}</strong>
   <div className="v3-bilingual">
    <label><span>FA <small>فارسی</small></span>{multi?<textarea dir="rtl" rows={field==='body'?5:3} value={value.fa} onChange={e=>setLocalized(field,'fa',e.target.value)}/>:<input dir="rtl" value={value.fa} onChange={e=>setLocalized(field,'fa',e.target.value)}/>}</label>
    <label><span>EN <small>English</small></span>{multi?<textarea dir="ltr" rows={field==='body'?5:3} value={value.en} onChange={e=>setLocalized(field,'en',e.target.value)}/>:<input dir="ltr" value={value.en} onChange={e=>setLocalized(field,'en',e.target.value)}/>}</label>
   </div>
  </div>
 };
 return <div className="v3-shell" dir={lang==='fa'?'rtl':'ltr'}>
  <div className="v3-mobilebar"><button aria-label="Open menu" onClick={()=>setMobileMenu(true)}><Menu size={24}/></button><strong>MR.HOSSEIN / CMS</strong><button onClick={reload} aria-label={t.refresh}><RefreshCw size={20}/></button></div>
  {mobileMenu&&<div className="v3-mobileveil" onClick={()=>setMobileMenu(false)}/>}
  <aside className={'v3-sidebar '+(mobileMenu?'open':'')}>
   <div className="v3-brand"><span className="v3-brand-icon"><Layers3 size={24}/></span><div><strong>Mr.HoSSein</strong><small>PORTFOLIO STUDIO / V3</small></div><button className="v3-menuclose" onClick={()=>setMobileMenu(false)}><X size={18}/></button></div>
   <div className="v3-sideheading">{t.workspace}</div>
   <nav aria-label="CMS Navigation">{sideTabs.map((it,i)=><React.Fragment key={it.id}>{i===4&&<div className="v3-sideheading">{t.content}</div>}<button className={tab===it.id?'current':''} onClick={()=>choose(it.id)}><PanelIcon tab={it.id}/><span>{it.name}</span>{typeof it.count==='number'&&<small>{it.count}</small>}</button></React.Fragment>)}</nav>
   <div className="v3-sidebottom"><div><ShieldCheck size={17}/>{lang==='fa'?'ورود امن با Neon Auth':'Secured by Neon Auth'}</div><a href="/"><ExternalLink size={16}/>{t.preview}</a><button onClick={()=>supabase?.auth.signOut()}>{lang==='fa'?'خروج از حساب':'Sign out'} <ArrowUpRight size={16}/></button></div>
  </aside>
  <main className="v3-main">
   <header className="v3-header"><div className="v3-heading-crumb">WORKSPACE <span>/</span> {tab.toUpperCase()}</div><div className="v3-header-actions"><button title={t.refresh} onClick={reload}><RefreshCw size={17}/></button><a href="/" ><ExternalLink size={16}/>{t.preview}</a></div></header>
   <section className="v3-work">
    <div className="v3-titlebar"><div><span className="v3-eyebrow"><Activity size={15}/> CMS MANAGEMENT CONSOLE</span><h1>{tab==='overview'?t.dashboard:tab==='projects'?t.projects:tab==='settings'?t.settings:tab==='inquiries'?t.inquiries:kindLabels[tab as CmsKind][lang]}</h1><p>{tab==='overview'?t.welcome:tab==='settings'?t.presetHelp:t.subtitle}</p></div>{(tab==='projects'||currentKind&&currentKind!=='section')&&<button className="v3-primary" onClick={()=>open(tab==='projects'?{type:'project',value:freshProject()}:{type:'entry',value:blankEntry(currentKind!)})}><Plus size={19}/>{tab==='projects'?t.addProject:t.new}</button>}</div>
    {error&&<div className="v3-alert error" role="alert"><span>{error}</span><button onClick={()=>setError('')} aria-label="Dismiss"><X size={15}/></button></div>}
    {notice&&<div className="v3-alert ok" role="status"><CheckCircle2 size={17}/><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Dismiss"><X size={15}/></button></div>}
    {loading?<div className="v3-spinner"><LoaderCircle className="v3-spin" size={28}/>{t.loading}</div>:tab==='overview'?<>
     <div className="v3-stat-grid">{[
      {label:t.allProjects,value:data.projects.length,icon:'projects' as Tab,color:'blue'},
      {label:t.cmsCount,value:data.entries.length,icon:'section' as Tab,color:'purple'},
      {label:t.published,value:data.entries.filter(x=>x.published).length,icon:'page' as Tab,color:'mint'},
      {label:t.inquiries,value:data.inquiries.length,icon:'inquiries' as Tab,color:'amber'}
     ].map(stat=><div className={'v3-stat '+stat.color} key={stat.label}><div className="v3-stat-icon"><PanelIcon tab={stat.icon}/></div><span>{stat.label}</span><strong>{stat.value.toLocaleString(lang==='fa'?'fa-IR':'en-US')}</strong></div>)}</div>
     <div className="v3-overview-grid"><article className="v3-panel"><div className="v3-panel-heading"><h2>{t.projects}</h2><button onClick={()=>choose('projects')}>{t.viewAll} <ArrowUpRight size={15}/></button></div><div className="v3-quicklist">{data.projects.slice(0,5).map(p=><button key={p.id} onClick={()=>{choose('projects');open({type:'project',value:p})}}><FolderKanban size={18}/><span>{p.title[lang]}</span><small>{p.published?t.published:t.draft}</small></button>)}{!data.projects.length&&<p>{t.noProjects}</p>}</div></article>
      <article className="v3-panel"><div className="v3-panel-heading"><h2>{t.quick}</h2></div><div className="v3-quicklist">{(['section','copy','service','skill','social','gallery','page','settings'] as Tab[]).map(x=><button key={x} onClick={()=>choose(x)}><PanelIcon tab={x}/><span>{x==='settings'?t.settings:kindLabels[x as CmsKind][lang]}</span><ArrowUpRight size={17}/></button>)}</div></article>
     </div>
    </>:tab==='settings'?<>
     <div className="v3-settings-layout"><section className="v3-panel v3-preset-list"><div className="v3-panel-heading"><h2>{t.presetHeading}</h2><button onClick={addPreset}><Plus size={16}/>{t.newPreset}</button></div>
      <p className="v3-muted">{t.presetHelp}</p>
      {presets.map(p=><button key={p.id} className={'v3-preset-row '+(presetId===p.id?'selected':'')} onClick={()=>setPresetId(p.id)}><span className="v3-preset-dot">{p.id===activePreset?<Check size={15}/>:<Activity size={14}/>}</span><span><strong>{p[lang]||t.presetName}</strong><small dir="ltr">{p.id} {p.id===activePreset?' • ACTIVE':''}</small></span><ChevronDown size={16}/></button>)}
     </section>
     <section className="v3-panel v3-status-editor">{selectedPreset&&<><div className="v3-panel-heading"><h2>{t.selectPreset}</h2>{selectedPreset.id===activePreset&&<span className="v3-active-tag"><Check size={14}/>{t.active}</span>}</div><div className="v3-localized-field"><strong>{t.localize}</strong><div className="v3-bilingual"><label><span>FA <small>فارسی</small></span><textarea rows={3} dir="rtl" value={selectedPreset.fa} onChange={e=>editPreset('fa',e.target.value)}/></label><label><span>EN <small>English</small></span><textarea rows={3} dir="ltr" value={selectedPreset.en} onChange={e=>editPreset('en',e.target.value)}/></label></div></div>
      <div className="v3-status-actions"><button className="v3-secondary" disabled={selectedPreset.id===activePreset} onClick={()=>{setActivePreset(selectedPreset.id);setPresetsDirty(true)}}><Check size={17}/>{t.activate}</button><button className="v3-danger" disabled={presets.length<2} onClick={()=>{if(!confirm(t.confirm))return;setPresets(prev=>prev.filter(x=>x.id!==selectedPreset.id));if(activePreset===selectedPreset.id)setActivePreset(presets.find(x=>x.id!==selectedPreset.id)?.id||'');setPresetId(presets.find(x=>x.id!==selectedPreset.id)?.id||'');setPresetsDirty(true)}}><Trash2 size={16}/>{t.remove}</button></div>
     </>}</section></div>
     <div className="v3-sticky-save"><span>{presetsDirty?t.unsaved:t.active+': '+(presets.find(x=>x.id===activePreset)?.[lang]||'')}</span><button className="v3-primary" disabled={busy} onClick={savePresets}><Save size={18}/>{t.presetSave}</button></div>
    </>:tab==='inquiries'?<section className="v3-panel">{data.inquiries.length?data.inquiries.map(q=><div className="v3-inquiry" key={q.id}><div><strong>{q.full_name}</strong><small>{q.reference} • {new Date(q.created_at).toLocaleDateString(lang==='fa'?'fa-IR':'en-US')}</small><a href={'mailto:'+encodeURIComponent(q.email)} dir="ltr">{q.email}</a></div><p>{q.message}</p><select value={q.status} disabled={busy} onChange={e=>changeInquiry(q,e.target.value)}>{['new','reviewing','replied','closed'].map(x=><option key={x} value={x}>{x==='new'?t.inquiryNew:x==='reviewing'?t.inquiryReview:x==='replied'?t.inquiryReplied:t.inquiryClosed}</option>)}</select></div>):<div className="v3-empty">{t.empty}</div>}</section>
    :<section className="v3-panel v3-collection"><div className="v3-toolbar"><div className="v3-search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search}/></div><div className="v3-filters">{(['all','published','draft'] as const).map(s=><button className={filter===s?'active':''} onClick={()=>setFilter(s)} key={s}>{t[s]}</button>)}</div></div>
     <div className="v3-listcount">{records.length} {t.count}</div>
     {records.length?records.map((item,i)=>itemRow(item,i)):<div className="v3-empty"><FolderKanban size={28}/><p>{tab==='projects'?t.noProjects:t.empty}</p><button onClick={()=>open(currentKind?{type:'entry',value:blankEntry(currentKind)}:{type:'project',value:freshProject()})}><Plus size={16}/>{t.addFirst}</button></div>}
    </section>}
   </section>
  </main>
  {editor&&<div className="v3-modal-backdrop" onMouseDown={()=>setEditor(null)} role="presentation"><section className="v3-modal" onMouseDown={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-label={t.edit}>
   <header><div><small>MR.HOSSEIN / EDITOR</small><h2>{editor.value.id?t.edit:t.new} • {editor.value.title[lang]||editor.value.slug||t.new}</h2></div><button onClick={()=>setEditor(null)} aria-label={t.close}><X size={21}/></button></header>
   <div className="v3-modal-content">
    <div className="v3-editor-intro"><strong>{t.localize}</strong><p>{lang==='fa'?'هر آیتم یک رکورد واحد است و اطلاعات هر دو زبان همراه هم ذخیره می‌شوند.':'Both languages belong to a single record and are saved together.'}</p></div>
    <div className="v3-field-grid"><label>{t.slug}<input dir="ltr" value={editor.value.slug} disabled={Boolean(editor.value.id&&!editor.value.id.startsWith('default-'))} onChange={e=>setField('slug',slugify(e.target.value))}/></label><label>{t.sort}<input type="number" value={editor.value.sort_order} onChange={e=>setField('sort_order',Number(e.target.value)||0)}/></label></div>
    {editableField('title',false)}
    {editableField(editor.type==='project'?'summary':'description',true)}
    {editableField('body',true)}
    {editor.type==='project'?<>
      {editableField('role',true)}
      <div className="v3-field-grid"><label>{t.status}<select value={editor.value.status} onChange={e=>setField('status',e.target.value)}>{Object.entries(projectStatuses).map(([value,title])=><option key={value} value={value}>{title[lang]}</option>)}</select></label><label>{t.category}<input value={editor.value.category} onChange={e=>setField('category',e.target.value)}/></label></div>
      <label>{t.stack}<input dir="ltr" value={editor.value.stack.join(', ')} onChange={e=>setField('stack',e.target.value.split(',').map(x=>x.trim()).filter(Boolean))}/></label>
      <div className="v3-field-grid"><label>{t.repo}<input dir="ltr" value={editor.value.repo_url||''} onChange={e=>setField('repo_url',e.target.value||null)}/></label><label>{t.demo}<input dir="ltr" value={editor.value.demo_url||''} onChange={e=>setField('demo_url',e.target.value||null)}/></label></div>
      <div className="v3-field-grid"><label>{t.image}<input dir="ltr" value={editor.value.cover_url||''} onChange={e=>setField('cover_url',e.target.value||null)}/></label><label>{t.media}<input dir="ltr" value={editor.value.video_url||''} onChange={e=>setField('video_url',e.target.value||null)}/></label></div>
      <p className="v3-muted">{t.mediaHelp}</p>
      <label className="v3-check"><input type="checkbox" checked={editor.value.featured} onChange={e=>setField('featured',e.target.checked)}/>{t.featured}</label>
    </>:<>
      <div className="v3-field-grid"><label>{t.group}<input dir="ltr" value={editor.value.group_key} onChange={e=>setField('group_key',e.target.value)}/></label><label>{t.url}<input dir="ltr" value={editor.value.link_url||''} onChange={e=>setField('link_url',e.target.value||null)}/></label></div>
      <label>{t.image}<input dir="ltr" value={editor.value.image_url||''} onChange={e=>setField('image_url',e.target.value||null)}/></label>
      <p className="v3-muted">{t.mediaHelp}</p>
      <details className="v3-json"><summary>{t.advanced}</summary><textarea rows={5} dir="ltr" value={metaString} onChange={e=>setMetaString(e.target.value)}/></details>
    </>}
    <label className="v3-check"><input type="checkbox" checked={editor.value.published} onChange={e=>setField('published',e.target.checked)}/>{t.visible}</label>
    {error&&<div className="v3-alert error" role="alert">{error}</div>}
   </div>
   <footer><button className="v3-secondary" onClick={()=>setEditor(null)}>{t.cancel}</button><button className="v3-primary" disabled={busy} onClick={save}>{busy?<LoaderCircle className="v3-spin" size={16}/>:<Save size={17}/>} {busy?t.saving:t.save}</button></footer>
  </section></div>}
 </div>
}
