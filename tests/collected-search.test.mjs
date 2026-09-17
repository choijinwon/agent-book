import test from 'node:test';
import assert from 'node:assert/strict';
import {searchCollected,browseCollected} from '../lib/collected-search.ts';
test('finds real collected books by unspaced title, author and hyphenated ISBN',()=>{
 assert.ok(searchCollected('불편한편의점').some(b=>b.title==='불편한 편의점'));
 assert.ok(searchCollected('한강').some(b=>b.author.includes('한강')));
 assert.ok(searchCollected('978-8936434120').some(b=>b.isbn==='9788936434120'));
});
test('does not invent unknown books and removes expired or future prices',()=>{
 assert.deepEqual(searchCollected('zzzzunfindable98765'),[]);assert.deepEqual(searchCollected('!!!'),[]);
 const book={id:'a',isbn:'',title:'검증 도서',author:'저자',publisher:'',category:'',description:'',offers:[{price:100,checkedAt:'2020-01-01'},{price:200,checkedAt:'2099-01-01'}]};
 assert.equal(searchCollected('검증',[book],Date.parse('2026-09-17'))[0].offers.length,0);
});

test('browse provides actual records without search input and strips stale prices',()=>{const books=browseCollected(Date.parse('2090-01-01'));assert.equal(books.length,112);assert.ok(books.every(b=>b.isbn&&b.offers.length===0));});
