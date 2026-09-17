import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import records from '@/data/discovery.json';
import {siteUrl,jsonLd} from '@/lib/seo';
import {safeUrl} from '@/lib/books';
import {BookMusic} from '@/components/book-music';
import type {Book} from '@/lib/books';
const books=records as Book[];
export const dynamicParams=false;
export function generateStaticParams(){return books.map(b=>({isbn:b.isbn}));}
async function find(params:Promise<{isbn:string}>){const {isbn}=await params;const book=books.find(b=>b.isbn===isbn);if(!book)notFound();return book;}
export async function generateMetadata({params}:{params:Promise<{isbn:string}>}):Promise<Metadata>{const b=await find(params);return {title:`${b.title} · ${b.author}`,description:`${b.title} — ${b.author}, ${b.publisher}. ${b.description.slice(0,110)}`,alternates:{canonical:`/books/${b.isbn}`},openGraph:{title:`${b.title} | agentbook`,description:b.description.slice(0,150),url:`/books/${b.isbn}`,...(b.cover?{images:[{url:b.cover,alt:`${b.title} 표지`}]}:{})}};}
export default async function BookPage({params}:{params:Promise<{isbn:string}>}){const b=await find(params);return <main className="shell catalog-page"><nav aria-label="경로"><Link href="/">agentbook 홈</Link> / <Link href="/books">도서 목록</Link></nav><article className="book-profile"><div>{b.cover&&<img src={safeUrl(b.cover)} alt={`${b.title} 표지`} width="180" height="270"/>}</div><div><span className="category">{b.category}</span><h1>{b.title}</h1><p>{b.author} · {b.publisher}</p><p className="help">ISBN {b.isbn}</p><h2>책 소개</h2><p className="book-introduction">{b.description}</p><p className="help">서점 공개 상품 소개에서 수집한 발췌입니다. 전체 소개와 현재 판매가는 원문에서 확인하세요.</p><a className="text-button" href={safeUrl(b.sourceUrl)} target="_blank" rel="noreferrer">서점에서 소개·판매가 확인 ↗</a><BookMusic book={b}/><p><Link href="/">다른 추천 책 찾아보기 →</Link></p></div></article><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({'@context':'https://schema.org','@type':'Book',name:b.title,isbn:b.isbn,author:{'@type':'Person',name:b.author},publisher:{'@type':'Organization',name:b.publisher},description:b.description,inLanguage:'ko',url:`${siteUrl}/books/${b.isbn}`,image:b.cover})}}/></main>}
