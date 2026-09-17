import {withSavedPrices} from './saved-prices.ts';
import {enrichPrices} from './prices.ts';
import { type Book, mergeBooks, normalizeIsbn, safeUrl } from './books.ts';
export type Keys = { ALADIN_TTB_KEY?: string; NAVER_CLIENT_ID?: string; NAVER_CLIENT_SECRET?: string };
export type Catalog = { books: Book[]; source: string; fetchedAt: string; warnings: string[]; demo: boolean; interest?: { startDate:string; endDate:string; series:{title:string; keyword:string; data:{period:string;ratio:number}[]}[] } };
type Raw = Record<string, unknown>;
const clean = (v: unknown) => String(v ?? '').replace(/<[^>]*>/g, '').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const positive = (v: unknown) => Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : 0;
async function request(url: URL, headers?: Record<string,string>) {
  const response = await fetch(url, {headers, signal: AbortSignal.timeout(8000)});
  if (!response.ok) throw new Error('provider_unavailable');
  const body = await response.json() as Raw;
  if (body.errorCode || body.error || body.errorMessage) throw new Error('provider_rejected');
  return body;
}
export function aladinBook(item: Raw): Book {
  const isbn = normalizeIsbn(String(item.isbn13 ?? item.isbn ?? ''));
  const price = positive(item.priceSales);
  return {id:`aladin-${item.itemId || isbn || item.link || `${clean(item.title)}-${clean(item.author)}`}`,isbn,title:clean(item.title),author:clean(item.author),publisher:clean(item.publisher),category:clean(item.categoryName).split('>')[1] || '기타',description:clean(item.description),cover:safeUrl(item.cover),rank:positive(item.bestRank)||undefined,offers:[{store:'알라딘',price,shipping:null,url:safeUrl(item.link),kind:'seller',available:price>0 && !String(item.stockStatus ?? '').match(/품절|절판|판매중지/)}]};
}
export function naverBook(item: Raw): Book | null {
 const link=safeUrl(item.link);if(!link)return null;
 const u=new URL(link);let store='';
 if((u.hostname==='yes24.com'||u.hostname.endsWith('.yes24.com')) && /^\/Product\/Goods\/\d+/i.test(u.pathname))store='YES24';
 if(u.hostname==='product.kyobobook.co.kr' && /^\/detail\//i.test(u.pathname))store='교보문고';
 if((u.hostname==='aladin.co.kr'||u.hostname.endsWith('.aladin.co.kr')) && /^\/shop\/wproduct.aspx$/i.test(u.pathname))store='알라딘';
 if(!store)return null;
 return {id:`web-${link}`,isbn:'',title:clean(item.title),author:'',publisher:store,category:'서점 상품 페이지',description:clean(item.description),sourceUrl:link,offers:[]};
}
async function aladin(keys: Keys, query: string, trends: boolean): Promise<Book[]> {
  const url=new URL(`https://www.aladin.co.kr/ttb/api/${trends?'ItemList':'ItemSearch'}.aspx`);
  const params: Record<string,string>={ttbkey:keys.ALADIN_TTB_KEY!,output:'js',Version:'20131101',SearchTarget:'Book',MaxResults:'30',Start:'1',Cover:'Big'};
  if(trends) params.QueryType='Bestseller'; else {params.Query=query;params.QueryType='Keyword';}
  url.search=new URLSearchParams(params).toString();
  const body=await request(url);
  if(!Array.isArray(body.item)) throw new Error('invalid_catalog');
  return (body.item as Raw[]).map((item,index)=>({...aladinBook(item),...(trends?{rank:positive(item.bestRank)||index+1}:{})}));
}
async function naver(keys:Keys,query:string):Promise<Book[]> {
 const queries=['교보문고','YES24','알라딘'];
 const results=await Promise.allSettled(queries.map(async store=>{
  const url=new URL('https://openapi.naver.com/v1/search/webkr.json');url.search=new URLSearchParams({query:query+' '+store,display:'30'}).toString();
  const body=await request(url,{'X-Naver-Client-Id':keys.NAVER_CLIENT_ID!,'X-Naver-Client-Secret':keys.NAVER_CLIENT_SECRET!});
  if(!Array.isArray(body.items)) throw new Error('invalid_catalog');
  return (body.items as Raw[]).map(naverBook).filter((b):b is Book=>b!==null);
 }));
 if(results.every(r=>r.status==='rejected'))throw new Error('web_search_unavailable');
 const terms=query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
 return [...new Map(results.flatMap(r=>r.status==='fulfilled'?r.value:[]).filter(b=>terms.every(t=>(b.title+' '+b.description).toLocaleLowerCase().includes(t))).map(b=>[b.id,b])).values()];
}
export async function naverInterest(keys:Keys, now=new Date()):Promise<Catalog> {
 // Four complete Monday–Sunday weeks, avoiding misleading partial-week drops.
 const end=new Date(now.getTime()+9*3600_000);end.setUTCHours(0,0,0,0);
 end.setUTCDate(end.getUTCDate()-((end.getUTCDay()+6)%7)-1);
 const start=new Date(end);start.setUTCDate(start.getUTCDate()-27);
 const startDate=start.toISOString().slice(0,10),endDate=end.toISOString().slice(0,10);
 const names=['소설','에세이','자기계발','경제 경영','과학'];
 const response=await fetch('https://openapi.naver.com/v1/datalab/search',{method:'POST',headers:{'Content-Type':'application/json','X-Naver-Client-Id':keys.NAVER_CLIENT_ID!,'X-Naver-Client-Secret':keys.NAVER_CLIENT_SECRET!},signal:AbortSignal.timeout(8000),body:JSON.stringify({startDate,endDate,timeUnit:'week',keywordGroups:names.map(n=>({groupName:n,keywords:[n+' 책 추천']}))})});
 if(!response.ok)throw new CatalogError(502,'네이버 검색어 트렌드를 불러오지 못했습니다. 데이터랩 권한과 연결 상태를 확인하세요.');
 const data=await response.json() as {results?:{title:string;keywords:string[];data:{period:string;ratio:number}[]}[]};
 if(!Array.isArray(data.results))throw new CatalogError(502,'트렌드 응답 형식이 올바르지 않습니다.');
 return {books:[],source:'네이버 데이터랩 · 검색어 트렌드',fetchedAt:new Date().toISOString(),warnings:[],demo:false,interest:{startDate,endDate,series:data.results.map(r=>({title:clean(r.title),keyword:clean(r.keywords[0]),data:r.data.filter(p=>Number.isFinite(Number(p.ratio))&&Number(p.ratio)>=0&&Number(p.ratio)<=100).map(p=>({period:p.period,ratio:Number(p.ratio)}))}))}};
}
export class CatalogError extends Error { status:number; constructor(status:number,message:string){super(message);this.status=status;} }
export async function loadCatalog(keys:Keys,query:string,trends=false):Promise<Catalog> {
 if(trends&&keys.NAVER_CLIENT_ID&&keys.NAVER_CLIENT_SECRET)return naverInterest(keys);
 const tasks: {name:string;run:Promise<Book[]>}[]=[];
 if(keys.ALADIN_TTB_KEY) tasks.push({name:'알라딘',run:aladin(keys,query,trends)});
 if(!trends&&keys.NAVER_CLIENT_ID&&keys.NAVER_CLIENT_SECRET) tasks.push({name:'네이버 웹 검색',run:naver(keys,query)});
 if(!tasks.length) throw new CatalogError(503,trends?'네이버 데이터랩 연결 후 실제 검색어 트렌드를 볼 수 있습니다.':'도서 서비스 연결 전입니다. 예시 모드 또는 서점 직접 검색을 이용하세요.');
 const results=await Promise.allSettled(tasks.map(t=>t.run));
 const sources:string[]=[];const warnings:string[]=[];const groups:Book[][]=[];
 results.forEach((result,i)=>{if(result.status==='fulfilled'){sources.push(tasks[i].name);groups.push(result.value);}else warnings.push(`${tasks[i].name} 응답을 받지 못했습니다. 잠시 후 다시 시도하세요.`);});
 if(!groups.length) throw new CatalogError(502,'도서 정보를 불러오지 못했습니다. 잠시 후 다시 시도하세요.');
 return {books:withSavedPrices(await enrichPrices(mergeBooks(groups))),source:sources.join(' · '),fetchedAt:new Date().toISOString(),warnings,demo:false};
}
