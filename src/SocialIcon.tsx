import type {ReactNode} from 'react';
import {FaGithub,FaLinkedinIn,FaTelegram,FaInstagram,FaYoutube,FaDiscord} from 'react-icons/fa6';
import {MessageCircle,Send,Link2} from 'lucide-react';

type SocialIconProps={slug:string;name:string;url:string};
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
 else if(/eitaa/.test(key)){icon=<Send strokeWidth={1.8}/>;platform='eitaa'}
 else if(/rubika/.test(key)){icon=<MessageCircle strokeWidth={1.8}/>;platform='rubika'}
 else icon=<Link2 strokeWidth={1.8}/>;
 return <span className={'social-brand-mark social-brand-'+platform} aria-hidden="true">{icon}</span>;
}
