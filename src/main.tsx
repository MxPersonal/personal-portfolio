import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {motion,useReducedMotion,useScroll,useTransform,type MotionValue} from 'framer-motion';
import {ArrowUpRight,ArrowDown,Asterisk} from 'lucide-react';
import './styles.css';

const colors=['#bb26b8','#9f65eb','#25b4a9','#d5684e','#b8bd45','#5579d9','#d77cb4','#5fc6e0','#d2a158','#8257bd','#76bb8f'];
const work=['space-voyage','codenest','vex-ventures','stellar-ai-v2','asme','transform-data','vitara','terra','skyelite','aethera','designpro','stellar-ai','xportfolio','orbit-web3','nexora','evr-ventures','planet-orbit','new-era','wealth','luminex','celestia'];
const services=[
 ['3D Modeling','Creation of detailed objects, characters, or environments tailored to specific client needs, ideal for games, products, and visualizations.'],
 ['Rendering','High-quality, photorealistic renders that showcase designs with custom lighting, textures, and materials to bring concepts to life.'],
 ['Motion Design','Dynamic animations and motion graphics that add energy and storytelling to brands, products, and digital experiences.'],
 ['Branding','Crafting cohesive visual identities, from logos to full brand systems, that communicate a clear and memorable presence.'],
 ['Web Design','Designing clean, modern, and conversion-focused websites with attention to layout, typography, and user experience.']
] as const;
const projects=[
 {name:'Nextlevel Studio',category:'Client',images:['7ef87a3970ec9470','4dcf01880019fcd4','8608958534535609']},
 {name:'Aura Brand Identity',category:'Personal',images:['84ca38f67bab52b8','c660aee10deeb5d5','6dba09776c805635']},
 {name:'Solaris Digital',category:'Client',images:['f401f0f92ed5fc95','195db01d0544b561','e47cabe03c916aab']}
] as const;
const asset=(name:string,ext='png')=>'https://media.promptsites.co/assets/'+name+'.'+ext;

function FadeIn({children,delay=0,x=0,y=30,duration=.7,className='',style}:{children:React.ReactNode,delay?:number,x?:number,y?:number,duration?:number,className?:string,style?:React.CSSProperties}){
 const reduced=useReducedMotion();
 return <motion.div className={className} style={style} initial={reduced?false:{opacity:0,x,y}} whileInView={{opacity:1,x:0,y:0}} viewport={{once:true,margin:'50px',amount:0}} transition={{delay:reduced?0:delay,duration:reduced?0:duration,ease:[.25,.1,.25,1]}}>{children}</motion.div>
}
function ContactButton(){return <a className="contact-button" href="#contact">Contact Me <ArrowUpRight size={19} strokeWidth={1.8}/></a>}
function Magnet({children}:{children:React.ReactNode}){
 const ref=useRef<HTMLDivElement>(null),[pos,setPos]=useState({x:0,y:0}),[active,setActive]=useState(false),reduced=useReducedMotion();
 useEffect(()=>{if(reduced)return;const handle=(e:PointerEvent)=>{if(e.pointerType==='touch'||!ref.current)return;const b=ref.current.getBoundingClientRect(),dx=e.clientX-(b.left+b.width/2),dy=e.clientY-(b.top+b.height/2),near=e.clientX>=b.left-150&&e.clientX<=b.right+150&&e.clientY>=b.top-150&&e.clientY<=b.bottom+150;setActive(near);setPos(near?{x:dx/3,y:dy/3}:{x:0,y:0})};window.addEventListener('pointermove',handle,{passive:true});return()=>window.removeEventListener('pointermove',handle)},[reduced]);
 return <div ref={ref} className="magnet" style={{transform:reduced?'none':'translate3d('+pos.x+'px,'+pos.y+'px,0)',transition:active?'transform .3s ease-out':'transform .6s ease-in-out'}}>{children}</div>
}
function HeroSection(){return <section className="hero" id="home">
 <FadeIn y={-20} className="nav-outer"><nav className="navbar" aria-label="Main navigation"><a href="#about">About</a><a href="#services">Price</a><a href="#projects">Projects</a><a href="#contact">Contact</a></nav></FadeIn>
 <FadeIn delay={.15} y={40} className="hero-title-wrap"><h1 className="hero-heading hero-title">Hi, i&apos;m jack</h1></FadeIn>
 <FadeIn delay={.6} y={30} className="portrait-wrap"><Magnet><img src={asset('30c9e391bb068b1f')} alt="3D portrait of Jack" fetchPriority="high"/></Magnet></FadeIn>
 <div className="hero-bottom"><FadeIn delay={.35} y={20} className="hero-intro">a 3d creator driven by crafting striking and unforgettable projects</FadeIn><FadeIn delay={.5} y={20}><ContactButton/></FadeIn></div>
 <a href="#work" className="scroll-cue" aria-label="Scroll to selected work"><ArrowDown size={16}/></a>
 </section>}
function WorkTile({name,index}:{name:string,index:number}){
 const [failed,setFailed]=useState(false);
 return <div className="work-tile" style={{'--tile-color':colors[index%colors.length]} as React.CSSProperties} aria-label={name.replaceAll('-',' ')}><div className="tile-decoration"/><div className="tile-orbit"/><div className="tile-wordmark">{name.replaceAll('-',' ')}</div>{!failed&&<img src={'/work/'+name+'.gif'} alt="" loading="lazy" onError={()=>setFailed(true)}/>}<span className="tile-index">{String(index+1).padStart(2,'0')} / 21</span></div>
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
 return <p className="about-description" ref={ref} aria-label={text}>{Array.from(text).map((char,i)=><Letter key={i} char={char} index={i} count={text.length} progress={scrollYProgress}/>)}</p>
}
function AboutSection(){
 const objects=[{src:'30c8e5b22d0bc5f5',pos:'moon',x:-80,delay:.1},{src:'4c2c70cdef4daef7',pos:'left-object',x:-80,delay:.25},{src:'a40d0959952fe770',pos:'lego',x:80,delay:.15},{src:'9c08bb4c916c4012',pos:'right-object',x:80,delay:.3}];
 return <section className="about-section" id="about">{objects.map(o=><FadeIn key={o.pos} x={o.x} y={0} duration={.9} delay={o.delay} className={'floating '+o.pos}><img src={asset(o.src)} alt="" loading="lazy"/></FadeIn>)}<div className="about-content"><FadeIn y={40}><h2 className="hero-heading massive-heading">About me</h2></FadeIn><AnimatedText text="With more than five years of experience in design, i focus on branding, web design, and user experience, i truly enjoy working with businesses that aim to stand out and present their best image. Let's build something incredible together!"/><FadeIn delay={.1} y={20}><ContactButton/></FadeIn></div></section>
}
function ServicesSection(){return <section className="services-section" id="services"><FadeIn><h2 className="massive-heading services-title">Services</h2></FadeIn><div className="services-list">{services.map(([title,desc],i)=><FadeIn key={title} delay={i*.1} y={30} className="service-item"><div className="service-number">{String(i+1).padStart(2,'0')}</div><div className="service-copy"><h3>{title}</h3><p>{desc}</p></div><ArrowUpRight size={22} className="service-arrow" strokeWidth={1.5}/></FadeIn>)}</div></section>}
function ProjectCard({item,index,total}:{item:typeof projects[number],index:number,total:number}){
 const ref=useRef<HTMLDivElement>(null),{scrollYProgress}=useScroll({target:ref,offset:['start end','end start']}),scale=useTransform(scrollYProgress,[0,.5,1],[1,1,1-(total-1-index)*.03]),img=(key:string)=>asset(key,'webp');
 return <div className="project-card-track" ref={ref}><motion.article className="project-card" style={{scale,top:'calc(var(--sticky-top) + '+index*28+'px)'}}><div className="project-top"><div className="project-number">{String(index+1).padStart(2,'0')}</div><div className="project-name"><span>{item.category} project</span><h3>{item.name}</h3></div><a href="#contact" className="live-project-button">Live Project <ArrowUpRight size={16}/></a></div><div className="project-images"><div className="project-img-small"><img src={img(item.images[0])} alt={item.name+' detail 1'} loading="lazy"/><img src={img(item.images[1])} alt={item.name+' detail 2'} loading="lazy"/></div><div className="project-img-large"><img src={img(item.images[2])} alt={item.name+' main visual'} loading="lazy"/></div></div></motion.article></div>
}
function ProjectsSection(){return <section className="projects-section" id="projects"><FadeIn className="project-heading-wrap"><div className="heading-eyebrow"><Asterisk size={19}/> Selected work / 2021 - 2026</div><h2 className="hero-heading massive-heading">Project</h2><p>A few worlds I've brought to life.</p></FadeIn><div className="project-stacks">{projects.map((item,i)=><ProjectCard key={item.name} item={item} index={i} total={projects.length}/>)}</div><footer id="contact" className="footer-contact"><span className="footer-kicker">GOT A PROJECT IN MIND?</span><a href="mailto:?subject=Let%27s%20create%20something%20together" className="footer-title">Let's talk <ArrowUpRight strokeWidth={1.4}/></a><div className="footer-bottom"><span>© {new Date().getFullYear()} Jack. All rights reserved.</span><a href="#home">Back to top ↑</a></div></footer></section>}
function App(){return <main className="app-shell"><HeroSection/><MarqueeSection/><AboutSection/><ServicesSection/><ProjectsSection/></main>}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
