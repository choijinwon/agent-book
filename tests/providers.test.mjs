import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog, aladinBook, naverBook, naverInterest } from '../lib/providers.ts';
const keys={ALADIN_TTB_KEY:'test-only',NAVER_CLIENT_ID:'test-only',NAVER_CLIENT_SECRET:'test-only'};
test('missing keys searches collected books while trends require connection',async()=>{
 const result=await loadCatalog({},'불편한편의점');assert.equal(result.demo,false);assert.ok(result.books.some(b=>b.title==='불편한 편의점'));
 await assert.rejects(loadCatalog({},'',true),e=>e.status===503);
});
test('partial failure preserves valid books and reports unavailable source',async t=>{
 t.mock.method(globalThis,'fetch',async url=>{
  if(url.hostname==='www.aladin.co.kr')throw new Error('test failure');
  return Response.json({items:[{title:'<b>소설</b>',link:'https://www.yes24.com/product/goods/123'}]});
 });
 const data=await loadCatalog(keys,'소설');assert.ok(data.books.some(b=>b.title==='소설'));assert.ok(data.source.includes('네이버 웹 검색'));assert.ok(data.warnings.length>=1);assert.equal(data.demo,false);
});
test('total upstream failure becomes safe error without key disclosure',async t=>{
 t.mock.method(globalThis,'fetch',async()=>Response.json({errorCode:'invalid key',errorMessage:'test-only'},{status:401}));
 const result=await loadCatalog(keys,'불편한 편의점');assert.equal(result.demo,false);assert.ok(result.books.length);assert.ok(!JSON.stringify(result).includes('test-only'));assert.ok(result.warnings.length);
});
test('trend request uses domestic Bestseller API and preserves ranks',async t=>{
 t.mock.method(globalThis,'fetch',async url=>{
  assert.equal(url.pathname,'/ttb/api/ItemList.aspx');assert.equal(url.searchParams.get('SearchTarget'),'Book');assert.equal(url.searchParams.get('QueryType'),'Bestseller');
  return Response.json({item:[{itemId:1,title:'책',isbn13:'9788936434120',priceSales:10000,bestRank:3}]});
 });
 const result=await loadCatalog({ALADIN_TTB_KEY:'test-only'},'',true);assert.equal(result.books[0].rank,3);assert.equal(result.books[0].offers[0].shipping,null);
});
test('normalizers keep aggregate prices distinct, stock flags and unknown shipping',()=>{
 assert.equal(naverBook({link:'https://example.com/product/123'}),null);
 assert.deepEqual(naverBook({title:'책',link:'https://www.yes24.com/product/goods/123'}).offers,[]);
 assert.equal(naverBook({link:'https://evil-yes24.com/product/goods/123'}),null);
 assert.equal(aladinBook({priceSales:10000,stockStatus:'품절'}).offers[0].available,false);
 assert.equal(aladinBook({priceSales:10000,link:'javascript:alert(1)'}).offers[0].url,'');
 assert.equal(aladinBook({priceSales:10000}).offers[0].shipping,null);
});

test('DataLab uses four complete weeks, no demographic filters and no fabricated book ranks',async t=>{
 t.mock.method(globalThis,'fetch',async(url,options)=>{assert.equal(url,'https://openapi.naver.com/v1/datalab/search');const body=JSON.parse(options.body);assert.equal(body.startDate,'2026-08-17');assert.equal(body.endDate,'2026-09-13');assert.equal(body.keywordGroups.length,5);assert.equal(body.timeUnit,'week');assert.equal(body.gender,undefined);return Response.json({results:[{title:'소설',keywords:['소설 책 추천'],data:[{period:'2026-09-07',ratio:71}]}]});});
 const data=await naverInterest(keys,new Date('2026-09-17T01:00:00Z'));assert.equal(data.books.length,0);assert.equal(data.interest.series[0].data[0].ratio,71);assert.equal(data.demo,false);
});
test('DataLab denial is an explicit error, never demo data',async t=>{
 t.mock.method(globalThis,'fetch',async()=>Response.json({error:'denied'},{status:403}));
 await assert.rejects(naverInterest(keys),e=>e.status===502);
});

test('ISBN search retains verified collected metadata even when live results lack ISBN',async t=>{
 t.mock.method(globalThis,'fetch',async()=>Response.json({items:[{title:'9788936434120 소년이 온다',description:'9788936434120',link:'https://product.kyobobook.co.kr/detail/S000000001'}]}));
 const result=await loadCatalog({NAVER_CLIENT_ID:'test-only',NAVER_CLIENT_SECRET:'test-only'},'9788936434120');
 assert.equal(result.books[0].isbn,'9788936434120');assert.equal(result.books[0].author,'한강');
});
