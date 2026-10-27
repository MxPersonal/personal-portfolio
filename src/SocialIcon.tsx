import type {ReactNode} from 'react';
import {FaGithub,FaLinkedinIn,FaTelegram,FaInstagram,FaYoutube,FaDiscord} from 'react-icons/fa6';
import {Link2} from 'lucide-react';

type SocialIconProps={slug:string;name:string;url:string};

// Authentic, full-color assets. Eitaa is bundled locally so it never depends on an external CDN.
// Rubika uses the illustrated 2024 Rubika icon, not a generic messenger glyph.
const BRAND_IMAGES={
 eitaa:'/icons/eitaa.svg',
 rubika:'https://upload.wikimedia.org/wikipedia/commons/c/c0/Rubika_new_icon.png'
} as const;

export function SocialIcon({slug,name,url}:SocialIconProps){
 const key=(slug+' '+name+' '+url).toLowerCase();
 let icon:ReactNode;
 let platform='other';
 if(/github/.test(key)){icon=<FaGithub/>;platform='github'}
 else if(/linkedin/.test(key)){icon=<FaLinkedinIn/>;platform='linkedin'}
 else if(/telegram|t\.me/.test(key)){icon=<FaTelegram/>;platform='telegram'}
 else if(/instagram/.test(key)){icon=<FaInstagram/>;platform='instagram'}
 else if(/youtube|youtu\.be/.test(key)){icon=<FaYoutube/>;platform='youtube'}
 else if(/discord/.test(key)){icon=<FaDiscord/>;platform='discord'}
 else if(/eitaa/.test(key)){
  icon=<img className="social-brand-image" src={BRAND_IMAGES.eitaa} alt="" width="28" height="28" loading="lazy" decoding="async"/>;
  platform='eitaa';
 }else if(/rubika/.test(key)){
  icon=<img className="social-brand-image social-brand-rubika-image" src={BRAND_IMAGES.rubika} alt="" width="29" height="29" loading="lazy" decoding="async"/>;
  platform='rubika';
 }else{icon=<Link2 strokeWidth={1.8}/>}
 return <span className={'social-brand-mark social-brand-'+platform} aria-hidden="true">{icon}</span>;
}
