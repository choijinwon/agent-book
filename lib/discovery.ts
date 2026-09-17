import data from '../data/discovery.json' with {type:'json'};
import type {Book} from './books.ts';
export const searchModes=['situation','taste','purpose','memory'] as const;
export type SearchMode=typeof searchModes[number];
const features=[
 {label:'짧게 나눠 읽기',query:/퇴근|출근|출퇴근|20분|짧|가벼운/,evidence:/단편|에피소드|짧은|짤막|틈틈/},
 {label:'따뜻한 이야기',query:/따뜻|위로|편안|다정|힐링/,evidence:/따뜻|위로|다정|온기|힐링/},
 {label:'입문',query:/처음|초보|입문|기초|쉽게|쉬운/,evidence:/초보|입문|기초|처음|쉽게|쉬운/},
 {label:'경제·돈',query:/경제|돈|재테크/,evidence:/경제|돈|재테크/},
 {label:'소설',query:/소설|이야기/,evidence:/소설/},
 {label:'AI·개발',query:/ai|인공지능|에이전트|개발|코딩/i,evidence:/인공지능|AI|에이전트|개발|코딩|프로그래밍/},
 {label:'과학',query:/과학|우주|천문/,evidence:/과학|우주|천문/},
];
export function discoverySearch(q:string,mode:SearchMode,books:Book[]=data as Book[],now=Date.now()){
 const warnings=['수집한 상품 소개와 제목의 문구를 비교하는 검색입니다. AI 의미 검색은 아직 연결되지 않았습니다.'];
 const reference=mode==='taste'?/[『“"]([^』”"]+)[』”"]/.exec(q)?.[1]:undefined;
 const query=reference?q.replace(reference,''):q;const requested=features.filter(f=>f.query.test(query));
 const exclusions=[...( /수식.{0,12}(싫|없|제외|말고)|수식은 싫/.test(q)?['수식']:[]),...(/슬프|슬픈|슬픔/.test(q)&&/덜|않|싫|말고/.test(q)?['슬픔','슬픈','비극']:[])];
 if(exclusions.length)warnings.push(`‘${exclusions.join('·')}’이 소개에 명시된 책은 제외합니다. 언급이 없다고 해당 요소가 없다는 뜻은 아닙니다.`);
 if(/\d+\s*분/.test(q))warnings.push('완독 시간은 확인할 수 없어 보장하지 않습니다. 짧게 나눠 읽을 수 있다는 소개 문구를 우선 찾습니다.');
 const tokens=query.toLowerCase().replace(/[^가-힣a-z0-9\s]/g,' ').split(/\s+/).map(t=>t.replace(/(에서는|에서|처럼|으로|을|를|이|가|은|는|의)$/,'')).filter(t=>t.length>=2&&!/^(책|동안|읽을|읽고|싶|추천|사람|나오|나오는|일하는|한국|싫어요|하지만|배우|처음|가벼운|따뜻하지만|소설)$/.test(t));
 const results=books.flatMap(book=>{
  if(reference&&book.title.replace(/\s/g,'').includes(reference.replace(/\s/g,'')))return [];
  const content=`${book.title} ${book.category} ${book.description}`;if(exclusions.some(t=>content.includes(t)))return [];
  const matched=requested.filter(f=>f.evidence.test(content));const hits=tokens.filter(t=>content.toLowerCase().includes(t));
  let score=matched.length*4+hits.length*3;if(mode==='memory')score=hits.length*6+matched.length;if(!score)return [];
  // Memory queries need a concrete clue, not merely the generic fiction category.
  if(mode==='memory'&&!hits.length)return [];
  const expression=hits[0]||matched[0]?.evidence.source.split('|').find(t=>content.includes(t))||'';
  const at=book.description.toLowerCase().indexOf(expression.toLowerCase());const start=Math.max(0,at-45);const evidence=book.description.slice(start,start+220);
  const offers=book.offers.filter(o=>{const checked=Date.parse(o.checkedAt||'');return checked<=now&&now-checked<=7*86400000;});
  return [{book:{...book,offers},score,labels:matched.map(f=>f.label),evidence,matchedTerms:hits.slice(0,4)}];
 }).sort((a,b)=>b.score-a.score||a.book.title.localeCompare(b.book.title,'ko')).slice(0,8);
 return {results,totalRecords:books.length,warnings,mode,query:q,source:'YES24 공개 상품 소개',coverage:'소개·제목·분야 중심 · 목차·본문·완독 시간 미수집'};
}
