'use client';
import {useEffect,useState} from 'react';
import {Target,BookOpen} from 'lucide-react';
import {completedInYear,readingProgress,readingGoalsKey,readReadingGoals,type JournalEntry} from '@/lib/reading-journal';

export function ReadingGoals({entries,ready,onEdit}:{entries:JournalEntry[];ready:boolean;onEdit:(entry:JournalEntry)=>void}){
 const [year,setYear]=useState<number|null>(null);
 const [goal,setGoal]=useState<number|null>(null);
 const [input,setInput]=useState('12');
 const [message,setMessage]=useState('');
 useEffect(()=>{
  function load(){const y=new Date().getFullYear();setYear(y);try{const n=readReadingGoals(localStorage.getItem(readingGoalsKey))[y]??null;setGoal(n);setInput(String(n??12));}catch{setMessage('목표를 불러오지 못했습니다. 브라우저 저장소를 확인해 주세요.');}}
  load();const sync=(e:StorageEvent)=>{if(e.key===readingGoalsKey||e.key===null)load();};
  const resume=()=>{if(document.visibilityState==='visible')load();};
  window.addEventListener('storage',sync);document.addEventListener('visibilitychange',resume);
  return()=>{window.removeEventListener('storage',sync);document.removeEventListener('visibilitychange',resume);};
 },[]);
 function save(e:React.FormEvent){e.preventDefault();const n=Number(input);if(!year||!Number.isInteger(n)||n<1||n>100){setMessage('목표는 1~100권 사이로 입력해 주세요.');return;}
  try{const goals=readReadingGoals(localStorage.getItem(readingGoalsKey));localStorage.setItem(readingGoalsKey,JSON.stringify({...goals,[year]:n}));setGoal(n);setMessage('올해 독서 목표를 저장했습니다.');}catch{setMessage('목표를 저장하지 못했습니다. 브라우저 저장소를 확인해 주세요.');}
 }
 const count=year?completedInYear(entries,year):0;
 const reading=entries.filter(e=>e.status==='reading');
 const undated=entries.filter(e=>e.status==='done'&&!e.completedOn);
 return <div className="reading-dashboard">
  <section className="reading-goal" aria-labelledby="reading-goal-title">
   <div className="reading-goal-heading"><Target size={20}/><h3 id="reading-goal-title">{year?`${year}년 `:''}나의 독서 목표</h3></div>
   <p className="reading-goal-count"><strong>{count}</strong><span>{goal?`/ ${goal}권 완독`:'권 완독 · 목표를 정해보세요'}</span></p>
   {goal&&<><progress aria-label="올해 독서 목표 달성률" max={goal} value={Math.min(count,goal)}/><p className="help">{count>=goal?'올해 목표를 달성했어요!':`목표까지 ${goal-count}권 남았어요.`}</p></>}
   <form onSubmit={save}><label htmlFor="annual-book-goal">올해 목표</label><input id="annual-book-goal" type="number" min={1} max={100} step={1} required value={input} onChange={e=>setInput(e.target.value)}/><span>권</span><button type="submit" disabled={!ready||!year}>목표 저장</button></form>
   <p className="help">완독 날짜 기준 · 이 브라우저의 기록을 집계합니다.</p>
   {undated.length>0&&<p className="help">완독 날짜가 없는 {undated.length}권은 집계에서 제외됩니다. <button className="text-button" onClick={()=>onEdit(undated[0])}>날짜 입력하기</button></p>}
   <p className="journal-message" role="status">{message}</p>
  </section>
  <section className="reading-current" aria-labelledby="reading-current-title"><div className="reading-goal-heading"><BookOpen size={20}/><h3 id="reading-current-title">지금 읽고 있는 책 <span>{reading.length}권</span></h3></div>
   {reading.length===0?<p className="help">책의 상태를 ‘읽는 중’으로 바꾸고 읽은 페이지를 기록해 보세요.</p>:<ul>{reading.map(entry=>{const pct=readingProgress(entry);return <li key={entry.id}><button onClick={()=>onEdit(entry)}><span><strong>{entry.title}</strong><small>{pct===null?`${entry.currentPage??0}쪽 읽음 · 전체 페이지 입력하기`:`${entry.currentPage??0} / ${entry.totalPages}쪽 · ${pct}%`}</small></span><span className="reading-update">이어 기록하기 →</span></button>{pct!==null&&<progress aria-label={`${entry.title} 독서 진행률`} value={pct} max={100}/>}</li>;})}</ul>}
  </section>
 </div>;
}
