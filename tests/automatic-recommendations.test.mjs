import test from 'node:test';
import assert from 'node:assert/strict';
import {automaticRecommendations} from '../lib/automatic-recommendations.ts';
test('first visit immediately gets three distinct real books',()=>{const r=automaticRecommendations([],0,Date.parse('2026-09-17T04:00:00Z'));assert.equal(r.items.length,3);assert.equal(new Set(r.items.map(x=>x.book.isbn)).size,3);assert.equal(r.matched,false);assert.equal(r.items[0].book.title,'불편한 편의점');});
test('recent topic moves a related book first; unknown topic does not pretend to match',()=>{assert.match(automaticRecommendations(['돈 경제']).items[0].book.title,/돈의 심리학/);assert.equal(automaticRecommendations(['없는주제']).matched,false);});
test('rotation changes books and expired prices are hidden',()=>{const first=automaticRecommendations([],0);const next=automaticRecommendations([],3,Date.parse('2027-01-01'));assert.notDeepEqual(first.items.map(x=>x.book.id),next.items.map(x=>x.book.id));assert.ok(next.items.every(x=>x.book.offers.length===0));});
