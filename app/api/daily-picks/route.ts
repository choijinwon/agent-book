import {keys} from '@/lib/api';
import {loadCatalog} from '@/lib/providers';
import {buildDailyPicks,koreanDay,type DailyPicks} from '@/lib/daily-picks';
let cache:{day:string;body:DailyPicks}|undefined;
let pending:Promise<DailyPicks>|undefined;
export async function GET(){
 const day=koreanDay();
 try{
 if(cache?.day===day)return Response.json(cache.body,{headers:{'Cache-Control':'no-store'}});
 if(!pending)pending=loadCatalog(keys(),'',true).then(c=>{const body=buildDailyPicks(c);cache={day:body.day,body};return body;}).finally(()=>{pending=undefined;});
 return Response.json(await pending,{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'트렌드를 불러오지 못해 기본 추천을 표시합니다.'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
