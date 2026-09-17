import {z} from 'zod';
export const journalKey='agent-book-reading-journal-v1';
export const readingStatuses=['want','reading','done'] as const;
export const statusLabels={want:'읽고 싶은 책',reading:'읽는 중',done:'다 읽은 책'};
const entrySchema=z.object({id:z.string().min(1).max(100),title:z.string().trim().min(1).max(200),author:z.string().max(200),status:z.enum(readingStatuses),rating:z.number().int().min(0).max(5),note:z.string().max(1000),updatedAt:z.string().datetime()}).strict();
export type JournalEntry=z.infer<typeof entrySchema>;
export function readJournal(raw:string|null):JournalEntry[]{
 try{const parsed:unknown=JSON.parse(raw||'[]');if(!Array.isArray(parsed))return [];const ids=new Set<string>();return parsed.slice(0,500).flatMap(row=>{const result=entrySchema.safeParse(row);if(!result.success||ids.has(result.data.id))return [];ids.add(result.data.id);return [result.data];}).slice(0,100);}catch{return [];}
}
export function saveJournalEntry(entries:JournalEntry[],input:JournalEntry):JournalEntry[]{
 const entry=entrySchema.parse(input);if(!entries.some(e=>e.id===entry.id)&&entries.length>=100)throw new Error('최대 100권까지 저장할 수 있습니다. 기존 기록을 정리해 주세요.');
 return [entry,...entries.filter(e=>e.id!==entry.id)];
}
