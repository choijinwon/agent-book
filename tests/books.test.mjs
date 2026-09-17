import test from 'node:test';
import assert from 'node:assert/strict';
import { bestOffer, mergeBooks, normalizeIsbn, safeUrl, demoBooks } from '../lib/books.ts';
const offer = (store,price,shipping,kind='seller',available=true)=>({store,price,shipping,kind,available,url:''});
test('ranks shipping-inclusive totals, retains ties and excludes unknown/aggregate/unavailable',()=>{
 const rows=[offer('cheap sticker',10000,4000),offer('best',12000,0),offer('unknown',9000,null),offer('aggregate',100,0,'aggregate'),offer('unavailable',1,0,'seller',false)];
 assert.equal(bestOffer(rows).store,'best');assert.equal(bestOffer(rows).total,12000);
 assert.equal(bestOffer([offer('unknown',9000,null)]),undefined);
 assert.equal(bestOffer([offer('invalid',0,0)]),undefined);
 assert.equal(bestOffer([offer('negative shipping',100,-1),offer('infinity',Infinity,0)]),undefined);
});
test('valid ISBN13 is canonical; invalid and ISBN10 remain unmerged',()=>{
 assert.equal(normalizeIsbn('8936434128 9788936434120'),'9788936434120');
 assert.equal(normalizeIsbn('978-89-364-3412-0'),'9788936434120');
 assert.equal(normalizeIsbn('9788936434121'),'');
});
test('merge only same ISBN and do not mutate input',()=>{
 const a={...demoBooks[0],id:'a',isbn:'9788936434120',offers:[offer('A',10000,null)]};
 const b={...a,id:'b',offers:[offer('B',12000,null)]};
 const other={...a,id:'c',isbn:'9788936433598'};
 const merged=mergeBooks([[a],[b,other]]);
 assert.equal(merged.length,2);assert.equal(merged[0].offers.length,2);assert.equal(a.offers.length,1);
 assert.equal(mergeBooks([[{...a,isbn:''}],[{...b,isbn:''}]]).length,2);
});
test('URLs cannot run scripts or navigate local file schemes',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,hi','file:///etc/passwd','bad'])assert.equal(safeUrl(url),'');
 assert.equal(safeUrl('https://www.aladin.co.kr/'),'https://www.aladin.co.kr/');
});
