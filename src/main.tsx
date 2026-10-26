import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {motion,useReducedMotion,useScroll,useTransform,type MotionValue} from 'framer-motion';
import {ArrowUpRight,ArrowDown,Asterisk,LockKeyhole,Plus,Trash2,Save,LogOut,LoaderCircle,Image as ImageIcon,Settings2,X,Menu,ChevronLeft,Send,Copy} from 'lucide-react';
import {serviceGroups,labels,type Localized} from './content';
import CMSStudio from './CMSStudio';
import {defaultCMS,getCMS,entryOf,entriesOf,safeUrl,type CmsEntry,type CmsSnapshot} from './cms';
import {supabase,cmsConfigured,loadProjects,loadSetting,adminStatus,type Project,type ProjectStatus} from './db';
import './styles.css';
import './cms.css';

// Content-only personalization of the original template; visual section structure retained.
type Lang='fa'|'en';
type Props={lang:Lang};
type PreviewProject={id:string;names:Localized;states:Localized;images:string[];url:string;cover?:string;slug?:string};
const emptyLocalized=():Localized=>({fa:'',en:''});
const statusLabels:Record<ProjectStatus,Localized>={real:{fa:'واقعی',en:'Real'},progress:{fa:'در حال توسعه',en:'In progress'},concept:{fa:'مفهومی',en:'Concept'},research:{fa:'آزمایشی',en:'Research'}};
const colors=['#bb26b8','#9f65eb','#25b4a9','#d5684e','#b8bd45','#5579d9','#d77cb4','#5fc6e0','#d2a158','#8257bd','#76bb8f'];
const work=['ASSEMBLY','C','C++','JAVASCRIPT','NEXT.JS','WEB APPS','FULL STACK','BACKEND','API','AI AGENTS','VIBE CODING','AUTOMATION','N8N','MAKE','ZAPIER','MCP','CHATBOTS','RAG','OLLAMA','COMFYUI','DOCKER'];
const dict={
 fa:{about:'درباره من',services:'خدمات',projects:'پروژه‌ها',contact:'ارتباط',cta:'ارتباط با من',heading:'پروژه‌ها',top:'بازگشت به بالا',talk:'صحبت کنیم',footer:'ایده‌ای برای همکاری داری؟',
 hero:'از یک ایده تا یک دنیای دیجیتال هوشمند؛ جایی که کدنویسی، خلاقیت و هوش مصنوعی به هم می‌رسند.',
 bio:'من Mr.HoSSein هستم؛ علاقه‌مند به توسعه فول‌استک، مهندسی هوش مصنوعی و ساخت سیستم‌های هوشمند. تمرکز من بر ترکیب برنامه‌نویسی، خلاقیت و اتوماسیون برای تبدیل ایده‌های پیچیده به محصولات دیجیتال کاربردی است.',
 intro:'پروژه‌های در حال توسعه و ایده‌های در مرحله طراحی، با برچسب وضعیت واقعی.',
 notice:'طرح‌های گرافیکی کارت‌ها نمایشی هستند و جایگزین اسکرین‌شات واقعی پروژه نمی‌شوند.',group:'پروژه‌های شخصی و ایده‌ها',repo:'مخزن GitHub',discuss:'گفت‌وگو'},
 en:{about:'About',services:'Services',projects:'Projects',contact:'Contact',cta:'Contact Me',heading:'Project',top:'Back to top',talk:"Let's talk",footer:'GOT A PROJECT IN MIND?',
 hero:'Turning ambitious ideas into powerful digital products with code, AI, and automation.',
 bio:'I am Mr.HoSSein, passionate about full-stack development, AI engineering and intelligent systems. I combine programming, creativity and automation to turn complex ideas into practical digital products.',
 intro:'Work in progress and concepts, accurately labelled.',notice:'Graphic placeholders are not screenshots of this project.',group:'Personal work and concepts',repo:'GitHub repo',discuss:'Discuss'}
} as const;
const services={
 fa:[['توسعه وب و فول‌استک','وب‌سایت، لندینگ‌پیج، وب‌اپلیکیشن، پنل مدیریت، فروشگاه اینترنتی، CMS، بک‌اند و API.'],['مهندسی هوش مصنوعی','عامل‌های هوش مصنوعی، چت‌بات و دستیار اختصاصی، سامانه‌های RAG و اتصال به داده‌ها.'],['اتوماسیون و MCP','n8n، Make و Zapier، ساخت MCP Server و یکپارچه‌سازی سرویس‌ها و APIها.'],['زیرساخت و AI محلی','راه‌اندازی مدل‌های محلی، Deployment و DevOps، اتوماسیون تولید تصویر و ویدیو.'],['اپلیکیشن موبایل و دسکتاپ','توسعه برنامه‌های موبایل و دسکتاپ با روش ترکیبی کدنویسی دستی و AI Agents.']],
 en:[['Full-Stack Development','Websites, landing pages, web apps, dashboards, e-commerce, CMS, backend and APIs.'],['AI Engineering','Custom AI agents, chatbots, assistants, RAG and knowledge systems.'],['Automation & MCP','n8n, Make and Zapier workflows, custom MCP servers and API integrations.'],['Infrastructure & Local AI','Local LLM setup, deployment, DevOps and AI media workflows.'],['Mobile & Desktop Apps','Mobile and desktop software with hybrid traditional and AI-assisted development.']]
} as const;
const projects=[
 {id:'site',names:{fa:'وب‌سایت Mr.HoSSein',en:'Mr.HoSSein Portfolio'},states:{fa:'در حال توسعه',en:'In Progress'},images:['','',''],url:'https://github.com/MxPersonal/personal-portfolio'},
 {id:'noghlijan',names:{fa:'فروشگاه اینترنتی نقلیجان',en:'Noghlijan E-Commerce'},states:{fa:'در حال توسعه',en:'In Progress'},images:['','',''],url:'https://github.com/MxPersonal/z-noghlijan.ir-temp'},
 {id:'safir',names:{fa:'مرکز چاپ سفیر هنر',en:'Safir Honar Print Center'},states:{fa:'در حال توسعه',en:'In Progress'},images:['','',''],url:'https://github.com/MxPersonal/safirehonarchapcenter'}
];
const socials=[
 ['GitHub','https://github.com/HosseinYazdanpanah'],['LinkedIn','https://www.linkedin.com/in/hossein-yazdanpanah-0206b93ab/'],['Telegram','https://t.me/Hosssein_0905'],['Instagram','https://www.instagram.com/hossein._.yzdnpnh/'],['YouTube','https://www.youtube.com/@HoSSeinYazdanpnh'],['Discord','https://discord.com/users/1241497971888230496'],['Eitaa','https://eitaa.com/HoSSeinyazdnpnh'],['Rubika','https://rubika.ir/hossein_yazdanpnh']
] as const;


function FadeIn({children,delay=0,x=0,y=30,duration=.7,className='',style}:{children:React.ReactNode,delay?:number,x?:number,y?:number,duration?:number,className?:string,style?:React.CSSProperties}){
 const reduced=useReducedMotion();
 return <motion.div className={className} style={style} initial={reduced?false:{opacity:0,x,y}} whileInView={{opacity:1,x:0,y:0}} viewport={{once:true,margin:'50px',amount:0}} transition={{delay:reduced?0:delay,duration:reduced?0:duration,ease:[.25,.1,.25,1]}}>{children}</motion.div>
}
function ContactButton({lang}:{lang:Lang}){return <a className="contact-button" href="#contact">{dict[lang].cta} <ArrowUpRight size={19} strokeWidth={1.8}/></a>}
function Magnet({children}:{children:React.ReactNode}){
 const ref=useRef<HTMLDivElement>(null),[pos,setPos]=useState({x:0,y:0}),[active,setActive]=useState(false),reduced=useReducedMotion();
 useEffect(()=>{if(reduced)return;const handle=(e:PointerEvent)=>{if(e.pointerType==='touch'||!ref.current)return;const b=ref.current.getBoundingClientRect(),dx=e.clientX-(b.left+b.width/2),dy=e.clientY-(b.top+b.height/2),near=e.clientX>=b.left-150&&e.clientX<=b.right+150&&e.clientY>=b.top-150&&e.clientY<=b.bottom+150;setActive(near);setPos(near?{x:dx/3,y:dy/3}:{x:0,y:0})};window.addEventListener('pointermove',handle,{passive:true});return()=>window.removeEventListener('pointermove',handle)},[reduced]);
 return <div ref={ref} className="magnet" style={{transform:reduced?'none':'translate3d('+pos.x+'px,'+pos.y+'px,0)',transition:active?'transform .3s ease-out':'transform .6s ease-in-out'}}>{children}</div>
}
function HeroSection({lang,setLang,available,entries}:{lang:Lang,setLang:(l:Lang)=>void,available:Localized,entries:CmsEntry[]}){
 const h=entryOf(entries,'copy','hero'),menu=entryOf(entries,'copy','navigation');
 const nav=menu?.meta[lang];const names=Array.isArray(nav)?nav:([dict[lang].about,dict[lang].services,dict[lang].projects,dict[lang].contact] as string[]);
 const img=safeUrl(h?.image_url||'/hero-character.webp',true);
 const [menuOpen,setMenuOpen]=useState(false);
 useEffect(()=>{
  if(!menuOpen)return;
  const onEscape=(event:KeyboardEvent)=>{if(event.key==='Escape')setMenuOpen(false)};
  window.addEventListener('keydown',onEscape);
  return()=>window.removeEventListener('keydown',onEscape);
 },[menuOpen]);
 const navIds=['about','services','projects','contact'] as const;
 return <section className="hero" id="home">
 <FadeIn y={-20} className="nav-outer">
  <nav className="navbar" aria-label={lang==='fa'?'ناوبری اصلی':'Main navigation'}>
   <div className="desktop-nav-links">
    {navIds.map((id,i)=><a key={id} href={'#'+id}>{typeof names[i]==='string'?names[i]:dict[lang][id]}</a>)}
   </div>
   <button type="button" className="mobile-menu-toggle" aria-controls="mobile-primary-navigation" aria-expanded={menuOpen} aria-label={lang==='fa'?(menuOpen?'بستن منو':'باز کردن منو'):(menuOpen?'Close menu':'Open menu')} onClick={()=>setMenuOpen(open=>!open)}>
    {menuOpen?<X size={25} aria-hidden="true"/>:<Menu size={25} aria-hidden="true"/>}
   </button>
   <button type="button" className="lang-toggle" onClick={()=>{setMenuOpen(false);setLang(lang==='fa'?'en':'fa')}} aria-label={lang==='fa'?'تغییر زبان به انگلیسی':'Switch language to Persian'}>{lang==='fa'?'EN':'FA'}</button>
  </nav>
  <nav id="mobile-primary-navigation" className="mobile-menu-panel" aria-label={lang==='fa'?'منوی موبایل':'Mobile navigation'} hidden={!menuOpen} dir={lang==='fa'?'rtl':'ltr'}>
   {navIds.map((id,i)=><a key={id} href={'#'+id} onClick={()=>setMenuOpen(false)}>{typeof names[i]==='string'?names[i]:dict[lang][id]}</a>)}
  </nav>
 </FadeIn>
 <FadeIn delay={.15} y={40} className="hero-title-wrap"><h1 className="hero-heading hero-title" dir="ltr">{h?.title.en??'Mr.HoSSein'}</h1></FadeIn>
 <FadeIn delay={.6} y={30} className="portrait-wrap"><Magnet>{img&&<img src={img} alt="Mr.HoSSein portrait" fetchPriority="high"/>}</Magnet></FadeIn>
 <div className="hero-bottom"><FadeIn delay={.35} y={20} className="hero-intro"><small className="availability-badge">{available[lang]}</small>
 <span dir={lang==='fa'?'rtl':'ltr'}>{h?.description[lang]??dict[lang].hero}</span>
 <small className="hero-role" dir="ltr">{typeof h?.meta.role==='string'?h.meta.role:'FULL-STACK • AI ENGINEER • VIBE CODER'}</small></FadeIn><FadeIn delay={.5} y={20}><ContactButton lang={lang}/></FadeIn></div>
 <a href="#work" className="scroll-cue" aria-label="Scroll down"><ArrowDown size={16}/></a></section>
}
function WorkTile({item,index,total}:{item:CmsEntry,index:number,total:number}){
 const media=safeUrl(item.image_url,true),video=media&&/\.(mp4|webm)(\?|$)/i.test(media);
 return <div className="work-tile" style={{'--tile-color':colors[index%colors.length]} as React.CSSProperties} aria-label={item.title.en}>
 {media?(video?<video src={media} preload="none" playsInline muted loop autoPlay/>:<img src={media} alt={item.title.en} loading="lazy"/>):<><div className="tile-decoration"/><div className="tile-orbit"/></>}
 <div className="tile-wordmark">{item.title.en||item.title.fa}</div><span className="tile-index">{String(index+1).padStart(2,'0')} / {total}</span>
 </div>
}
function MarqueeSection({entries}:{entries:CmsEntry[]}){
 const target=useRef<HTMLElement>(null),[offset,setOffset]=useState(0),reduced=useReducedMotion();
 const media=entriesOf(entries,'gallery'),first=media.filter(m=>m.group_key==='first'),second=media.filter(m=>m.group_key!=='first');
 const rows=[first.length?first:media.slice(0,Math.ceil(media.length/2)),second.length?second:media.slice(Math.ceil(media.length/2))];
 useEffect(()=>{if(reduced)return;let raf=0;const update=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const top=target.current?.getBoundingClientRect().top??0;setOffset((-top+window.innerHeight)*.3)})};update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);return()=>{cancelAnimationFrame(raf);window.removeEventListener('scroll',update);window.removeEventListener('resize',update)}},[reduced]);
 if(!media.length)return null;
 return <section className="work-section" id="work" ref={target} aria-label="Selected work">{rows.map((row,r)=>row.length?<div key={r} className="marquee-row" style={{transform:reduced?'none':'translate3d('+(r===0?((offset-200)%432)-432:-((offset-200)%432)-650)+'px,0,0)'}}>{[...row,...row,...row].map((item,i)=><WorkTile key={r+'-'+i} item={item} index={i%row.length} total={row.length}/>)}</div>:null)}</section>
}
function Letter({char,index,count,progress}:{char:string,index:number,count:number,progress:MotionValue<number>}){
 const from=Math.max(0,index/count-.08),to=Math.min(1,index/count+.11);
 const opacity=useTransform(progress,[from,to],[.2,1]);
 return <motion.span style={{opacity}}>{char===' '?'\u00a0':char}</motion.span>
}
function AnimatedText({text}:{text:string}){
 const ref=useRef<HTMLParagraphElement>(null),{scrollYProgress}=useScroll({target:ref,offset:['start 0.8','end 0.2']});
 if(/[\u0600-\u06ff]/.test(text))return <motion.p className="about-description" dir="rtl" initial={{opacity:.25}} whileInView={{opacity:1}} viewport={{once:true}} transition={{duration:.7}}>{text}</motion.p>;
 return <p className="about-description" ref={ref} aria-label={text}>{Array.from(text).map((char,i)=><Letter key={i} char={char} index={i} count={text.length} progress={scrollYProgress}/>)}</p>
}
function AboutSection({lang,entries}:{lang:Lang,entries:CmsEntry[]}){
 const about=entryOf(entries,'copy','about'),skills=entriesOf(entries,'skill'),milestones=entriesOf(entries,'journey');
 return <section className="about-section" id="about">
 {['moon','left-object','lego','right-object'].map((pos,i)=><FadeIn key={pos} x={i<2?-80:80} y={0} duration={.9} delay={.1+i*.08} className={'floating '+pos}><span className="original-art-replacement" aria-hidden="true"/></FadeIn>)}
 <div className="about-content"><FadeIn y={40}><h2 className="hero-heading massive-heading">{about?.title[lang]??dict[lang].about}</h2></FadeIn><AnimatedText text={about?.description[lang]??dict[lang].bio}/>
 {!!skills.length&&<details className="cms-journey"><summary>{lang==='fa'?'مهارت‌ها و فناوری‌ها':'Skills & technologies'} ↓</summary><div className="cms-skillset">{skills.map(x=><span key={x.slug}>{x.title[lang]}</span>)}</div></details>}
 {!!milestones.length&&<details className="cms-journey"><summary>{lang==='fa'?'داستان مسیر من':'My journey'} ↓</summary>{milestones.map(x=><section key={x.slug}><strong>{x.title[lang]}</strong><p>{x.description[lang]}</p></section>)}</details>}
 <FadeIn delay={.1} y={20}><ContactButton lang={lang}/></FadeIn></div></section>
}
const serviceRows=[
 {fa:'وب و تجارت دیجیتال',en:'Web & Digital Commerce',ids:['website','webapp','commerce']},
 {fa:'توسعه نرم‌افزار',en:'Software Engineering',ids:['backend','mobile','desktop']},
 {fa:'مهندسی هوش مصنوعی',en:'AI Engineering',ids:['agents','assistant','rag']},
 {fa:'اتوماسیون و یکپارچه‌سازی',en:'Automation & Integration',ids:['workflows','mcp','integration']},
 {fa:'زیرساخت و رسانه هوشمند',en:'Infrastructure & AI Media',ids:['local-ai','devops','media']}
];
const allServices=serviceGroups.flatMap(group=>group.items);
function ServicesSection({lang,entries}:{lang:Lang,entries:CmsEntry[]}){
 const groups=entriesOf(entries,'service_group'),services=entriesOf(entries,'service');
 return <section className="services-section" id="services"><FadeIn><h2 className="massive-heading services-title">{dict[lang].services}</h2></FadeIn><div className="services-list">
 {groups.map((group,i)=>{const sub=services.filter(x=>x.group_key===group.slug);return <FadeIn key={group.slug} delay={i*.07} y={30} className="service-item"><div className="service-number">{String(i+1).padStart(2,'0')}</div><div className="service-copy"><h3>{group.title[lang]}</h3><p>{sub.map(x=>x.title[lang]).join(' · ')}</p>
 {!!sub.length&&<details className="service-expansion"><summary>{lang==='fa'?'جزئیات خدمات':'Service details'} +</summary>{sub.map(x=><div className="subservice" key={x.slug}><strong>{x.title[lang]}</strong><p>{x.description[lang]}</p></div>)}</details>}</div><ArrowUpRight size={22} className="service-arrow" strokeWidth={1.5}/></FadeIn>})}
 </div></section>
}
function ProjectCard({item,index,total,lang}:{item:PreviewProject,index:number,total:number,lang:Lang}){
 const ref=useRef<HTMLDivElement>(null),{scrollYProgress}=useScroll({target:ref,offset:['start end','end start']}),scale=useTransform(scrollYProgress,[0,.5,1],[1,1,1-(total-1-index)*.03]);
 return <div className="project-card-track" ref={ref}><motion.article className="project-card" style={{scale,top:'calc(var(--sticky-top) + '+index*28+'px)'}}><div className="project-top"><div className="project-number">{String(index+1).padStart(2,'0')}</div><div className="project-name"><span>{item.states[lang]}</span><h3>{item.names[lang]}</h3></div><a href={item.slug?'/project/'+item.slug:item.url||'#contact'} className="live-project-button" target={!item.slug&&item.url?'_blank':undefined} rel={!item.slug&&item.url?'noopener noreferrer':undefined}>{item.url?dict[lang].repo:dict[lang].discuss} <ArrowUpRight size={16}/></a></div><div className="project-images"><div className="project-img-small"><div className="original-project-art"><span>MR.HOSSEIN / WORK</span><strong>{item.names.en}</strong><small>{item.id.toUpperCase()}</small></div><div className="original-project-art"><span>MR.HOSSEIN / WORK</span><strong>{item.names.en}</strong><small>{item.id.toUpperCase()}</small></div></div><div className="project-img-large">{item.cover?<img src={item.cover} alt={item.names[lang]} loading="lazy"/>:<div className="original-project-art"><span>MR.HOSSEIN / WORK</span><strong>{item.names.en}</strong><small>{item.id.toUpperCase()}</small></div>}</div></div><p className="project-disclaimer">{dict[lang].notice}</p></motion.article></div>
}
function ProjectsSection({lang,dbProjects,entries,initialized}:{lang:Lang,dbProjects:Project[],entries:CmsEntry[],initialized:boolean}){
 const config=entryOf(entries,'copy','projects');
 const dynamic:PreviewProject[]=dbProjects.map(p=>({id:p.id,slug:p.slug,names:p.title,states:statusLabels[p.status],images:[],url:p.repo_url||p.demo_url||'',cover:p.cover_url||''}));
 const selected=initialized?dynamic:[...dynamic,...projects.filter(p=>!dynamic.some(x=>x.names.en===p.names.en))];
 return <section className="projects-section" id="projects"><FadeIn className="project-heading-wrap"><div className="heading-eyebrow"><Asterisk size={19}/> {dict[lang].group}</div><h2 className="hero-heading massive-heading">{config?.title[lang]??dict[lang].heading}</h2><p>{config?.description[lang]??dict[lang].intro}</p></FadeIn>
 <div className="project-stacks">{selected.map((item,i)=><ProjectCard key={item.id} item={item} index={i} total={selected.length} lang={lang}/>)}</div></section>
}
function ContactSection({lang,entries}:{lang:Lang,entries:CmsEntry[]}){
 const c=entryOf(entries,'copy','contact'),social=entriesOf(entries,'social'),pages=entriesOf(entries,'page');
 const url=safeUrl(c?.link_url||'https://t.me/Hosssein_0905');
 return <section className="projects-section contact-section" id="contact"><footer className="footer-contact"><span className="footer-kicker">{c?.title[lang]??dict[lang].footer}</span>
 <a href={url||'#contact'} className="footer-title" target={url?'_blank':undefined} rel={url?'noopener noreferrer':undefined}>{c?.description[lang]??dict[lang].talk} <ArrowUpRight strokeWidth={1.4}/></a>
 <InquiryPanel lang={lang} entries={entries}/>
 <div className="footer-socials">{social.map(x=>{const link=safeUrl(x.link_url);return link?<a href={link} target="_blank" rel="noopener noreferrer" key={x.slug}>{x.title[lang]}</a>:null})}</div>
 <nav className="cms-custom-pages">{pages.map(x=><a key={x.slug} href={'/'+lang+'/page/'+x.slug}>{x.title[lang]}</a>)}</nav>
 <div className="footer-bottom"><span>© {new Date().getFullYear()} Mr.HoSSein. All rights reserved.</span><a href="#home">{dict[lang].top} ↑</a><a href="/admin">CMS</a></div>
 </footer></section>
}
function InquiryPanel({lang,entries}:{lang:Lang,entries:CmsEntry[]}){
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[service,setService]=useState(''),[message,setMessage]=useState(''),[website,setWebsite]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setNotice('');try{const r=await fetch('/api/inquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({full_name:name,email,service,message,website,locale:lang})});const data=await r.json();if(!r.ok)throw Error(data.error);setNotice(lang==='fa'?'درخواست ثبت شد. کد پیگیری: '+(data.reference||''):'Inquiry saved. Reference: '+(data.reference||''));setMessage('')}catch{setNotice(lang==='fa'?'ثبت آنلاین فعلاً در دسترس نیست. از تلگرام استفاده کن.':'Online form is unavailable; contact me through Telegram.')}finally{setBusy(false)}}
 return <details className="inquiry-panel"><summary>{lang==='fa'?'فرم درخواست پروژه':'Project inquiry form'} ↓</summary><form onSubmit={submit}>
 <label>{lang==='fa'?'نام':'Name'}<input required minLength={2} value={name} maxLength={90} onChange={e=>setName(e.target.value)}/></label>
 <label>{lang==='fa'?'ایمیل':'Email'}<input required type="email" value={email} maxLength={160} onChange={e=>setEmail(e.target.value)}/></label>
 <label>{lang==='fa'?'خدمت':'Service'}<select value={service} onChange={e=>setService(e.target.value)}><option value="">—</option>{entriesOf(entries,'service').map(x=><option key={x.slug} value={x.title.en}>{x.title[lang]}</option>)}</select></label>
 <label className="inquiry-wide">{lang==='fa'?'شرح پروژه':'Project description'}<textarea required minLength={20} maxLength={4000} value={message} onChange={e=>setMessage(e.target.value)}/></label>
 <input className="inquiry-honeypot" tabIndex={-1} aria-hidden="true" autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/>
 <button type="submit" className="contact-button" disabled={busy}><Send size={16}/>{lang==='fa'?'ثبت درخواست':'Submit inquiry'}</button>
 <a className="inquiry-link" href="https://t.me/Hosssein_0905" target="_blank" rel="noopener noreferrer">Telegram</a>
 {notice&&<p className="inquiry-wide" role="status">{notice}</p>}
 </form></details>
}
function Admin({lang,onRefresh}:Props & {onRefresh:()=>void}){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[code,setCode]=useState('');
 const [authMode,setAuthMode]=useState<'signIn'|'signUp'|'verify'>('signIn');
 const [sessionReady,setSessionReady]=useState(false),[authorized,setAuthorized]=useState(false),[status,setStatus]=useState('');
 const [authReason,setAuthReason]=useState('checking');
 const [items,setItems]=useState<Project[]>([]);
 const [inquiries,setInquiries]=useState<Array<{id:string;reference:string;full_name:string;email:string;service:string;message:string;status:string;created_at:string}>>([]);
 const [tab,setTab]=useState('site'),[edit,setEdit]=useState<null|Project>(null),[busy,setBusy]=useState(false);
 const [availability,setAvailability]=useState<Localized>({fa:labels.fa.availability,en:labels.en.availability});
 const t=labels[lang];
 const refresh=async()=>{
  if(!supabase)return;
  const [p,q,settings]=await Promise.all([
   supabase.from('portfolio_projects').select('*').order('sort_order'),
   supabase.from('portfolio_inquiries').select('*').order('created_at',{ascending:false}).limit(100),
   supabase.from('portfolio_settings').select('value').eq('key','availability').maybeSingle()
  ]);
  if(p.data)setItems(p.data as Project[]);
  if(q.data)setInquiries(q.data);
  if(settings.data?.value)setAvailability(settings.data.value as Localized);
  if(p.error||q.error)setStatus(p.error?.message||q.error?.message||'');
 };
 useEffect(()=>{
  if(!supabase)return;
  let mounted=true;
  supabase.auth.getSession().then(async ({data})=>{
   if(!mounted)return;
   setSessionReady(Boolean(data.session));
   if(data.session){const result=await adminStatus();if(!mounted)return;setAuthorized(result.admin);setAuthReason(result.reason);if(result.admin)void refresh()}
  }).catch(()=>setSessionReady(false));
  return ()=>{mounted=false};
 },[]);
 async function onAuth(e:React.FormEvent){
  e.preventDefault();if(!supabase)return;setBusy(true);setStatus('');
  try{
   if(authMode==='verify'){
    const r=await supabase.auth.verifyEmail({email,otp:code});
    if(r.error)throw r.error;
    setAuthMode('signIn');setStatus(lang==='fa'?'ایمیل تأیید شد. اکنون وارد شو.':'Email verified. Please sign in.');return;
   }
   if(password.length<8)throw Error(lang==='fa'?'رمز عبور باید حداقل ۸ کاراکتر باشد.':'Password must have at least 8 characters.');
   if(authMode==='signUp'){
    const r=await supabase.auth.signUpWithPassword({email,password});
    if(r.error)throw r.error;
    if(r.requiresVerification){setAuthMode('verify');setStatus(lang==='fa'?'کد تأیید به ایمیل ارسال شد.':'Check your inbox for the verification code.');return}
    setStatus(lang==='fa'?'حساب ایجاد شد؛ اکنون وارد شو.':'Account created. Please sign in.');
    setAuthMode('signIn');return;
   }
   const r=await supabase.auth.signInWithPassword({email,password});
   if(r.error)throw r.error;
   setSessionReady(true);
   const result=await adminStatus();setAuthorized(result.admin);setAuthReason(result.reason);
   if(result.admin)await refresh();
   else setStatus(lang==='fa'?'ورود انجام شد؛ بررسی دسترسی مدیر ناموفق بود.':'Signed in, but admin verification failed.');
  }catch(err){setStatus(err instanceof Error?err.message:'Authentication failed')}
  finally{setBusy(false)}
 }
 const blank=():Project=>({id:'',slug:'',title:emptyLocalized(),summary:emptyLocalized(),body:emptyLocalized(),role:emptyLocalized(),status:'progress',category:'web',stack:[],cover_url:null,video_url:null,demo_url:null,repo_url:null,featured:false,published:false,sort_order:0});
 async function saveProject(){if(!supabase||!edit)return;setBusy(true);setStatus('');const {id,...fields}=edit;const result=id?await supabase.from('portfolio_projects').update(fields).eq('id',id):await supabase.from('portfolio_projects').insert(fields);if(result.error)setStatus(result.error.message);else{setEdit(null);setStatus(lang==='fa'?'پروژه ذخیره شد.':'Project saved.');await refresh();onRefresh()}setBusy(false)};
 async function deleteProject(id:string){if(!supabase||!confirm(lang==='fa'?'این پروژه حذف شود؟':'Delete this project?'))return;const r=await supabase.from('portfolio_projects').delete().eq('id',id);if(r.error)setStatus(r.error.message);else{refresh();onRefresh()}};
 async function uploadFile(file:File){if(!supabase||!edit)return;if(file.size>15*1024*1024){setStatus('File exceeds 15 MB');return}setBusy(true);const filename=`projects/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g,'-')}`;const {data,error}=await supabase.storage.from('portfolio-media').upload(filename,file,{upsert:false,contentType:file.type});if(error)setStatus(error.message);else if(data){const {data:url}=supabase.storage.from('portfolio-media').getPublicUrl(data.path);setEdit(v=>v?{...v,cover_url:url.publicUrl}:v)}setBusy(false)};
 if(!cmsConfigured)return <section className="admin-layout container"><span className="eyebrow">NEON CMS</span><h1>{lang==='fa'?'اتصال Neon Auth پیکربندی نشده':'Neon Auth is not configured'}</h1><p>VITE_NEON_AUTH_URL</p></section>;
 if(!sessionReady)return <section className="admin-layout container">
  <span className="eyebrow">NEON AUTH / PORTFOLIO CMS</span><h1>{authMode==='verify'?(lang==='fa'?'تأیید ایمیل':'Verify your email'):authMode==='signUp'?(lang==='fa'?'ساخت حساب':'Create account'):(lang==='fa'?'ورود مدیر':'Admin sign in')}</h1>
  <form className="auth-form" onSubmit={onAuth}>
   <label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label>
   {authMode==='verify'?<label>{lang==='fa'?'کد تأیید ایمیل':'Email verification code'}<input required inputMode="numeric" type="text" value={code} onChange={e=>setCode(e.target.value)} autoComplete="one-time-code"/></label>:<label>{lang==='fa'?'رمز عبور':'Password'}<input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={authMode==='signUp'?'new-password':'current-password'}/></label>}
   <button className="btn btn-primary" disabled={busy} type="submit">{authMode==='verify'?(lang==='fa'?'تأیید کد':'Verify code'):authMode==='signUp'?(lang==='fa'?'ثبت‌نام':'Create account'):(lang==='fa'?'ورود':'Sign in')}</button>
  </form>
  <p><button type="button" className="btn btn-outline" onClick={()=>{setStatus('');setAuthMode(authMode==='signUp'||authMode==='verify'?'signIn':'signUp')}}>{authMode==='signIn'?(lang==='fa'?'ساخت اولین حساب':'Create first account'):(lang==='fa'?'بازگشت به ورود':'Back to sign in')}</button></p>
  {status&&<p className="status-text" role="status">{status}</p>}
 </section>;
 const authMessages:Record<string,Localized>={
 token_missing:{fa:'نشست ورود برقرار است، اما توکن دسترسی برای سرور ارسال نشده است. یک بار خارج شو و دوباره وارد شو.',en:'Signed in, but the access token was unavailable. Sign out and sign in again.'},
 token_invalid_or_expired:{fa:'توکن ورود توسط Neon تأیید نشد. اتصال Auth و تنظیمات Vercel باید بررسی شوند.',en:'The server could not validate your Neon access token.'},
 admin_role_missing:{fa:'حساب در سرور شناسایی شد، اما شناسه آن در جدول مدیران همین دیتابیس پیدا نشد.',en:'Identity verified but this user ID is not in the approved admins table.'},
 database_unavailable:{fa:'اتصال API به دیتابیس Neon خطا داد. نیازی به ثبت مجدد UUID نیست.',en:'The CMS server could not access its Neon database.'},
 auth_config_missing:{fa:'نشانی Neon Auth در تنظیمات سرور Vercel موجود نیست.',en:'Neon Auth server URL is missing from Vercel configuration.'},
 auth_unavailable:{fa:'Neon Auth در مرورگر هنوز پیکربندی نشده است.',en:'Neon Auth is not configured in the browser.'},
 connection_failed:{fa:'پاسخ بررسی دسترسی از API سایت دریافت نشد.',en:'The admin status API did not respond.'},
 checking:{fa:'دسترسی مدیر در حال بررسی است.',en:'Checking administrator access.'}
 };
 async function retryAdmin(){setBusy(true);const r=await adminStatus();setAuthorized(r.admin);setAuthReason(r.reason);setStatus('');if(r.admin)await refresh();setBusy(false)}
 if(!authorized)return <section className="admin-layout container"><LockKeyhole size={38}/><h1>{lang==='fa'?'حساب هنوز مجوز مدیریت ندارد':'Admin approval required'}</h1>
  <p role="status">{authMessages[authReason]?.[lang]||(lang==='fa'?'دسترسی مدیر توسط سرور تأیید نشد.':'Administrator access could not be verified.')}</p><p dir="ltr">Auth check: <code>{authReason}</code></p><button className="btn btn-outline" disabled={busy} onClick={retryAdmin}>{lang==='fa'?'بررسی دوباره دسترسی':'Recheck administrator access'}</button>
  <AdminIdentity lang={lang}/>
  {status&&<p className="status-text">{status}</p>}
  <button className="btn btn-outline" onClick={()=>supabase?.auth.signOut()}>Sign out</button>
 </section>;
 return <section className="admin-layout container"><div className="admin-header"><div><span className="eyebrow">SECURE CMS / MR.HOSSEIN</span><h1>{lang==='fa'?'پنل مدیریت پورتفولیو':'Portfolio Dashboard'}</h1></div><button className="btn btn-outline" onClick={()=>supabase?.auth.signOut()}><LogOut size={16}/> Sign out</button></div><div className="filter-pills"><button onClick={()=>setTab('site')} className={tab==='site'?'active':''}>{lang==='fa'?'مدیریت محتوا':'Site CMS'}</button><button onClick={()=>setTab('projects')} className={tab==='projects'?'active':''}>Projects ({items.length})</button><button onClick={()=>setTab('inquiries')} className={tab==='inquiries'?'active':''}>Inquiries ({inquiries.length})</button><button onClick={()=>setTab('settings')} className={tab==='settings'?'active':''}>Settings</button></div>{status&&<p className="status-text">{status}</p>}{tab==='site'?<CMSStudio lang={lang} onRefresh={onRefresh}/>:tab==='projects'?<><div className="admin-section-header"><h2>Projects</h2><button className="btn btn-primary" onClick={()=>setEdit(blank())}><Plus size={16}/> New project</button></div><div className="admin-project-list">{items.map(p=><div className="admin-project-row" key={p.id}>{p.cover_url?<img src={p.cover_url} alt=""/>:<ImageIcon size={30}/>}<div><strong>{p.title[lang]||p.slug}</strong><small>{p.status} · {p.published?'Published':'Draft'} · {p.featured?'Featured':'Standard'}</small></div><button className="icon-btn" title="Edit project" onClick={()=>setEdit(p)}><Settings2 size={18}/></button><button className="icon-btn" title="Delete project" onClick={()=>deleteProject(p.id)}><Trash2 size={18}/></button></div>)}</div></>:tab==='inquiries'?<div className="admin-project-list">{inquiries.length===0?<p>No inquiries yet.</p>:inquiries.map(q=><div className="admin-inquiry" key={q.id}><strong>{q.reference} · {q.full_name}</strong><small>{q.email} · {q.service} · {new Date(q.created_at).toLocaleDateString()}</small><p>{q.message}</p><select value={q.status} onChange={async e=>{if(!supabase)return;await supabase.from('portfolio_inquiries').update({status:e.target.value}).eq('id',q.id);refresh()}}>{['new','reviewing','replied','closed'].map(s=><option key={s}>{s}</option>)}</select></div>)}</div>:<div className="admin-setting-panel"><h2>Collaboration status</h2><label>Persian<input value={availability.fa} onChange={e=>setAvailability(v=>({...v,fa:e.target.value}))}/></label><label>English<input value={availability.en} onChange={e=>setAvailability(v=>({...v,en:e.target.value}))}/></label><button className="btn btn-primary" onClick={async()=>{const r=await supabase?.from('portfolio_settings').upsert({key:'availability',value:availability});setStatus(r?.error?.message||'Saved. Refresh the public site to view changes.')}}>Save availability</button></div>}
 {edit&&<div className="overlay" onMouseDown={()=>setEdit(null)}><div className="sheet admin-edit" role="dialog" aria-modal="true" onMouseDown={e=>e.stopPropagation()}><div className="modal-top"><strong>{edit.id?'Edit project':'New project'}</strong><button className="icon-btn" onClick={()=>setEdit(null)} aria-label="Close"><X size={20}/></button></div><div className="admin-edit-fields"><label>Slug<input value={edit.slug} onChange={e=>setEdit(v=>v?{...v,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-')}:v)}/></label>{(['title','summary','body','role'] as const).map(field=><div className="admin-double" key={field}><label>{field} FA<textarea rows={field==='body'?4:2} value={edit[field].fa} onChange={e=>setEdit(v=>v?{...v,[field]:{...v[field],fa:e.target.value}}:v)}/></label><label>{field} EN<textarea rows={field==='body'?4:2} value={edit[field].en} onChange={e=>setEdit(v=>v?{...v,[field]:{...v[field],en:e.target.value}}:v)}/></label></div>)}<div className="admin-double"><label>Status<select value={edit.status} onChange={e=>setEdit(v=>v?{...v,status:e.target.value as ProjectStatus}:v)}>{Object.keys(statusLabels).map(s=><option key={s}>{s}</option>)}</select></label><label>Category<input value={edit.category} onChange={e=>setEdit(v=>v?{...v,category:e.target.value}:v)}/></label></div><label>Technology stack (comma separated)<input value={edit.stack.join(', ')} onChange={e=>setEdit(v=>v?{...v,stack:e.target.value.split(',').map(x=>x.trim()).filter(Boolean)}:v)}/></label><div className="admin-double"><label>Live demo URL<input value={edit.demo_url||''} onChange={e=>setEdit(v=>v?{...v,demo_url:e.target.value||null}:v)}/></label><label>GitHub repository URL<input value={edit.repo_url||''} onChange={e=>setEdit(v=>v?{...v,repo_url:e.target.value||null}:v)}/></label></div><label>Cover image / media preview<input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" onChange={e=>{const f=e.target.files?.[0];if(f)uploadFile(f)}}/>{edit.cover_url&&<img className="admin-cover-preview" src={edit.cover_url} alt="Current project cover"/>}</label><label>Cover URL<input value={edit.cover_url||''} onChange={e=>setEdit(v=>v?{...v,cover_url:e.target.value||null}:v)}/></label><label>Video URL<input value={edit.video_url||''} onChange={e=>setEdit(v=>v?{...v,video_url:e.target.value||null}:v)}/></label><label>Sort order<input type="number" value={edit.sort_order} onChange={e=>setEdit(v=>v?{...v,sort_order:Number(e.target.value)}:v)}/></label><label className="check-label"><input type="checkbox" checked={edit.featured} onChange={e=>setEdit(v=>v?{...v,featured:e.target.checked}:v)}/> Featured project</label><label className="check-label"><input type="checkbox" checked={edit.published} onChange={e=>setEdit(v=>v?{...v,published:e.target.checked}:v)}/> Published publicly</label><button className="btn btn-primary btn-block" disabled={busy||!edit.slug||!edit.title.fa||!edit.title.en} onClick={saveProject}>{busy?<LoaderCircle className="spinning" size={18}/>:<Save size={18}/>} Save project</button></div></div></div>}</section>}
function AdminIdentity({lang}:{lang:Lang}){
 const [identity,setIdentity]=useState<{id:string,email:string}|null>(null);
 useEffect(()=>{supabase?.auth.getUser().then(r=>{
  const u=r.data.user;
  if(u?.id)setIdentity({id:u.id,email:u.email||''});
 })},[]);
 return identity?<div className="admin-notice" dir="ltr"><strong>{identity.email}</strong><p>User UUID: <code>{identity.id}</code></p><button className="btn btn-outline" onClick={()=>navigator.clipboard.writeText(identity.id)}>{lang==='fa'?'کپی شناسه':'Copy user ID'} <Copy size={14}/></button></div>:null;
}

function App(){
 const [lang,setLang]=useState<Lang>(()=>{const match=location.pathname.match(/^\/(fa|en)(\/|$)/);return match?.[1]==='en'?'en':match?.[1]==='fa'?'fa':localStorage.getItem('mrhossein-lang')==='en'?'en':'fa'});
 const [available,setAvailable]=useState<Localized>({fa:labels.fa.availability,en:labels.en.availability});
 const [publicProjects,setPublicProjects]=useState<Project[]>([]);
 const [cms,setCms]=useState<CmsSnapshot>({entries:defaultCMS,initialized:false,error:null});
 const isAdminRoute=location.pathname.startsWith('/admin');
 useEffect(()=>{document.documentElement.lang=lang;document.documentElement.dir=lang==='fa'?'rtl':'ltr';localStorage.setItem('mrhossein-lang',lang);
  if(!isAdminRoute&&/^(\/|\/(fa|en)\/?)$/.test(location.pathname))history.replaceState({},'','/'+lang+'/'+location.hash);
  document.title=lang==='fa'?'Mr.HoSSein | توسعه‌دهنده فول‌استک و هوش مصنوعی':'Mr.HoSSein | Full-Stack Developer · AI Engineer';
 },[lang,isAdminRoute]);
 const refreshContent=()=>{loadProjects().then(setPublicProjects).catch(()=>{});getCMS().then(setCms).catch(()=>{})};
 useEffect(()=>{refreshContent();loadSetting('availability').then(a=>{if(a&&typeof a==='object'&&'fa' in a&&'en' in a)setAvailable(a as Localized)}).catch(()=>{})},[]);
 const projectSlug=location.pathname.match(/^\/project\/([a-z0-9-]+)\/?$/)?.[1];
 const pageSlug=location.pathname.match(/^\/(?:fa\/|en\/)?page\/([a-z0-9-]+)\/?$/)?.[1];
 if(projectSlug){
  const p=publicProjects.find(x=>x.slug===projectSlug);
  return <main className="app-shell detail-view"><a className="detail-back" href={'/'+lang+'/'}>← {lang==='fa'?'بازگشت به سایت':'Back to site'}</a><article className="detail-sheet">
  {p?<><small>{lang==='fa'?'نمونه‌کار':'Case study'}</small><h1>{p.title[lang]}</h1><p className="detail-status">{statusLabels[p.status][lang]}</p>
   {safeUrl(p.cover_url,true)&&<img className="detail-cover" src={safeUrl(p.cover_url,true)} alt={p.title[lang]}/>}
   <p>{p.summary[lang]}</p><p>{p.body[lang]}</p><p>{p.role[lang]}</p><div className="detail-tech">{p.stack.map(t=><span key={t}>{t}</span>)}</div>
   <div className="detail-links">{safeUrl(p.demo_url)&&<a href={safeUrl(p.demo_url)} target="_blank" rel="noopener noreferrer">Live demo ↗</a>}{safeUrl(p.repo_url)&&<a href={safeUrl(p.repo_url)} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}</div>
   </>:<h1>{lang==='fa'?'پروژه یافت نشد':'Project not found'}</h1>}
  </article></main>;
 }
 if(pageSlug){
  const page=entryOf(cms.entries,'page',pageSlug);
  return <main className="app-shell detail-view"><a className="detail-back" href={'/'+lang+'/'}>← {lang==='fa'?'بازگشت به سایت':'Back to site'}</a><article className="detail-sheet">
  {page?<><h1>{page.title[lang]}</h1><p>{page.description[lang]}</p>
  {safeUrl(page.image_url,true)&&<img className="detail-cover" src={safeUrl(page.image_url,true)} alt={page.title[lang]}/>}
  <p>{page.body[lang]}</p>{safeUrl(page.link_url)&&<a className="contact-button" href={safeUrl(page.link_url)} target="_blank" rel="noopener noreferrer">{lang==='fa'?'اطلاعات بیشتر':'Learn more'} ↗</a>}</>:<h1>{lang==='fa'?'صفحه یافت نشد':'Page not found'}</h1>}
  </article></main>;
 }
 if(isAdminRoute)return <main className="app-shell admin-view"><div className="admin-return"><a href={'/'+lang+'/'}>← {lang==='fa'?'بازگشت به سایت':'Back to site'}</a><button className="lang-toggle" onClick={()=>setLang(lang==='fa'?'en':'fa')}>{lang==='fa'?'EN':'FA'}</button></div><Admin lang={lang} onRefresh={refreshContent}/></main>;
 return <main className="app-shell">{entriesOf(cms.entries,'section').map(section=>{
  switch(section.slug){
   case 'home':return <HeroSection key="home" lang={lang} setLang={setLang} available={available} entries={cms.entries}/>;
   case 'work':return <MarqueeSection key="work" entries={cms.entries}/>;
   case 'about':return <AboutSection key="about" lang={lang} entries={cms.entries}/>;
   case 'services':return <ServicesSection key="services" lang={lang} entries={cms.entries}/>;
   case 'projects':return <ProjectsSection key="projects" lang={lang} dbProjects={publicProjects} entries={cms.entries} initialized={cms.initialized}/>;
   case 'contact':return <ContactSection key="contact" lang={lang} entries={cms.entries}/>;
   default:return null;
  }
 })}</main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
