import {writeFile} from 'node:fs/promises';
import {loadCatalog} from '../lib/providers.ts';
const keys={NAVER_CLIENT_ID:process.env.NAVER_CLIENT_ID,NAVER_CLIENT_SECRET:process.env.NAVER_CLIENT_SECRET};
if(!keys.NAVER_CLIENT_ID||!keys.NAVER_CLIENT_SECRET)throw new Error('Set NAVER_CLIENT_ID and NAVER_CLIENT_SECRET in the collector environment');
const queries=process.argv.slice(2);if(!queries.length)throw new Error('Provide book search terms');
const books=new Map();const started=Date.now();
for(const query of queries){const result=await loadCatalog(keys,query);for(const book of result.books||[])if(book.offers.some(o=>o.checkedAt&&Date.parse(o.checkedAt)>=started)&&book.isbn)books.set(book.id,book);console.log(`${query}: ${books.size} verified products collected`);await new Promise(r=>setTimeout(r,1000));}
if(!books.size)throw new Error('No verified prices; previous snapshot preserved');
await writeFile(new URL('../data/prices.json',import.meta.url),JSON.stringify([...books.values()],null,2)+'\n');
