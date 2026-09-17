import { type Book, mergeBooks, normalizeIsbn, safeUrl } from './books.ts';
export type Keys = { ALADIN_TTB_KEY?: string; NAVER_CLIENT_ID?: string; NAVER_CLIENT_SECRET?: string };
export type Catalog = { books: Book[]; source: string; fetchedAt: string; warnings: string[]; demo: boolean };
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
export function naverBook(item: Raw): Book {
  const isbn=normalizeIsbn(String(item.isbn??''));const price=positive(item.discount);
  return {id:`naver-${isbn||String(item.link)}`,isbn,title:clean(item.title),author:clean(item.author),publisher:clean(item.publisher),category:'기타',description:clean(item.description),cover:safeUrl(item.image),offers:[{store:'네이버 도서 가격 정보',price,shipping:null,url:safeUrl(item.link),kind:'aggregate',available:price>0}]};
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
 const url=new URL('https://openapi.naver.com/v1/search/book.json');url.search=new URLSearchParams({query,display:'30',sort:'sim'}).toString();
 const body=await request(url,{'X-Naver-Client-Id':keys.NAVER_CLIENT_ID!,'X-Naver-Client-Secret':keys.NAVER_CLIENT_SECRET!});
 if(!Array.isArray(body.items)) throw new Error('invalid_catalog');
 return (body.items as Raw[]).map(naverBook);
}
export class CatalogError extends Error { status:number; constructor(status:number,message:string){super(message);this.status=status;} }
export async function loadCatalog(keys:Keys,query:string,trends=false):Promise<Catalog> {
 const tasks: {name:string;run:Promise<Book[]>}[]=[];
 if(keys.ALADIN_TTB_KEY) tasks.push({name:'알라딘',run:aladin(keys,query,trends)});
 if(!trends&&keys.NAVER_CLIENT_ID&&keys.NAVER_CLIENT_SECRET) tasks.push({name:'네이버',run:naver(keys,query)});
 if(!tasks.length) throw new CatalogError(503,trends?'알라딘 연결 후 실제 베스트셀러를 볼 수 있습니다.':'도서 서비스 연결 전입니다. 예시 모드 또는 서점 직접 검색을 이용하세요.');
 const results=await Promise.allSettled(tasks.map(t=>t.run));
 const sources:string[]=[];const warnings:string[]=[];const groups:Book[][]=[];
 results.forEach((result,i)=>{if(result.status==='fulfilled'){sources.push(tasks[i].name);groups.push(result.value);}else warnings.push(`${tasks[i].name} 응답을 받지 못했습니다. 잠시 후 다시 시도하세요.`);});
 if(!groups.length) throw new CatalogError(502,'도서 정보를 불러오지 못했습니다. 잠시 후 다시 시도하세요.');
 return {books:mergeBooks(groups),source:sources.join(' · '),fetchedAt:new Date().toISOString(),warnings,demo:false};
}
