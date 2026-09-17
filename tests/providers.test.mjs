import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog, aladinBook, naverBook } from '../lib/providers.ts';
const keys={ALADIN_TTB_KEY:'test-only',NAVER_CLIENT_ID:'test-only',NAVER_CLIENT_SECRET:'test-only'};
test('missing keys gives explicit unconfigured response, never demo',async()=>{
 await assert.rejects(loadCatalog({},'소설'),e=>e.status===503);
 await assert.rejects(loadCatalog({NAVER_CLIENT_ID:'test',NAVER_CLIENT_SECRET:'test'},'',true),e=>e.status===503);
});
test('partial failure preserves valid books and reports unavailable source',async t=>{
 t.mock.method(globalThis,'fetch',async url=>{
  if(url.hostname==='www.aladin.co.kr')throw new Error('test failure');
  return Response.json({items:[{title:'<b>책</b>',isbn:'9788936434120',discount:'9000',link:'https://example.com/book'}]});
 });
 const data=await loadCatalog(keys,'소설');assert.equal(data.books.length,1);assert.equal(data.source,'네이버');assert.equal(data.warnings.length,1);assert.equal(data.demo,false);assert.equal(data.books[0].title,'책');
});
test('total upstream failure becomes safe error without key disclosure',async t=>{
 t.mock.method(globalThis,'fetch',async()=>Response.json({errorCode:'invalid key',errorMessage:'test-only'},{status:401}));
 await assert.rejects(loadCatalog(keys,'책'),e=>e.status===502&&!e.message.includes('test-only'));
});
test('trend request uses domestic Bestseller API and preserves ranks',async t=>{
 t.mock.method(globalThis,'fetch',async url=>{
  assert.equal(url.pathname,'/ttb/api/ItemList.aspx');assert.equal(url.searchParams.get('SearchTarget'),'Book');assert.equal(url.searchParams.get('QueryType'),'Bestseller');
  return Response.json({item:[{itemId:1,title:'책',isbn13:'9788936434120',priceSales:10000,bestRank:3}]});
 });
 const result=await loadCatalog(keys,'',true);assert.equal(result.books[0].rank,3);assert.equal(result.books[0].offers[0].shipping,null);
});
test('normalizers keep aggregate prices distinct, stock flags and unknown shipping',()=>{
 assert.equal(naverBook({discount:'10000'}).offers[0].kind,'aggregate');
 assert.equal(aladinBook({priceSales:10000,stockStatus:'품절'}).offers[0].available,false);
 assert.equal(aladinBook({priceSales:10000,link:'javascript:alert(1)'}).offers[0].url,'');
 assert.equal(aladinBook({priceSales:10000}).offers[0].shipping,null);
});
