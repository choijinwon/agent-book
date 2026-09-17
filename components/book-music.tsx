"use client";
import {Headphones,ArrowUpRight} from 'lucide-react';
import {musicForBook} from '@/lib/book-music';
import type {Book} from '@/lib/books';
export function BookMusic({book}:{book:Book}){
 const music=musicForBook(book);
 if(!music)return <p className="music-unavailable"><Headphones size={13}/>이 책과 연결되는 K-pop은 아직 선정하지 못했어요.</p>;
 return <details className="book-music"><summary><Headphones size={16}/><span><small>K-pop · {music.theme}</small><strong>{music.title}<i> · {music.artist}</i></strong></span><span className="music-plus">+</span></summary><div className="music-content"><p className="music-relation">{music.reason}</p><dl className="music-evidence"><dt>책에서 확인한 내용</dt><dd>{music.bookEvidence}<a href={music.bookSource} target="_blank" rel="noreferrer">도서 근거 ↗</a></dd><dt>음악과 연결되는 지점</dt><dd>{music.musicEvidence}<a href={music.musicSource} target="_blank" rel="noreferrer">음악 근거 ↗</a></dd></dl><a className="music-track" href={music.listenUrl} target="_blank" rel="noreferrer" aria-label={`${music.title} YouTube Music에서 찾기`}><span><b>{music.title}</b><small>{music.artist} · {music.style}</small></span><span className="music-service">YouTube Music <ArrowUpRight size={13}/></span></a><p className="music-note">자료를 확인해 선정한 연관 음악입니다. ‘주제 해석’은 공통 소재에 대한 선곡자의 해석입니다. YouTube Music 검색 결과에서 음원을 선택하세요.</p></div></details>;
}
