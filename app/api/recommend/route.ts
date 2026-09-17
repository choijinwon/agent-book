import {keys} from '@/lib/api';
import {preferenceSchema,recommend,RecommendationError} from '@/lib/recommend';
let active=0;let windowStart=0;let count=0;
export async function POST(request:Request){
 if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'허용되지 않은 요청입니다.'},{status:403});
 if(!request.headers.get('content-type')?.includes('application/json'))return Response.json({error:'JSON 요청이 필요합니다.'},{status:415});
 if(Date.now()-windowStart>60000){windowStart=Date.now();count=0;}
 if(active>=2||count>=10)return Response.json({error:'추천 요청이 많습니다. 잠시 후 다시 시도해 주세요.'},{status:429});
 const reader=request.body?.getReader();if(!reader)return Response.json({error:'독서 취향을 입력해 주세요.'},{status:400});
 let text='';let size=0;const decoder=new TextDecoder();
 try{while(true){const item=await reader.read();if(item.done)break;size+=item.value.byteLength;if(size>4096){await reader.cancel();return Response.json({error:'입력이 너무 깁니다.'},{status:413});}text+=decoder.decode(item.value,{stream:true});}text+=decoder.decode();}finally{reader.releaseLock();}
 let parsed;try{parsed=preferenceSchema.safeParse(JSON.parse(text));}catch{return Response.json({error:'입력을 확인해 주세요.'},{status:400});}
 if(!parsed.success)return Response.json({error:'취향과 목적을 5~500자로 입력해 주세요.'},{status:400});
 active++;count++;
 try{return Response.json(await recommend(keys(),parsed.data),{headers:{'Cache-Control':'no-store'}});}catch(error){return Response.json({error:error instanceof RecommendationError?error.message:'추천 결과를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.'},{status:error instanceof RecommendationError?error.status:502,headers:{'Cache-Control':'no-store'}});}finally{active--;}
}
