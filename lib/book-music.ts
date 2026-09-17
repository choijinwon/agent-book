import type {Book} from './books';
export const readingTracks={
 ambre:{title:'Ambre',artist:'Nils Frahm',style:'차분한 피아노',url:'https://nilsfrahm.bandcamp.com/album/wintermusik',source:'https://www.nilsfrahm.com/works/wintermusik/'},
 glass:{title:'Glass',artist:'Hania Rani',style:'흐르는 피아노',url:'https://haniarani.bandcamp.com/track/glass',source:'https://haniarani.com/video/'},
 near:{title:'Near Light',artist:'Ólafur Arnalds',style:'공간감 있는 연주',url:'https://soundcloud.com/erasedtapes/olafur-arnalds-near-light',source:'https://www.erasedtapes.com/news/2012'},
 saman:{title:'saman',artist:'Ólafur Arnalds',style:'여백이 있는 피아노',url:'https://soundcloud.com/olafur-arnalds/saman',source:'https://uma.lnk.to/saman'},
};
type TrackId=keyof typeof readingTracks;
const special:Record<string,{tracks:TrackId[];reason:string}>={
 'yes24-99308021':{tracks:['ambre','glass'],reason:'일상의 온기를 다루는 이 소설에는 부드러운 피아노를 곁들여 보세요. 문장 사이에 여유를 두고 읽고 싶은 날의 조합입니다.'},
 'yes24-13137546':{tracks:['saman','ambre'],reason:'역사의 상처를 마주하는 동안 감정을 재촉하지 않는 차분한 피아노를 골랐습니다. 음악이 무겁게 느껴지면 잠시 멈추고 읽어도 좋습니다.'},
 'yes24-103495056':{tracks:['saman','near'],reason:'기억과 상실을 천천히 읽는 시간에, 여백이 있는 연주를 곁들이는 조합을 제안합니다.'},
 'yes24-2312211':{tracks:['near','glass'],reason:'우주와 인간을 생각하며 시야를 넓히는 독서에 공간감 있는 연주를 골랐습니다.'},
 'yes24-172574653':{tracks:['glass','ambre'],reason:'돈에 대한 판단과 행동을 돌아볼 때, 가사 대신 피아노의 흐름을 배경으로 두는 조합을 제안합니다.'},
 'yes24-119697570':{tracks:['ambre','saman'],reason:'감정과 관계를 따라가는 성장소설에 부드러운 피아노의 여운을 더해 보세요.'},
 'yes24-176787':{tracks:['saman','glass'],reason:'자신만의 방향을 고민하며 고전을 읽을 때, 조용한 피아노와 함께 문장에 머물러 보세요.'},
 'yes24-23030284':{tracks:['near','ambre'],reason:'인류의 긴 시간을 생각하는 독서에 공간감 있는 연주를 곁들여 보는 조합입니다.'},
};
export function musicForBook(book:Pick<Book,'id'|'category'>){
 const exact=special[book.id];const category=book.category||'';
 const profile=exact||(/과학|IT|컴퓨터/.test(category)?{tracks:['near','glass'] as TrackId[],reason:'이 책의 분야를 기준으로, 새로운 개념을 읽는 시간에 어울릴 공간감 있는 연주를 골랐습니다.'}:/경제|경영|자기계발/.test(category)?{tracks:['glass','ambre'] as TrackId[],reason:'이 책의 분야를 기준으로, 생각을 정리하며 읽을 때 곁들일 피아노 연주를 골랐습니다.'}:{tracks:['ambre','saman'] as TrackId[],reason:'상세 분위기 정보가 없는 책에는 잔잔한 피아노를 기본 조합으로 제안합니다.'});
 return {reason:profile.reason,basis:exact?'책별 선정':'분야·기본 선정',tracks:profile.tracks.map(id=>({id,...readingTracks[id],listenUrl:`https://music.youtube.com/search?q=${encodeURIComponent(readingTracks[id].artist+' '+readingTracks[id].title)}`}))};
}
