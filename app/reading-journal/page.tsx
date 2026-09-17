import type {Metadata} from 'next';
import Link from 'next/link';
import {ReadingJournal} from '@/components/reading-journal';
import {pageMetadata,breadcrumbJsonLd,jsonLd} from '@/lib/seo';
export const metadata:Metadata=pageMetadata('/reading-journal','독서 기록·독서 목표와 나만의 3D 책장','읽고 싶은 책, 읽는 중인 책, 완독한 책을 3D 책장에 정리하세요. 책별 별점과 감상, 읽은 페이지를 기록하고 연간 독서 목표를 관리할 수 있습니다.');
export default function Page(){return <main className="shell catalog-page"><nav aria-label="경로"><Link href="/">에이전트북 홈</Link> / <span>독서 기록</span></nav><h1>독서 기록과 나만의 3D 책장</h1><p>읽고 싶은 책부터 완독한 책까지 한곳에 모으세요. 책의 위치와 선반을 바꾸고, 읽은 페이지와 별점, 감상을 남길 수 있습니다.</p><p>연간 독서 목표는 완독 날짜가 있는 기록을 기준으로 집계합니다. 기록은 현재 브라우저에 저장되며, 기존에 홈 책장에서 작성한 기록도 여기서 이어집니다.</p><ReadingJournal initialBook={null}/><nav className="seo-links" aria-label="관련 서비스"><Link href="/books">제목·저자로 도서 목록 살펴보기</Link><Link href="/work-reflection">퇴근 후 마음 정리</Link></nav><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(breadcrumbJsonLd([{name:'독서 기록',path:'/reading-journal'}]))}}/></main>}
