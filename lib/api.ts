import {browseCollected} from './collected-search';
import type {AIKeys} from './recommend';
import { runtimeKeys } from '@/lib/runtime-env';
import { CatalogError, loadCatalog, type Keys } from './providers';
const cache = new Map<string,{expires:number;body:unknown}>();
export function keys():AIKeys { return runtimeKeys(); }
export async function catalogResponse(request:Request,trends=false) {
 const params=new URL(request.url).searchParams;
 const q=params.get('q')?.trim()||'';
 if(!trends&&!q&&params.get('browse')==='1')return Response.json({books:browseCollected(),source:'YES24 공개 상품 수집 자료',fetchedAt:new Date().toISOString(),warnings:['수집된 도서 목록입니다. 전체 서점 목록이 아니며, 가격은 표시된 확인 시점 기준입니다.'],demo:false});
 if(!trends&&(!q||q.length>100)) return Response.json({error:'검색어를 1~100자로 입력하세요.'},{status:400});
 const key=trends?'trends':`search:${q}`;
 const hit=cache.get(key);if(hit&&hit.expires>Date.now()) return Response.json(hit.body);
 try {
  const body=await loadCatalog(keys(),q,trends);
  if(cache.size>=100) cache.delete(cache.keys().next().value!);
  cache.set(key,{expires:Date.now()+(trends?3600_000:60_000),body});
  return Response.json(body,{headers:{'Cache-Control':'private, max-age=60'}});
 } catch(e) {return Response.json({error:e instanceof CatalogError?e.message:'일시적인 오류입니다. 다시 시도하세요.'},{status:e instanceof CatalogError?e.status:500});}
}
