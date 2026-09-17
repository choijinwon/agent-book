import {z} from 'zod';
export const reflectionKey='agent-book-work-reflections-v1';
export const reasons=[
 {id:'people',label:'사람 관계',query:'직장 인간관계',prompt:'어떤 말이나 상황이 힘들었나요?',action:'다음 대화에서 요청하고 싶은 내용을 한 문장으로 적어보세요.'},
 {id:'load',label:'업무량',query:'업무 우선순위',prompt:'가장 부담스러운 업무와 그 이유는 무엇인가요?',action:'줄이거나 일정을 조정하고 싶은 업무 한 가지를 골라보세요.'},
 {id:'reward',label:'보상',query:'연봉 협상',prompt:'내 기여와 보상 사이에서 어떤 차이를 느끼나요?',action:'최근 기여한 일 한 가지와 원하는 변화를 구체적으로 적어보세요.'},
 {id:'growth',label:'성장 정체',query:'커리어 성장',prompt:'더 배우거나 맡아보고 싶은 일은 무엇인가요?',action:'관심 있는 업무를 알아보기 위한 작은 다음 단계를 적어보세요.'},
 {id:'fit',label:'일이 맞지 않음',query:'진로 탐색',prompt:'에너지가 생기는 일과 소진되는 일은 각각 무엇인가요?',action:'내가 일에서 중요하게 생각하는 조건 세 가지를 적어보세요.'},
] as const;
export const needs=[{id:'comfort',label:'위로받기',query:'직장인 위로 에세이',action:'오늘 버텨낸 나에게 해주고 싶은 말을 한 줄 남겨보세요.'},{id:'reflect',label:'상황 정리하기',query:'',action:''},{id:'change',label:'내일 다르게 해보기',query:'',action:''},{id:'move',label:'이직 준비하기',query:'이직 커리어',action:'다음 직장에서 원하는 조건 한 가지와 확인할 방법을 적어보세요.'}] as const;
export function reflectionGuide(reasonId:string,needId:string){const reason=reasons.find(r=>r.id===reasonId)??reasons[0];const need=needs.find(n=>n.id===needId)??needs[0];return {reason,need,query:need.query||reason.query,action:need.action||(need.id==='reflect'?'일어난 사실과 내가 느낀 감정을 나누어 적어보세요.':reason.action)};}
const schema=z.object({id:z.string().min(1).max(100),reason:z.enum(['people','load','reward','growth','fit']),need:z.enum(['comfort','reflect','change','move']),note:z.string().trim().min(1).max(1000),createdAt:z.string().datetime()}).strict();
export type WorkReflection=z.infer<typeof schema>;
export function readReflections(raw:string|null):WorkReflection[]{try{const rows:unknown=JSON.parse(raw||'[]');if(!Array.isArray(rows))return [];const seen=new Set<string>();return rows.slice(0,500).flatMap(row=>{const r=schema.safeParse(row);if(!r.success||seen.has(r.data.id))return [];seen.add(r.data.id);return [r.data];}).slice(0,100);}catch{return [];}}
export function addReflection(rows:WorkReflection[],input:WorkReflection){const entry=schema.parse(input);if(rows.length>=100)throw new Error('기록은 100개까지 저장할 수 있어요. 내려받은 뒤 오래된 기록을 정리해 주세요.');return [entry,...rows];}
