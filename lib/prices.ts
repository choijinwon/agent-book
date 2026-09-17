import {normalizeIsbn,safeUrl,type Book} from './books.ts';
type Row=Record<string,unknown>;
const asRow=(v:unknown):Row=>v&&typeof v==='object'?v as Row:{};
const text=(v:unknown)=>typeof v==='string'?v.replace(/<[^>]*>/g,'').slice(0,1000):'';
const name=(v:unknown):string=>Array.isArray(v)?v.map(name).filter(Boolean).join(', '):text(asRow(v).name)||text(v);
export function yes24Id(raw:string) {
 try{const u=new URL(raw);if(!['www.yes24.com','yes24.com'].includes(u.host)||u.username||u.password||!['https:','http:'].includes(u.protocol))return null;return /^\/product\/goods\/(\d+)\/?$/i.exec(u.pathname)?.[1]||null;}catch{return null;}
}
export function parseYes24(html:string,id:string,checkedAt:string):Book|null {
 for(const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
  let json:unknown;try{json=JSON.parse(m[1]);}catch{continue;}
  const entries=Array.isArray(json)?json:Array.isArray(asRow(json)['@graph'])?asRow(json)['@graph'] as unknown[]:[json];
  for(const entry of entries){const b=asRow(entry);const types=Array.isArray(b['@type'])?b['@type']:[b['@type']];
   if(!types.includes('Book')||String(b.sku)!==id)continue;
   // Never combine ebooks, used copies, unknown editions or aggregate offers.
   if(!['https://schema.org/Paperback','https://schema.org/Hardcover'].includes(String(b.bookFormat)))continue;
   const offer=asRow(b.offers),isbn=normalizeIsbn(text(b.isbn));
   if(!isbn||offer['@type']!=='Offer'||offer.priceCurrency!=='KRW'||offer.itemCondition!=='https://schema.org/NewCondition')continue;
   const price=Number(offer.price);if(!Number.isFinite(price)||price<=0)continue;
   const url=`https://www.yes24.com/product/goods/${id}`;
   const image=Array.isArray(b.image)?b.image[0]:b.image;
   return {id:`yes24-${id}`,isbn,title:text(b.name),author:name(b.author),publisher:name(b.publisher),category:Array.isArray(b.genre)?text(b.genre[0]):text(b.genre)||'도서',description:text(b.description),cover:safeUrl(typeof image==='string'?image:asRow(image).url),sourceUrl:url,offers:[{store:'YES24',price,shipping:null,url,kind:'seller',available:offer.availability==='https://schema.org/InStock',checkedAt}]};
  }
 }
 return null;
}
export function robotsAllowed(body:string,path:string) {
 const groups:{agents:string[];rules:{allow:boolean;path:string}[]}[]=[];let group={agents:[] as string[],rules:[] as {allow:boolean;path:string}[]};
 for(const raw of body.split(/\r?\n/)){const line=raw.split('#')[0].trim();const m=/^([^:]+):\s*(.*)$/.exec(line);if(!m)continue;const key=m[1].toLowerCase();if(key==='user-agent'){if(group.rules.length){groups.push(group);group={agents:[],rules:[]};}group.agents.push(m[2].toLowerCase());}else if(['allow','disallow'].includes(key)&&m[2])group.rules.push({allow:key==='allow',path:m[2]});}
 groups.push(group);const specific=groups.filter(g=>g.agents.some(a=>a!=='*'&&'agent-book'.includes(a)));const chosen=specific.length?specific:groups.filter(g=>g.agents.includes('*'));
 const matches=chosen.flatMap(g=>g.rules).filter(r=>{const escaped=r.path.replace(/[.+?^{}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*');try{return new RegExp('^'+escaped).test(path);}catch{return true;}}).sort((a,b)=>b.path.length-a.path.length||Number(b.allow)-Number(a.allow));return matches[0]?.allow??true;
}
const cache=new Map<string,{until:number;book:Book|null}>();let robots:{until:number;body:string}|undefined;
const agent='agent-book/1.0 (+https://agent-book-discovery.abyys9114.chatgpt.site)';
async function fetchSmall(url:string,limit:number) {
 const response=await fetch(url,{headers:{'User-Agent':agent},redirect:'error',signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw new Error('page_unavailable');
 const reader=response.body?.getReader();if(!reader)throw new Error('empty_page');let size=0;const decoder=new TextDecoder();let value='';
 try{while(true){const r=await reader.read();if(r.done)break;size+=r.value.byteLength;if(size>limit){await reader.cancel();throw new Error('page_too_large');}value+=decoder.decode(r.value,{stream:true});}return value+decoder.decode();}finally{reader.releaseLock();}
}
export async function enrichYes24(book:Book):Promise<Book> {
 const id=yes24Id(book.sourceUrl||'');if(!id)return book;
 const hit=cache.get(id);if(hit&&hit.until>Date.now())return hit.book||book;
 try{
  if(!robots||robots.until<Date.now())robots={until:Date.now()+86400_000,body:await fetchSmall('https://www.yes24.com/robots.txt',100_000)};
  const path=`/product/goods/${id}`;if(!robotsAllowed(robots.body,path))return book;
  const parsed=parseYes24(await fetchSmall(`https://www.yes24.com${path}`,2_000_000),id,new Date().toISOString());
  if(cache.size>=100)cache.delete(cache.keys().next().value!);
  cache.set(id,{until:Date.now()+(parsed?6*3600_000:10*60_000),book:parsed});return parsed||book;
 }catch{return book;}
}
export async function enrichPrices(books:Book[]) {
 const candidates=books.filter(b=>yes24Id(b.sourceUrl||'')).slice(0,4);const enriched=new Map<string,Book>();
 // At most two concurrent page requests, four products per search.
 for(let i=0;i<candidates.length;i+=2){const batch=candidates.slice(i,i+2);const results=await Promise.all(batch.map(enrichYes24));results.forEach((b,j)=>enriched.set(batch[j].id,b));}
 return books.map(b=>enriched.get(b.id)||b);
}
