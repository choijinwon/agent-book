export type Offer = { store: string; checkedAt?: string; price: number; shipping: number | null; url: string; kind: "seller" | "aggregate"; available: boolean };
export type Book = { id: string; isbn: string; title: string; author: string; publisher: string; category: string; description: string; sourceUrl?: string; cover?: string; rank?: number; offers: Offer[] };
export function money(value: number | undefined | null) { return value == null ? "확인 필요" : `${value.toLocaleString("ko-KR")}원`; }
export function bestOffer(offers: Offer[]) {
  return offers.filter(o=>o.kind === "seller" && o.available && Number.isFinite(o.price) && o.price > 0 && o.shipping !== null && Number.isFinite(o.shipping) && o.shipping >= 0).map(o=>({...o,total:o.price+o.shipping!})).sort((a,b)=>a.total-b.total)[0];
}
export function safeUrl(raw: unknown): string {
  try { const u = new URL(String(raw)); return u.protocol === "https:" || u.protocol === "http:" ? u.href : ""; } catch { return ""; }
}
export function normalizeIsbn(raw: string) { return raw.trim().split(/\s+/).map(s=>s.replace(/-/g,"")).find(s=>/^97[89]\d{10}$/.test(s) && [...s].reduce((sum,d,i)=>sum+Number(d)*(i%2?3:1),0)%10===0) || ""; }
export function mergeBooks(groups: Book[][]) {
  const map = new Map<string, Book>();
  for (const b of groups.flat()) {
    const key = b.isbn || b.id;
    const previous = map.get(key);
    if (previous) { previous.offers.push(...b.offers.filter(o=>!previous.offers.some(p=>p.store===o.store))); }
    else map.set(key,{...b,offers:[...b.offers]});
  }
  return [...map.values()];
}
// All catalog records, prices and ranks below are explicitly fictional fixtures.
export const demoBooks: Book[] = [
  ["문장 사이를 걷는 시간","김서하","소설","페이지숲",14400],
  ["작은 습관의 기록","이도윤","자기계발","매일의책",16200],
  ["우리가 별을 읽는 방식","박유진","과학","궤도출판",19800],
  ["혼자여도 좋은 오후","정하림","에세이","여백",13500],
  ["경제를 읽는 첫 번째 질문","윤재원","경제·경영","생각의선",18000],
  ["다정한 기술의 미래","최서진","IT·컴퓨터","코드북",22500],
].map((row,i)=>({id:`demo-${i}`,isbn:"",title:String(row[0]),author:String(row[1]),category:String(row[2]),publisher:String(row[3]),description:"화면과 가격 비교를 체험하기 위한 가상의 예시 도서입니다. 실제 판매 상품이나 베스트셀러 정보가 아닙니다.",rank:i+1,offers:[
  {store:"예시 서점 A",price:Number(row[4]),shipping:i%2?0:2500,url:"",kind:"seller",available:true},
  {store:"예시 서점 B",price:Number(row[4])+1000,shipping:0,url:"",kind:"seller",available:true},
  {store:"예시 서점 C",price:Number(row[4])-1000,shipping:3000,url:"",kind:"seller",available:true},
]}));
