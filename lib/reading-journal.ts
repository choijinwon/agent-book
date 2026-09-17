import {z} from 'zod';
export const journalKey='agent-book-reading-journal-v1';
export const readingStatuses=['want','reading','done'] as const;
export const statusLabels={want:'읽고 싶은 책',reading:'읽는 중',done:'다 읽은 책'};
const entrySchema=z.object({id:z.string().min(1).max(100),title:z.string().trim().min(1).max(200),author:z.string().max(200),status:z.enum(readingStatuses),rating:z.number().int().min(0).max(5),note:z.string().max(1000),updatedAt:z.string().datetime(),currentPage:z.number().int().min(0).max(100000).optional(),totalPages:z.number().int().min(1).max(100000).optional(),completedOn:z.string().date().optional()}).strict().refine(e=>e.totalPages===undefined||(e.currentPage??0)<=e.totalPages,{message:'읽은 페이지는 전체 페이지를 넘을 수 없습니다.'});
export type JournalEntry=z.infer<typeof entrySchema>;
export function readJournal(raw:string|null):JournalEntry[]{
 try{const parsed:unknown=JSON.parse(raw||'[]');if(!Array.isArray(parsed))return [];const ids=new Set<string>();return parsed.slice(0,500).flatMap(row=>{const result=entrySchema.safeParse(row);if(!result.success||ids.has(result.data.id))return [];ids.add(result.data.id);return [result.data];}).slice(0,100);}catch{return [];}
}
export function saveJournalEntry(entries:JournalEntry[],input:JournalEntry):JournalEntry[]{
 const entry=entrySchema.parse(input);if(!entries.some(e=>e.id===entry.id)&&entries.length>=100)throw new Error('최대 100권까지 저장할 수 있습니다. 기존 기록을 정리해 주세요.');
 return entries.some(e=>e.id===entry.id)?entries.map(e=>e.id===entry.id?entry:e):[entry,...entries];
}

export function localReadingDate(now=new Date()):string{return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;}
export function readingProgress(entry:JournalEntry):number|null{return entry.totalPages?Math.min(100,Math.round((entry.currentPage??0)/entry.totalPages*100)):null;}
export function completedInYear(entries:JournalEntry[],year:number):number{return entries.filter(e=>e.status==='done'&&e.completedOn?.startsWith(`${year}-`)).length;}
export const readingGoalsKey='agent-book-reading-goals-v1';
export function readReadingGoals(raw:string|null):Record<string,number>{try{const v:unknown=JSON.parse(raw||'{}');if(!v||typeof v!=='object'||Array.isArray(v))return {};return Object.fromEntries(Object.entries(v).filter(([year,n])=>/^\d{4}$/.test(year)&&Number.isInteger(n)&&n>=1&&n<=100));}catch{return {};}}
