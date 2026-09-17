import saved from '../data/prices.json' with {type:'json'};
import type {Book} from './books.ts';
import {yes24Id} from './prices.ts';
// Bounded, dated collection fallback. Never display prices older than seven days.
export function withSavedPrices(books:Book[],now=Date.now(),snapshot:Book[]=saved as Book[]):Book[]{
 const byId=new Map(snapshot.map(b=>[yes24Id(b.sourceUrl||''),b]));
 return books.map(book=>{
  if(book.offers.length)return book;
  const id=yes24Id(book.sourceUrl||'');if(!id)return book;
  const stored=byId.get(id);if(!stored)return book;
  const checked=Date.parse(stored.offers[0]?.checkedAt||'');
  return Number.isFinite(checked)&&checked<=now&&now-checked<=7*86400_000?stored:book;
 });
}
