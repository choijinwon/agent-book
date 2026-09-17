"use client";
import {Headphones,ArrowUpRight} from 'lucide-react';
import {musicForBook} from '@/lib/book-music';
import type {Book} from '@/lib/books';
export function BookMusic({book}:{book:Book}){
 const music=musicForBook(book);
 return <details className="book-music"><summary><Headphones size={16}/><span><small>이 책과 함께 듣기</small><strong>{music.tracks[0].title}<i> · {music.tracks[0].artist}</i></strong></span><span className="music-plus">+</span></summary><div className="music-content"><p>{music.reason}</p>{music.tracks.map(track=><a className="music-track" key={track.id} href={track.listenUrl} target="_blank" rel="noreferrer" aria-label={`${track.artist}의 ${track.title} YouTube Music에서 찾기`}><span><b>{track.title}</b><small>{track.artist} · {track.style}</small></span><span className="music-service">YouTube Music <ArrowUpRight size={13}/></span></a>)}<p className="music-note">{music.basis} · 감상 취향에 따른 추천입니다. YouTube Music에서 곡명·아티스트를 검색합니다. 검색 결과에서 원하는 음원을 선택해 주세요.</p></div></details>;
}
