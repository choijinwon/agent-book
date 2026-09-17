import type {Metadata} from 'next';
import Link from 'next/link';
import {ReflectionPageClient} from '@/components/reflection-page-client';
import {pageMetadata,breadcrumbJsonLd,jsonLd} from '@/lib/seo';
export const metadata:Metadata=pageMetadata('/work-reflection','퇴근 후 마음 정리 · 직장 고민 기록과 관련 책 찾기','직장 인간관계, 업무량, 보상, 성장과 진로 고민을 정리해 보세요. 필요한 도움에 맞는 작은 행동을 살펴보고 관련 책을 찾으며 나의 생각을 기록합니다.');
export default function Page(){return <main className="shell catalog-page"><nav aria-label="경로"><Link href="/">에이전트북 홈</Link> / <span>퇴근 후 마음 정리</span></nav><h1>직장 고민을 기록하고, 책에서 다른 관점 찾기</h1><p>사람 관계, 업무량, 보상, 성장 정체, 일이 맞지 않는다는 느낌 중 지금 힘든 이유를 골라보세요. 위로받기부터 이직 준비까지 필요한 도움에 따라 작은 행동과 도서 검색 주제를 제안합니다.</p><p>퇴사 여부를 판단하거나 마음 상태를 진단하는 서비스가 아닙니다. 내 선택을 위해 생각을 정리하는 공간이며, 개인 메모는 검색에 전달되지 않습니다.</p><ReflectionPageClient/><nav className="seo-links" aria-label="관련 서비스"><Link href="/books">도서 목록 살펴보기</Link><Link href="/reading-journal">독서 기록과 3D 책장</Link></nav><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(breadcrumbJsonLd([{name:'퇴근 후 마음 정리',path:'/work-reflection'}]))}}/></main>}
