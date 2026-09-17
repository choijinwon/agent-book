import records from '../data/discovery.json' with {type:'json'};
import type {Book} from './books.ts';
import type {JournalEntry} from './reading-journal.ts';
export const shelfThemes=['wood','white','night'] as const;
export type ShelfTheme=typeof shelfThemes[number];
export function readShelfTheme(raw:string|null):ShelfTheme{return shelfThemes.includes(raw as ShelfTheme)?raw as ShelfTheme:'wood';}
export function shelfBook(entry:JournalEntry,books:Book[]=records as Book[]):Book|null{
 const isbn=books.find(b=>b.isbn===entry.id);if(isbn)return isbn;
 const matches=books.filter(b=>b.title===entry.title&&b.author===entry.author&&entry.author.trim());
 return matches.length===1?matches[0]:null;
}
export function spineTone(id:string){return [...id].reduce((sum,c)=>sum+c.charCodeAt(0),0)%6;}
