import {serviceGroups,skills,journey,socials,type Localized} from './content';
import {supabase,cmsConfigured} from './db';

export type CmsKind='section'|'copy'|'service_group'|'service'|'skill'|'social'|'gallery'|'journey'|'page';
export const CMS_KINDS:CmsKind[]=['section','copy','service_group','service','skill','social','gallery','journey','page'];
export const kindLabels:Record<CmsKind,Localized>={
 section:{fa:'بخش‌ها و چیدمان',en:'Page sections'},copy:{fa:'متن‌های سایت',en:'Site copy'},
 service_group:{fa:'گروه‌های خدمات',en:'Service families'},service:{fa:'خدمات و حرفه‌ها',en:'Services'},
 skill:{fa:'مهارت‌ها',en:'Skills'},social:{fa:'شبکه‌های اجتماعی',en:'Social links'},
 gallery:{fa:'گالری و رسانه',en:'Gallery'},journey:{fa:'مسیر حرفه‌ای',en:'Timeline'},
 page:{fa:'صفحات مستقل',en:'Custom pages'}
};
export type CmsEntry={
 id:string;kind:CmsKind;slug:string;title:Localized;description:Localized;body:Localized;
 group_key:string;image_url:string|null;link_url:string|null;published:boolean;
 sort_order:number;meta:Record<string,unknown>;updated_at?:string;
};
export type CmsSnapshot={entries:CmsEntry[];initialized:boolean;error:string|null};
const l=(fa:string,en:string):Localized=>({fa,en});
const empty=l('','');
export const slugify=(text:string)=>text.toLowerCase().trim().replace(/\+\+/g,'-plus-plus').replace(/#/g,'-sharp').replace(/&/g,'-and').replace(/[^a-z0-9-]/g,'-').replace(/^-+|-+$/g,'').slice(0,90);
export const safeUrl=(value:string|null|undefined,allowPath=false)=>{
 if(!value)return '';
 if(allowPath&&value.startsWith('/')&&!value.startsWith('//'))return value;
 try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}
};
export const createEntry=(kind:CmsKind,slug:string,title:Localized,description:Localized=empty,opts:Partial<Omit<CmsEntry,'id'|'kind'|'slug'|'title'|'description'|'body'>> & {body?:Localized}={}):CmsEntry=>({
 id:'default-'+kind+'-'+slug,kind,slug,title,description,body:opts.body??empty,
 group_key:opts.group_key??'',image_url:opts.image_url??null,link_url:opts.link_url??null,
 published:opts.published??true,sort_order:opts.sort_order??0,meta:opts.meta??{}
});
export const defaultCMS:CMSRecord=(()=> {
 const items:CmsEntry[]=[];
 const add=(kind:CmsKind,slug:string,title:Localized,description:Localized=empty,opts:Parameters<typeof createEntry>[4]={})=>
  items.push(createEntry(kind,slug,title,description,opts));
 for(const [idx,[id,fa,en]] of ([
  ['home','صفحه اصلی','Home'],['work','گالری','Gallery'],['about','درباره من','About'],
  ['services','خدمات','Services'],['projects','پروژه‌ها','Projects'],['contact','ارتباط','Contact']
 ] as const).entries())add('section',id,l(fa,en),empty,{sort_order:(idx+1)*10});
 add('copy','hero',l('Mr.HoSSein','Mr.HoSSein'),l('از یک ایده تا یک دنیای دیجیتال هوشمند؛ جایی که کدنویسی، خلاقیت و هوش مصنوعی به هم می‌رسند.','Turning ambitious ideas into powerful digital products with code, AI, and automation.'),{image_url:'/hero-character.webp',meta:{role:'FULL-STACK • AI ENGINEER • VIBE CODER'}});
 add('copy','about',l('درباره من','About me'),l('من Mr.HoSSein هستم؛ علاقه‌مند به توسعه فول‌استک، مهندسی هوش مصنوعی و ساخت سیستم‌های هوشمند. تمرکز من بر ترکیب برنامه‌نویسی، خلاقیت و اتوماسیون برای تبدیل ایده‌های پیچیده به محصولات دیجیتال کاربردی است.','I am Mr.HoSSein, passionate about full-stack development, AI engineering and intelligent systems. I combine programming, creativity and automation to turn complex ideas into practical digital products.'));
 add('copy','projects',l('پروژه‌ها','Projects'),l('منتخبی از پروژه‌های واقعی و در حال توسعه.','Selected real projects and works in progress.'));
 add('copy','contact',l('ایده‌ای برای همکاری داری؟','GOT A PROJECT IN MIND?'),l('صحبت کنیم',"Let's talk"),{link_url:'https://t.me/Hosssein_0905'});
 add('copy','footer',l('Mr.HoSSein','Mr.HoSSein'),l('توسعه نرم‌افزار، هوش مصنوعی و اتوماسیون','Software, AI and automation'));
 add('copy','navigation',l('منو','Navigation'),l('درباره من | خدمات | پروژه‌ها | ارتباط','About | Services | Projects | Contact'),{meta:{fa:['درباره من','خدمات','پروژه‌ها','ارتباط'],en:['About','Services','Projects','Contact']}});
 const families=[
  ['web','توسعه وب و تجارت دیجیتال','Web & Digital Commerce',['website','webapp','commerce']],
  ['software','توسعه نرم‌افزار','Software Engineering',['backend','mobile','desktop']],
  ['ai','مهندسی هوش مصنوعی','AI Engineering',['agents','assistant','rag']],
  ['automation','اتوماسیون و یکپارچه‌سازی','Automation & Integrations',['workflows','mcp','integration']],
  ['infrastructure','زیرساخت و رسانه هوشمند','Infrastructure & AI Media',['local-ai','devops','media']]
 ] as const;
 for(const [i,[id,fa,en,ids]] of families.entries()){
  add('service_group',id,l(fa,en),empty,{sort_order:(i+1)*10});
  for(const [j,key] of ids.entries()){
   const s=serviceGroups.flatMap(g=>g.items).find(x=>x.id===key);
   if(s)add('service',key,s.title,s.description,{group_key:id,sort_order:j*10});
  }
 }
 for(const [i,s] of skills.entries())add('skill',slugify(s.label)||'skill-'+i,l(s.label,s.label),empty,{sort_order:i*10,meta:{level:s.level}});
 for(const [i,s] of socials.entries())add('social',slugify(s.name),l(s.name,s.name),empty,{link_url:s.url,sort_order:i*10});
 const words=['ASSEMBLY','C','C++','JAVASCRIPT','NEXT.JS','WEB APPS','FULL STACK','BACKEND','API','AI AGENTS','VIBE CODING','AUTOMATION','N8N','MAKE','ZAPIER','MCP','CHATBOTS','RAG','OLLAMA','COMFYUI','DOCKER'];
 for(const [i,name] of words.entries())add('gallery','tile-'+String(i+1).padStart(2,'0'),l(name,name),empty,{sort_order:i*10,group_key:i<11?'first':'second'});
 for(const [i,item] of journey.entries())add('journey','chapter-'+(i+1),item.title,item.body,{sort_order:i*10});
 add('page','about',l('درباره من','About'),l('نگاهی به مسیر برنامه‌نویسی، هوش مصنوعی و اتوماسیون','My journey in programming, AI and automation'),{body:l(journey.map(j=>j.body.fa).join('\n\n'),journey.map(j=>j.body.en).join('\n\n'))});
 add('page','contact',l('تماس با من','Contact'),l('برای شروع یک همکاری یا گفت‌وگو، از روش‌های ارتباطی سایت استفاده کن.','Get in touch to discuss a project or collaboration.'),{link_url:'https://t.me/Hosssein_0905'});
 add('page','terms',l('قوانین و شرایط','Terms'),l('این صفحه پیش‌نویس است و پیش از انتشار نهایی باید تکمیل شود.','This is a draft to be completed before publication.'),{published:false});
 return items;
})();
type CMSRecord=CmsEntry[];
export const entryOf=(entries:CmsEntry[],kind:CmsKind,slug:string)=>entries.find(x=>x.kind===kind&&x.slug===slug&&x.published);
export const entriesOf=(entries:CmsEntry[],kind:CmsKind)=>entries.filter(x=>x.kind===kind&&x.published).sort((a,b)=>a.sort_order-b.sort_order||a.slug.localeCompare(b.slug));
export async function getCMS():Promise<CmsSnapshot>{
 if(!cmsConfigured||!supabase)return {entries:defaultCMS,initialized:false,error:null};
 const [state,content]=await Promise.all([
  supabase.from('portfolio_settings').select('value').eq('key','cms_initialized').maybeSingle(),
  supabase.from('portfolio_cms_entries').select('*').eq('published',true).order('sort_order')
 ]);
 if(state.error||content.error)return {entries:defaultCMS,initialized:false,error:state.error?.message||content.error?.message||'CMS unavailable'};
 const initialized=state.data?.value===true;
 return {entries:initialized?(content.data||[]) as CmsEntry[]:defaultCMS,initialized,error:null};
}
export const blankEntry=(kind:CmsKind):CmsEntry=>({
 id:'',kind,slug:'',title:l('',''),description:l('',''),body:l('',''),group_key:'',
 image_url:null,link_url:null,published:false,sort_order:100,meta:{}
});
