import saved from '../data/prices.json' with {type:'json'};
import type {Book} from './books.ts';
const selections=[
 {id:'yes24-99308021',tags:['소설','위로','편안','따뜻','편의점','힐링'],reason:'평범한 일상과 사람 사이의 온기를 만나고 싶을 때 골라 볼 소설입니다.'},
 {id:'yes24-172574653',tags:['경제','돈','투자','재테크','심리','경영'],reason:'돈을 대하는 판단과 행동을 돌아보고 싶을 때 읽어 볼 책입니다. 구체적인 투자 종목보다 생각의 습관에 관심이 있는 분께 권합니다.'},
 {id:'yes24-2312211',tags:['과학','우주','별','코스모스','천문'],reason:'일상에서 시선을 넓혀 우주와 인간의 자리를 생각하고 싶을 때 권합니다. 천천히 읽으며 호기심을 따라가 보세요.'},
 {id:'yes24-119697570',tags:['소설','감정','성장','아몬드','청소년'],reason:'감정과 타인을 이해하는 일을 이야기로 생각해 보고 싶을 때 골라 볼 성장소설입니다.'},
 {id:'yes24-23030284',tags:['인문','역사','인류','사피엔스','사회'],reason:'인류의 역사를 넓은 시야에서 살펴보고 싶은 독자에게 권합니다. 한 가지 해석으로 받아들이며 다른 역사책과 비교해 읽어도 좋습니다.'},
 {id:'yes24-176787',tags:['소설','고전','성장','데미안','자아'],reason:'자신만의 기준과 삶의 방향을 고민하고 있다면, 성장과 자아를 다루는 고전을 만나 보세요.'},
 {id:'yes24-13137546',tags:['한강','소설','역사','소년이 온다','한국문학'],reason:'역사의 상처를 문학으로 마주하고 싶은 독자에게 권합니다. 폭력과 상실을 다루므로 마음의 여유가 있을 때 읽기를 권합니다.'},
 {id:'yes24-103495056',tags:['한강','소설','역사','작별하지 않는다','한국문학'],reason:'기억과 상실을 깊이 들여다보는 문학을 찾는 분께 권합니다. 무거운 역사적 주제를 천천히 읽고 싶은 날에 골라 보세요.'},
];
export function automaticRecommendations(recent:string[],offset=0,now=Date.now()){
 const history=recent.slice(0,5).map(s=>s.toLowerCase());
 const ranked=selections.map((s,index)=>({...s,index,score:history.reduce((total,q,i)=>total+(s.tags.some(t=>q.includes(t.toLowerCase()))?5-i:0),0)})).sort((a,b)=>b.score-a.score||a.index-b.index);
 const matched=ranked.some(s=>s.score>0);const start=Math.max(0,Math.floor(offset))%ranked.length;
 const items=Array.from({length:3},(_,i)=>ranked[(start+i)%ranked.length]).flatMap(selection=>{const source=(saved as Book[]).find(b=>b.id===selection.id);if(!source)return [];const offers=source.offers.filter(o=>{const checked=Date.parse(o.checkedAt||'');return Number.isFinite(checked)&&checked<=now&&now-checked<=7*86400000;});return [{book:{...source,offers},reason:selection.reason,matched:selection.score>0}];});
 return {items,matched};
}
