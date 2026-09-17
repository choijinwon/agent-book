import saved from '../data/prices.json' with {type:'json'};
import {selections} from './automatic-recommendations.ts';
import type {Book} from './books.ts';
import type {Catalog} from './providers.ts';
export const koreanDay=(now=Date.now())=>new Date(now+9*3600000).toISOString().slice(0,10);
export type DailyPicks={day:string;period:string;fetchedAt:string;items:{book:Book;reason:string;topic:string;ratio:number}[];uncovered:string[]};
export function buildDailyPicks(catalog:Catalog,now=Date.now()):DailyPicks{
 const interest=catalog.interest;if(!interest)throw new Error('missing_interest');
 const groups=interest.series.flatMap(s=>{const points=s.data.filter(p=>p.period>=interest.startDate&&p.period<=interest.endDate&&Number.isFinite(p.ratio)&&p.ratio>=0&&p.ratio<=100).sort((a,b)=>a.period.localeCompare(b.period));return points.length?[{...s,latest:points.at(-1)!}]:[];});
 // Compare only observations from the same latest week; missing weeks are not zero.
 const period=groups.map(s=>s.latest.period).sort().at(-1);if(!period)throw new Error('missing_observations');
 const current=groups.filter(s=>s.latest.period===period&&s.latest.ratio>0).sort((a,b)=>b.latest.ratio-a.latest.ratio||a.title.localeCompare(b.title));
 const day=koreanDay(now);const dayNumber=Math.floor((now+9*3600000)/86400000);const uncovered:string[]=[];
 const ranked=current.flatMap(s=>{const tag=s.title==='경제 경영'?'경제':s.title;const pool=selections.filter(b=>b.tags.includes(tag));if(!pool.length){uncovered.push(s.title);return [];}
 const rotated=pool.map((_,i)=>pool[(dayNumber+i)%pool.length]);return [{topic:s.title,ratio:s.latest.ratio,pool:rotated}];});
 const items:DailyPicks['items']=[];
 // One book per ranked topic, then remaining candidates in that same topic order.
 for(let round=0;round<selections.length;round++)for(const group of ranked){const selection=group.pool[round];if(!selection)continue;const book=(saved as Book[]).find(b=>b.id===selection.id);if(!book)continue;items.push({book:{...book,offers:book.offers.filter(o=>{const checked=Date.parse(o.checkedAt||'');return checked<=now&&now-checked<=7*86400000;})},reason:selection.reason,topic:group.topic,ratio:group.ratio});}
 if(!items.length)throw new Error('no_covered_topics');
 return {day,period,fetchedAt:catalog.fetchedAt,items,uncovered};
}
