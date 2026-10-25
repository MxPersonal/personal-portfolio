import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {motion,useReducedMotion,useScroll,useTransform,type MotionValue} from 'framer-motion';
import {ArrowUpRight,ArrowDown,Asterisk} from 'lucide-react';
import './styles.css';

// Content-only personalization of the original template; visual section structure retained.
type Lang='fa'|'en';
const colors=['#bb26b8','#9f65eb','#25b4a9','#d5684e','#b8bd45','#5579d9','#d77cb4','#5fc6e0','#d2a158','#8257bd','#76bb8f'];
const work=['ASSEMBLY','C','C++','JAVASCRIPT','NEXT.JS','WEB APPS','FULL STACK','BACKEND','API','AI AGENTS','VIBE CODING','AUTOMATION','N8N','MAKE','ZAPIER','MCP','CHATBOTS','RAG','OLLAMA','COMFYUI','DOCKER'];
const dict={
 fa:{about:'درباره من',services:'خدمات',projects:'پروژه‌ها',contact:'ارتباط',cta:'ارتباط با من',heading:'پروژه‌ها',top:'بازگشت به بالا',talk:'صحبت کنیم',footer:'ایده‌ای برای همکاری داری؟',
 hero:'از یک ایده تا یک دنیای دیجیتال هوشمند؛ جایی که کدنویسی، خلاقیت و هوش مصنوعی به هم می‌رسند.',
 bio:'من Mr.HoSSein هستم؛ علاقه‌مند به توسعه فول‌استک، مهندسی هوش مصنوعی و ساخت سیستم‌های هوشمند. تمرکز من بر ترکیب برنامه‌نویسی، خلاقیت و اتوماسیون برای تبدیل ایده‌های پیچیده به محصولات دیجیتال کاربردی است.',
 intro:'منتخبی از پروژه‌های واقعی من که همچنان در حال توسعه و بهبود هستند.',
 notice:'تصاویر صرفاً متعلق به نمای بصری قالب اولیه هستند و اسکرین‌شات این پروژه نیستند.',group:'پروژه‌های منتخب',repo:'مخزن GitHub',discuss:'گفت‌وگو'},
 en:{about:'About',services:'Services',projects:'Projects',contact:'Contact',cta:'Contact Me',heading:'Project',top:'Back to top',talk:"Let's talk",footer:'GOT A PROJECT IN MIND?',
 hero:'Turning ambitious ideas into powerful digital products with code, AI, and automation.',
 bio:'I am Mr.HoSSein, passionate about full-stack development, AI engineering and intelligent systems. I combine programming, creativity and automation to turn complex ideas into practical digital products.',
 intro:'Selected real projects currently in development, accurately labelled.',notice:'Original template visuals only, not screenshots of this project.',group:'Selected projects',repo:'GitHub repo',discuss:'Discuss'}
} as const;
const services={
 fa:[['توسعه وب و فول‌استک','وب‌سایت، لندینگ‌پیج، وب‌اپلیکیشن، پنل مدیریت، فروشگاه اینترنتی، CMS، بک‌اند و API.'],['مهندسی هوش مصنوعی','عامل‌های هوش مصنوعی، چت‌بات و دستیار اختصاصی، سامانه‌های RAG و اتصال به داده‌ها.'],['اتوماسیون و MCP','n8n، Make و Zapier، ساخت MCP Server و یکپارچه‌سازی سرویس‌ها و APIها.'],['زیرساخت و AI محلی','راه‌اندازی مدل‌های محلی، Deployment و DevOps، اتوماسیون تولید تصویر و ویدیو.'],['اپلیکیشن موبایل و دسکتاپ','توسعه برنامه‌های موبایل و دسکتاپ با روش ترکیبی کدنویسی دستی و AI Agents.']],
 en:[['Full-Stack Development','Websites, landing pages, web apps, dashboards, e-commerce, CMS, backend and APIs.'],['AI Engineering','Custom AI agents, chatbots, assistants, RAG and knowledge systems.'],['Automation & MCP','n8n, Make and Zapier workflows, custom MCP servers and API integrations.'],['Infrastructure & Local AI','Local LLM setup, deployment, DevOps and AI media workflows.'],['Mobile & Desktop Apps','Mobile and desktop software with hybrid traditional and AI-assisted development.']]
} as const;
const projects=[
 {id:'site',names:{fa:'پورتفولیوی Mr.HoSSein',en:'Mr.HoSSein Portfolio'},states:{fa:'در حال توسعه',en:'Work in Progress'},images:['7ef87a3970ec9470','4dcf01880019fcd4','8608958534535609'],url:'https://github.com/MxPersonal/personal-portfolio'},
 {id:'safir',names:{fa:'چاپ سفیر هنر',en:'Safire Honar Print Center'},states:{fa:'پروژه در حال توسعه',en:'Work in Progress'},images:['84ca38f67bab52b8','c660aee10deeb5d5','6dba09776c805635'],url:'https://github.com/MxPersonal/safirehonarprintcenter'},
 {id:'noghlijan',names:{fa:'فروشگاه نقلی‌جان',en:'Noghlijan E-Commerce'},states:{fa:'پروژه در حال توسعه',en:'Work in Progress'},images:['f401f0f92ed5fc95','195db01d0544b561','e47cabe03c916aab'],url:'https://github.com/MxPersonal/noghlijan-x-mrhossein'}
] as const;
const socials=[
 ['GitHub','https://github.com/HosseinYazdanpanah'],['LinkedIn','https://www.linkedin.com/in/hossein-yazdanpanah-0206b93ab/'],['Telegram','https://t.me/Hosssein_0905'],['Instagram','https://www.instagram.com/hossein._.yzdnpnh/'],['YouTube','https://www.youtube.com/@HoSSeinYazdanpnh'],['Discord','https://discord.com/users/1241497971888230496'],['Eitaa','https://eitaa.com/HoSSeinyazdnpnh'],['Rubika','https://rubika.ir/hossein_yazdanpnh']
] as const;
const asset=(name:string,ext='png')=>'https://media.promptsites.co/assets/'+name+'.'+ext;

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
function HeroSection({lang,setLang}:{lang:Lang,setLang:(l:Lang)=>void}){return <section className="hero" id="home">
 <FadeIn y={-20} className="nav-outer"><nav className="navbar" aria-label="Main navigation"><a href="#about">{dict[lang].about}</a><a href="#services">{dict[lang].services}</a><a href="#projects">{dict[lang].projects}</a><span className="nav-tools"><a href="#contact">{dict[lang].contact}</a><button className="lang-toggle" type="button" onClick={()=>setLang(lang==='fa'?'en':'fa')} aria-label="Switch language">{lang==='fa'?'EN':'FA'}</button></span></nav></FadeIn>
 <FadeIn delay={.15} y={40} className="hero-title-wrap"><h1 className="hero-heading hero-title">Mr.HoSSein</h1></FadeIn>
 <FadeIn delay={.6} y={30} className="portrait-wrap"><Magnet><img src="/hero-character.webp" alt="Mr.HoSSein character portrait" fetchPriority="high"/></Magnet></FadeIn>
 <div className="hero-bottom"><FadeIn delay={.35} y={20} className="hero-intro"><span dir={lang==='fa'?'rtl':'ltr'}>{dict[lang].hero}</span></FadeIn><FadeIn delay={.5} y={20}><ContactButton lang={lang}/></FadeIn></div>
 <a href="#work" className="scroll-cue" aria-label="Scroll down"><ArrowDown size={16}/></a>
 </section>}
function WorkTile({name,index}:{name:string,index:number}){
 return <div className="work-tile" style={{'--tile-color':colors[index%colors.length]} as React.CSSProperties} aria-label={name}><div className="tile-decoration"/><div className="tile-orbit"/><div className="tile-wordmark">{name}</div><span className="tile-index">{String(index+1).padStart(2,'0')} / 21</span></div>
}
function MarqueeSection(){
 const target=useRef<HTMLElement>(null),[offset,setOffset]=useState(0),reduced=useReducedMotion();
 useEffect(()=>{if(reduced)return;let raf=0;const update=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const top=target.current?.getBoundingClientRect().top??0;setOffset((-top+window.innerHeight)*.3)})};update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);return()=>{cancelAnimationFrame(raf);window.removeEventListener('scroll',update);window.removeEventListener('resize',update)}},[reduced]);
 return <section className="work-section" id="work" ref={target} aria-label="Selected works"><div className="marquee-row" style={{transform:reduced?'none':'translate3d('+(((offset-200)%432)-432)+'px,0,0)'}}>{[...work.slice(0,11),...work.slice(0,11),...work.slice(0,11)].map((n,i)=><WorkTile key={'a'+i} name={n} index={i%11}/>)}</div><div className="marquee-row" style={{transform:reduced?'none':'translate3d('+(-((offset-200)%432)-650)+'px,0,0)'}}>{[...work.slice(11),...work.slice(11),...work.slice(11)].map((n,i)=><WorkTile key={'b'+i} name={n} index={i%10+11}/>)}</div></section>
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
function AboutSection({lang}:{lang:Lang}){
 const objects=[{src:'30c8e5b22d0bc5f5',pos:'moon',x:-80,delay:.1},{src:'4c2c70cdef4daef7',pos:'left-object',x:-80,delay:.25},{src:'a40d0959952fe770',pos:'lego',x:80,delay:.15},{src:'9c08bb4c916c4012',pos:'right-object',x:80,delay:.3}];
 return <section className="about-section" id="about">{objects.map(o=><FadeIn key={o.pos} x={o.x} y={0} duration={.9} delay={o.delay} className={'floating '+o.pos}><img src={asset(o.src)} alt="" loading="lazy"/></FadeIn>)}<div className="about-content"><FadeIn y={40}><h2 className="hero-heading massive-heading">{dict[lang].about}</h2></FadeIn><AnimatedText text={dict[lang].bio}/><FadeIn delay={.1} y={20}><ContactButton lang={lang}/></FadeIn></div></section>
}
function ServicesSection({lang}:{lang:Lang}){return <section className="services-section" id="services"><FadeIn><h2 className="massive-heading services-title">{dict[lang].services}</h2></FadeIn><div className="services-list">{services[lang].map(([title,desc],i)=><FadeIn key={title} delay={i*.1} y={30} className="service-item"><div className="service-number">{String(i+1).padStart(2,'0')}</div><div className="service-copy"><h3>{title}</h3><p>{desc}</p></div><ArrowUpRight size={22} className="service-arrow" strokeWidth={1.5}/></FadeIn>)}</div></section>}
function ProjectCard({item,index,total,lang}:{item:typeof projects[number],index:number,total:number,lang:Lang}){
 const ref=useRef<HTMLDivElement>(null),{scrollYProgress}=useScroll({target:ref,offset:['start end','end start']}),scale=useTransform(scrollYProgress,[0,.5,1],[1,1,1-(total-1-index)*.03]),img=(key:string)=>asset(key,'webp');
 return <div className="project-card-track" ref={ref}><motion.article className="project-card" style={{scale,top:'calc(var(--sticky-top) + '+index*28+'px)'}}><div className="project-top"><div className="project-number">{String(index+1).padStart(2,'0')}</div><div className="project-name"><span>{item.states[lang]}</span><h3>{item.names[lang]}</h3></div><a href={item.url||'#contact'} className="live-project-button" target={item.url?'_blank':undefined} rel={item.url?'noopener noreferrer':undefined}>{item.url?dict[lang].repo:dict[lang].discuss} <ArrowUpRight size={16}/></a></div><div className="project-images"><div className="project-img-small"><img src={img(item.images[0])} alt="" loading="lazy"/><img src={img(item.images[1])} alt="" loading="lazy"/></div><div className="project-img-large"><img src={img(item.images[2])} alt="" loading="lazy"/></div></div><p className="project-disclaimer">{dict[lang].notice}</p></motion.article></div>
}
function ProjectsSection({lang}:{lang:Lang}){return <section className="projects-section" id="projects"><FadeIn className="project-heading-wrap"><div className="heading-eyebrow"><Asterisk size={19}/> {dict[lang].group}</div><h2 className="hero-heading massive-heading">{dict[lang].heading}</h2><p>{dict[lang].intro}</p></FadeIn><div className="project-stacks">{projects.map((item,i)=><ProjectCard key={item.id} item={item} index={i} total={projects.length} lang={lang}/>)}</div><footer id="contact" className="footer-contact"><span className="footer-kicker">{dict[lang].footer}</span><a href="https://t.me/Hosssein_0905" target="_blank" rel="noopener noreferrer" className="footer-title">{dict[lang].talk} <ArrowUpRight strokeWidth={1.4}/></a><div className="footer-socials">{socials.map(([name,url])=><a key={name} href={url} target="_blank" rel="noopener noreferrer">{name}</a>)}</div><div className="footer-bottom"><span>© {new Date().getFullYear()} Mr.HoSSein. All rights reserved.</span><a href="#home">{dict[lang].top} ↑</a></div></footer></section>}
function App(){const [lang,setLang]=useState<Lang>('fa');useEffect(()=>{document.documentElement.lang=lang},[lang]);return <main className="app-shell"><HeroSection lang={lang} setLang={setLang}/><MarqueeSection/><AboutSection lang={lang}/><ServicesSection lang={lang}/><ProjectsSection lang={lang}/></main>}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
