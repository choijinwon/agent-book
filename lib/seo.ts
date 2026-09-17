import type {Metadata} from "next";
export const siteUrl='https://agent-bookai.netlify.app';
export const siteName='에이전트북 · Agent Book';
export const siteDescription='제목·저자·ISBN과 독서 상황으로 책을 찾아보세요. 도서 소개, 수집한 서점 가격, 독서 트렌드와 책에 어울리는 K-pop을 함께 살펴봅니다.';
export const jsonLd=(value:unknown)=>JSON.stringify(value).replace(/</g,'\\u003c');

export function pageMetadata(path:string,title:string,description:string):Metadata{return {title,description,alternates:{canonical:path},openGraph:{type:'website',locale:'ko_KR',siteName,title,description,url:path},twitter:{card:'summary',title,description}};}
export function breadcrumbJsonLd(items:{name:string;path:string}[]){return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{name:'에이전트북 홈',path:'/'},...items].map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,item:siteUrl+item.path}))};}
