import { env } from 'cloudflare:workers';
import { CatalogError, loadCatalog, type Keys } from './providers';
const cache = new Map<string,{expires:number;body:unknown}>();
export function keys():Keys { return env as unknown as Keys; }
export async function catalogResponse(request:Request,trends=false) {
 const q=new URL(request.url).searchParams.get('q')?.trim()||'';
 if(!trends&&(!q||q.length>100)) return Response.json({error:'검색어를 1~100자로 입력하세요.'},{status:400});
 const key=trends?'trends':q;
 const hit=cache.get(key);if(hit&&hit.expires>Date.now()) return Response.json(hit.body);
 try {
  const body=await loadCatalog(keys(),q,trends);
  if(cache.size>=100) cache.delete(cache.keys().next().value!);
  cache.set(key,{expires:Date.now()+60_000,body});
  return Response.json(body,{headers:{'Cache-Control':'private, max-age=60'}});
 } catch(e) {return Response.json({error:e instanceof CatalogError?e.message:'일시적인 오류입니다. 다시 시도하세요.'},{status:e instanceof CatalogError?e.status:500});}
}
