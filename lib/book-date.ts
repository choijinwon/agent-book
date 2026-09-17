import records from '../data/discovery.json' with {type:'json'};
import type {Book} from './books.ts';
const prompts=[
 {id:'yes24-99308021',question:'낯선 사람의 작은 친절이 당신의 하루를 바꿀 수 있을까요?',note:'평범한 일상과 사람 사이의 온기를 만나고 싶을 때.'},
 {id:'yes24-2312211',question:'우주를 바라보면 지금의 고민은 얼마나 달라질까요?',note:'일상에서 한 걸음 물러나 더 넓은 세계를 바라보고 싶을 때.'},
 {id:'yes24-119697570',question:'나와 다르게 느끼는 사람을 어디까지 이해할 수 있을까요?',note:'감정과 타인을 이해하는 일을 생각해 보고 싶을 때.'},
 {id:'yes24-176787',question:'남들이 정한 길 대신 나만의 기준을 따라갈 수 있을까요?',note:'성장과 자아, 삶의 방향을 고민하고 있을 때.'},
 {id:'yes24-13137546',question:'우리는 다른 사람의 상처를 어떻게 기억해야 할까요?',note:'역사의 상처를 문학으로 마주하고 싶을 때. 폭력과 상실을 다룹니다.'},
 {id:'yes24-103495056',question:'떠나보내지 않는 기억은 우리에게 어떤 의미일까요?',note:'기억과 상실을 천천히 들여다보고 싶을 때. 무거운 역사적 주제를 다룹니다.'},
];
export const bookDates=prompts.flatMap(p=>{const book=(records as Book[]).find(b=>b.id===p.id);return book?[{...p,book}]:[];});
export function dateRound(offset:number){const start=Math.max(0,Math.floor(offset))%bookDates.length;return Array.from({length:Math.min(3,bookDates.length)},(_,i)=>bookDates[(start+i)%bookDates.length]);}
export const dateStorageKey='agent-book-dates-v1';
export function readDateSaves(raw:string|null):string[]{
 try{const value=JSON.parse(raw||'[]');if(!Array.isArray(value))return [];const allowed=new Set(bookDates.map(d=>d.book.isbn));return [...new Set(value.filter((v):v is string=>typeof v==='string'&&allowed.has(v)))].slice(0,bookDates.length);}catch{return [];}
}
