import records from '../data/discovery.json' with {type:'json'};
import type {Book} from './books.ts';

const normalize=(value:string)=>value.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
export const collectedCount=records.length;
export function searchCollected(query:string, books:Book[]=records as Book[], now=Date.now()):Book[]{
 const compact=normalize(query);if(!compact)return [];
 const terms=query.normalize('NFKC').trim().split(/\s+/).map(normalize).filter(Boolean);
 const seen=new Set<string>();
 return books.map(book=>{
  const title=normalize(book.title),author=normalize(book.author),isbn=normalize(book.isbn);
  const text=normalize(`${book.title} ${book.author} ${book.publisher} ${book.category} ${book.description}`);
  const score=isbn===compact?100:title===compact?90:title.includes(compact)?70:author.includes(compact)?60:terms.every(t=>text.includes(t))?20:0;
  return {book,score};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.book.title.localeCompare(b.book.title,'ko')).filter(({book})=>{
  const id=book.isbn||book.id;if(seen.has(id))return false;seen.add(id);return true;
 }).slice(0,30).map(({book})=>({...book,offers:book.offers.filter(offer=>{
  const checked=Date.parse(offer.checkedAt||'');return checked<=now&&now-checked<=7*86400_000;
 })}));
}

export function browseCollected(now=Date.now()):Book[]{
 return (records as Book[]).map(book=>({...book,offers:book.offers.filter(o=>{const checked=Date.parse(o.checkedAt||'');return checked<=now&&now-checked<=7*86400_000;})}));
}
