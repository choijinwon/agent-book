"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Search, ArrowUpRight, TrendingUp, SlidersHorizontal, Info, X, GitCompareArrows } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { demoBooks, bestOffer, money, safeUrl, type Book } from "@/lib/books";
import type { Catalog } from "@/lib/providers";

const demoCatalog:Catalog={books:demoBooks,source:"가상 도서 예시",fetchedAt:"",warnings:[],demo:true};
const externalLinks=(q:string)=>[
 ["알라딘",`https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&SearchWord=${encodeURIComponent(q)}`],
 ["교보문고",`https://search.kyobobook.co.kr/search?keyword=${encodeURIComponent(q)}`],
 ["YES24",`https://www.yes24.com/Product/Search?domain=BOOK&query=${encodeURIComponent(q)}`],
 ["네이버",`https://search.shopping.naver.com/book/search?query=${encodeURIComponent(q)}`],
];
function StoreLinks({query}:{query:string}) {return <div className="store-links">{externalLinks(query).map(([name,url])=><a key={name} href={url} target="_blank" rel="noreferrer">{name} <ArrowUpRight size={13}/></a>)}</div>;}
function Price({book,demo}:{book:Book;demo:boolean}) {const best=bestOffer(book.offers); const known=book.offers.filter(o=>o.available&&o.price>0);const lowest=known.length?Math.min(...known.map(o=>o.price)):undefined;return <div className="card-price"><small>{demo?"예시 최적가 · 배송비 포함":best?"확인된 판매처 중 최적가":"조회된 상품가 · 배송비 별도"}</small><strong>{money(best?.total??lowest)}</strong>{!demo&&!best&&<span className="price-note">배송비 미확인 · 최종 결제액 비교 필요</span>}</div>;}
export default function Home() {
 const [query,setQuery]=useState("");const [submitted,setSubmitted]=useState("");
 const [mode,setMode]=useState("demo");const [tab,setTab]=useState("discover");
 const [catalog,setCatalog]=useState<Catalog>(demoCatalog);const [category,setCategory]=useState("전체");
 const [budget,setBudget]=useState("all");const [sort,setSort]=useState("recommended");
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 const [recent,setRecent]=useState<string[]>([]);const [status,setStatus]=useState({aladin:false,naver:false});
 const [detail,setDetail]=useState<Book|null>(null);const [compared,setCompared]=useState<Book[]>([]);const [compareOpen,setCompareOpen]=useState(false);
 const sequence=useRef(0);
 useEffect(()=>{try {const values=JSON.parse(localStorage.getItem("agent-book-recent")||"[]");if(Array.isArray(values))setRecent(values.filter(v=>typeof v==="string"&&v.length<=100).slice(0,5));}catch{}fetch('/api/status').then(r=>r.json() as Promise<{aladin:boolean;naver:boolean}>).then(setStatus).catch(()=>{});},[]);
 const remember=(q:string)=>{if(!q)return;setRecent(previous=>{const next=[q,...previous.filter(x=>x!==q)].slice(0,5);try{localStorage.setItem("agent-book-recent",JSON.stringify(next));}catch{}return next;});};
 const load=useCallback(async(q:string,nextTab:string,nextMode:string)=>{
  const current=++sequence.current;setError("");setSubmitted(q);setCategory("전체");setCompared([]);
  if(nextMode==='demo'){setCatalog(demoCatalog);setBusy(false);return demoBooks;}
  setCatalog({books:[],source:"",fetchedAt:"",warnings:[],demo:false});
  if(nextTab==='discover'&&!q){setBusy(false);return [];}
  setBusy(true);
  try{const response=await fetch(nextTab==='trends'?'/api/trends':`/api/books?q=${encodeURIComponent(q)}`);const body=await response.json() as Catalog & {error?:string};if(!response.ok)throw new Error(body.error||'정보를 불러오지 못했습니다.');if(current===sequence.current)setCatalog(body);return body.books as Book[];}
  catch(e){if(current===sequence.current)setError(e instanceof Error?e.message:'일시적인 오류입니다.');return [];}
  finally{if(current===sequence.current)setBusy(false);}
 },[]);
 const search=async(q:string)=>{q=q.trim();if(!q||q.length>100){setError('검색어를 1~100자로 입력하세요.');return [];}setQuery(q);setTab('discover');remember(q);return load(q,'discover',mode);};
 useEffect(()=>{
  const ctx=(document as unknown as {modelContext?:{registerTool:(tool:unknown,options:unknown)=>Promise<void>}}).modelContext;
  if(!ctx?.registerTool)return;const lifecycle=new AbortController();
  Promise.resolve(ctx.registerTool({name:"search_books",title:"도서 검색",description:"현재 선택된 예시 또는 실제 도서 모드에서 검색하고 화면을 갱신합니다. 실제 모드는 연결된 도서 API에 검색어를 전송합니다.",inputSchema:{type:"object",properties:{query:{type:"string",minLength:1,maxLength:100}},required:["query"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute:async(input:unknown)=>{const q=(input as {query?:unknown})?.query;if(typeof q!=="string"||!q.trim()||q.length>100)throw new Error("query must contain 1–100 characters");setQuery(q.trim());setTab("discover");const books=await load(q.trim(),'discover',mode);return {mode,count:mode==='demo'?books.filter(b=>(b.title+b.author+b.isbn+b.category).includes(q.trim())).length:books.length};}},{signal:lifecycle.signal})).catch(()=>{});
  return ()=>lifecycle.abort();
 },[mode,load]);
 const categories=["전체",...new Set(catalog.books.map(b=>b.category))];
 const visible=useMemo(()=>catalog.books.filter(b=>{
  const matches=!catalog.demo||!submitted||(b.title+b.author+b.isbn+b.category).toLowerCase().includes(submitted.toLowerCase());
  const total=bestOffer(b.offers)?.total;
  return matches&&(category==='전체'||b.category===category)&&(budget==='all'||(total!==undefined&&total<=Number(budget)));
 }).sort((a,b)=>sort==='price'?(bestOffer(a.offers)?.total??Infinity)-(bestOffer(b.offers)?.total??Infinity):sort==='title'?a.title.localeCompare(b.title,'ko'):(a.rank??999)-(b.rank??999)),[catalog,submitted,category,budget,sort]);
 const toggleCompare=(book:Book,checked:boolean)=>{setCompared(current=>checked?current.length<3?[...current,book]:current:current.filter(b=>b.id!==book.id));};
 const trends=catalog.books.slice().sort((a,b)=>(a.rank??999)-(b.rank??999));
 const counts=Object.entries(catalog.books.reduce((acc,b)=>({...acc,[b.category]:(acc[b.category]||0)+1}),{} as Record<string,number>)).sort((a,b)=>b[1]-a[1]);
 const reset=()=>{setQuery("");setSubmitted("");setCategory("전체");setBudget("all");setSort("recommended");setError("");};
 return <main className="shell">
  <header className="topbar"><a className="brand" href="/">agent<span>/book</span><b>®</b></a><span className="edition">도서 가격 비교 & 트렌드</span><Select value={mode} onValueChange={value=>{setMode(value);setBudget('all');void load(query,tab,value);}}><SelectTrigger aria-label="데이터 모드" className="mode"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="demo">예시 데이터</SelectItem><SelectItem value="live">실제 도서</SelectItem></SelectContent></Select></header>
  <section className="intro"><div><p className="eyebrow">YOUR NEXT CHAPTER</p><h1>읽고 싶은 책.<br/><span>알고 싶은 가격.</span></h1></div><p>한 권을 고르는 일에,<br/>조금 더 좋은 기준.</p></section>
  <form className="searchbox" onSubmit={e=>{e.preventDefault();void search(query);}}><Search aria-hidden="true"/><input aria-label="책 검색" placeholder="어떤 책을 찾고 있나요? 제목, 저자, ISBN" maxLength={100} value={query} onChange={e=>setQuery(e.target.value)}/><button type="submit" disabled={busy}>{busy?'찾는 중':'책 찾기'} <ArrowUpRight size={18}/></button></form>
  <div className="search-meta"><div className="suggestions"><span>검색해 보세요</span>{(mode==='demo'?['소설','습관','과학']:['한강','인공지능','한국소설']).map(q=><button key={q} onClick={()=>void search(q)}>{q}</button>)}</div></div>
  {recent.length>0&&<div className="recent"><span>최근 검색</span>{recent.map(q=><button key={q} onClick={()=>void search(q)}>{q}</button>)}<button aria-label="최근 검색 지우기" onClick={()=>{setRecent([]);try{localStorage.removeItem('agent-book-recent');}catch{}}}><X size={14}/></button></div>}
  <div className="notice"><Info size={17}/><span>{mode==='demo'?'예시 모드 · 도서, 가격, 순위는 가상 데이터입니다.':'동일 ISBN의 새 종이책 정보를 모읍니다. 배송비·쿠폰·적립금은 서점에서 확인하세요.'}</span></div>
  <Tabs value={tab} onValueChange={value=>{setTab(value);setBudget('all');void load(value==='trends'?'':query,value,mode);}}>
   <TabsList className="main-tabs" variant="line"><TabsTrigger value="discover">도서 탐색 <span>01</span></TabsTrigger><TabsTrigger value="trends">독서 트렌드 <span>02</span></TabsTrigger></TabsList>
   {error&&<div className="error" role="alert"><span>{error}</span><button onClick={()=>void load(query,tab,mode)}>다시 시도</button></div>}
   {catalog.warnings.map(w=><p className="error" key={w}>{w}</p>)}
   <TabsContent value="discover">
    <div className="workspace"><aside className="filters" aria-label="도서 필터"><div className="category-list">{categories.map(c=><button key={c} className={category===c?'selected':''} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}<span>{c==='전체'?catalog.books.length:catalog.books.filter(b=>b.category===c).length}</span></button>)}</div><div className="budget-filter"><span>배송비 포함</span><Select value={budget} onValueChange={setBudget}><SelectTrigger aria-label="배송비 포함 예산"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">제한 없음</SelectItem><SelectItem value="15000">15,000원 이하</SelectItem><SelectItem value="20000">20,000원 이하</SelectItem><SelectItem value="30000">30,000원 이하</SelectItem></SelectContent></Select><button className="reset-filter" onClick={reset}>초기화</button></div><p className="filter-help">예산 필터는 배송비까지 확인된 도서에 적용됩니다.</p></aside>
    <section className="results" aria-busy={busy}><div className="section-head"><h2>{submitted?`“${submitted}” 검색 결과`:'발견할 책들'} <span className="count">{visible.length}</span></h2><Select value={sort} onValueChange={setSort}><SelectTrigger aria-label="도서 정렬"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="recommended">기본순</SelectItem><SelectItem value="price">확인된 총액 낮은순</SelectItem><SelectItem value="title">제목순</SelectItem></SelectContent></Select></div>
    <p className="result-source" aria-live="polite">{catalog.source}{catalog.fetchedAt&&` · 조회 ${new Date(catalog.fetchedAt).toLocaleString('ko-KR')}`}{mode==='demo'?' · 실제 구매 정보가 아닙니다.':''}</p>
    {busy?<div className="book-grid">{[1,2,3].map(i=><Skeleton key={i} className="h-72 rounded-xl"/>)}</div>:visible.length?<div className="book-grid">{visible.map((book,i)=><article className="book-card" key={book.id}><span className="index">{String(i+1).padStart(2,'0')}</span><div className="book-info"><span className="category">{book.category}</span>{book.cover&&<img className="cover" src={safeUrl(book.cover)} alt={`${book.title} 표지`} loading="lazy" onError={e=>{e.currentTarget.style.display='none';}}/>}<button className="book-title" onClick={()=>setDetail(book)}><h3>{book.title}</h3></button><p>{book.author}<span className="meta-divider">/</span>{book.publisher}</p></div><Price book={book} demo={catalog.demo}/><div className="book-actions"><button className="detail" onClick={()=>setDetail(book)}>가격 비교 <ArrowUpRight size={18}/></button><label className="compare-check"><Checkbox checked={compared.some(b=>b.id===book.id)} disabled={compared.length>=3&&!compared.some(b=>b.id===book.id)} onCheckedChange={v=>toggleCompare(book,v===true)}/>비교함 담기</label></div></article>)}</div>:<Empty className="empty-panel"><Search size={28}/><EmptyTitle>{mode==='live'&&!submitted?'어떤 책을 찾고 있나요?':'조건에 맞는 책이 없습니다'}</EmptyTitle><EmptyDescription>제목·저자·ISBN으로 검색하거나 필터를 초기화해 보세요.</EmptyDescription><button className="text-button" onClick={reset}>검색 조건 초기화</button></Empty>}
    <div className="external"><div><strong>서점에서 직접 찾아보기</strong><p>가격을 제공하지 않는 서점도 검색할 수 있습니다.</p></div><StoreLinks query={query||'도서'}/></div></section></div>
   </TabsContent>
   <TabsContent value="trends"><div className="section-head"><h2>지금 읽히는 책</h2><span>{catalog.demo?'가상의 순위로 보는 트렌드 예시':`${catalog.source||'알라딘'} 베스트셀러 · 국내도서`}</span></div><p className="result-source">{catalog.fetchedAt&&`조회 ${new Date(catalog.fetchedAt).toLocaleString('ko-KR')} · `}단일 시점 순위입니다. 순위 상승률이나 시장 전체 인기도를 뜻하지 않습니다.</p>{busy?<Skeleton className="h-80"/>:trends.length?<div className="trend-layout"><div className="ranking">{trends.map((book,i)=><button key={book.id} className="rank-row" onClick={()=>setDetail(book)}><b>{String(book.rank||i+1).padStart(2,'0')}</b><span><strong>{book.title}</strong><small>{book.author} · {book.category}</small></span><ArrowUpRight size={18}/></button>)}</div><aside className="trend-summary"><p className="eyebrow">BY CATEGORY</p><h3>분야별로 살펴보기</h3><p>현재 목록 {catalog.books.length}권의 분야 구성</p>{counts.map(([name,count])=><button className="bar-row" key={name} onClick={()=>{setTab('discover');setSubmitted('');setQuery('');setCategory(name);setBudget('all');}}><span>{name}<b>{count}권</b></span><i><em style={{width:`${count/catalog.books.length*100}%`}}/></i></button>)}<p className="help">분야를 누르면 해당 책만 모아볼 수 있습니다.</p></aside></div>:<Empty className="empty-panel"><TrendingUp/><EmptyTitle>트렌드 정보가 아직 없습니다</EmptyTitle><EmptyDescription>알라딘 연결 후 베스트셀러 목록을 가져옵니다. 예시 모드에서도 기능을 체험할 수 있습니다.</EmptyDescription></Empty>}</TabsContent>
  </Tabs>
  <footer><div><span className="footer-brand">agent/book®</span><p>한 권의 좋은 선택.</p></div><div className="footer-meta"><p>알라딘 {status.aladin?'키 설정됨':'미연결'} · 네이버 {status.naver?'키 설정됨':'미연결'}</p><p>최근 검색은 이 브라우저에만 저장됩니다.</p></div></footer>
  {compared.length>0&&<div className="compare-dock"><GitCompareArrows size={19}/><span>{compared.length}/3권 선택</span><button onClick={()=>setCompareOpen(true)}>선택 도서 비교</button><button aria-label="비교함 비우기" onClick={()=>setCompared([])}><X size={18}/></button></div>}
  <Dialog open={!!detail} onOpenChange={open=>{if(!open)setDetail(null);}}><DialogContent className="book-dialog">{detail&&<><span className="category">{detail.category}</span><DialogTitle className="dialog-title">{detail.title}</DialogTitle><DialogDescription>{detail.author} · {detail.publisher}<br/>{detail.isbn?`ISBN ${detail.isbn}`:'ISBN 없음 · 가상 예시 도서'}</DialogDescription><p className="description">{detail.description||'제공된 책 소개가 없습니다.'}</p><OfferTable book={detail}/><p className="help">{catalog.demo?'모든 가격과 배송 조건은 가상 예시입니다.':`조회 ${catalog.fetchedAt?new Date(catalog.fetchedAt).toLocaleString('ko-KR'):''} · 네이버는 개별 서점이 아닌 도서 가격 정보입니다. 배송비가 없으면 총액을 계산하지 않습니다.`}</p>{!catalog.demo&&<StoreLinks query={detail.isbn||detail.title}/>}</>}</DialogContent></Dialog>
  <Dialog open={compareOpen} onOpenChange={setCompareOpen}><DialogContent className="book-dialog"><DialogTitle>선택한 도서 비교</DialogTitle><DialogDescription>서로 다른 도서의 구매 예산을 비교합니다. 서점별 가격은 각 도서 상세에서 확인하세요.</DialogDescription><Table><TableHeader><TableRow><TableHead>도서</TableHead><TableHead>분야</TableHead><TableHead>확인된 최적 총액</TableHead></TableRow></TableHeader><TableBody>{compared.map(book=><TableRow key={book.id}><TableCell className="wrap-cell">{book.title}</TableCell><TableCell>{book.category}</TableCell><TableCell>{money(bestOffer(book.offers)?.total)}</TableCell></TableRow>)}</TableBody></Table>{catalog.demo&&<p className="help">예시 데이터 · 실제 구매 정보가 아닙니다.</p>}</DialogContent></Dialog>
 </main>;
}
function OfferTable({book}:{book:Book}) {const best=bestOffer(book.offers);return <Table><TableHeader><TableRow><TableHead>판매처 / 출처</TableHead><TableHead>상품가</TableHead><TableHead>배송비</TableHead><TableHead>총액</TableHead><TableHead>확인</TableHead></TableRow></TableHeader><TableBody>{book.offers.map(offer=><TableRow key={offer.store}><TableCell>{offer.store}{best?.store===offer.store&&<span className="best-label">최적</span>}</TableCell><TableCell>{offer.available?money(offer.price):'판매 확인 필요'}</TableCell><TableCell>{offer.shipping===0?'무료':money(offer.shipping)}</TableCell><TableCell>{offer.available&&offer.kind==='seller'&&offer.shipping!==null?money(offer.price+offer.shipping):'확인 필요'}</TableCell><TableCell>{safeUrl(offer.url)?<a className="text-button" href={safeUrl(offer.url)} target="_blank" rel="noreferrer">보러 가기 ↗</a>:'예시'}</TableCell></TableRow>)}</TableBody></Table>;}
