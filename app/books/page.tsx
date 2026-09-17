import type {Metadata} from 'next';
import Link from 'next/link';
import {pageMetadata} from '@/lib/seo';
import books from '@/data/discovery.json';
export const metadata:Metadata=pageMetadata('/books','도서 목록 · 제목과 저자로 책 찾기','수집한 도서의 제목, 저자, 분야와 소개를 한눈에 살펴보세요.');
export default function Books(){return <main className="shell catalog-page"><nav aria-label="경로"><Link href="/">agentbook 홈</Link></nav><h1>도서 목록</h1><p>공개 상품 정보에서 수집한 {books.length}권입니다. 책별 소개와 출처를 확인하고, 홈에서 상황에 맞는 책을 찾아보세요.</p><div className="catalog-grid">{books.map(b=><article key={b.isbn}><span className="category">{b.category}</span><h2><Link href={`/books/${b.isbn}`}>{b.title}</Link></h2><p>{b.author} · {b.publisher}</p></article>)}</div></main>}
