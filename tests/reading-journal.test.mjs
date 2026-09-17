import test from 'node:test';import assert from 'node:assert/strict';
import {readJournal,saveJournalEntry} from '../lib/reading-journal.ts';
const entry={id:'isbn-1',title:'책',author:'저자',status:'reading',rating:4,note:'감상',updatedAt:'2026-09-17T00:00:00.000Z'};
test('journal loads valid entries and rejects malformed or unsupported saved data',()=>{assert.deepEqual(readJournal('{'),[]);assert.deepEqual(readJournal('{}'),[]);assert.deepEqual(readJournal(JSON.stringify([entry,{...entry,id:'bad',rating:9},entry])),[entry]);});
test('edits replace the same record without duplicating or dropping other books',()=>{const other={...entry,id:'other'};const next=saveJournalEntry([entry,other],{...entry,status:'done',note:'수정'});assert.equal(next.length,2);assert.equal(next[0].status,'done');assert.deepEqual(next[1],other);});
test('journal capacity permits edits but refuses to silently discard old records',()=>{const entries=Array.from({length:100},(_,i)=>({...entry,id:String(i)}));assert.throws(()=>saveJournalEntry(entries,{...entry,id:'new'}));assert.equal(saveJournalEntry(entries,{...entry,id:'0'}).length,100);assert.throws(()=>saveJournalEntry([],{...entry,note:'a'.repeat(1001)}));});
