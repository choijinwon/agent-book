import test from 'node:test';import assert from 'node:assert/strict';
import {bookDates,dateRound,readDateSaves} from '../lib/book-date.ts';
test('questions resolve to verified books without disclosing their titles',()=>{assert.equal(bookDates.length,6);for(const d of bookDates){assert.ok(d.book.isbn);assert.ok(d.book.sourceUrl);assert.ok(!d.question.includes(d.book.title));}});
test('rounds contain unique choices and rotate through all books',()=>{assert.equal(new Set(dateRound(0).map(d=>d.id)).size,3);assert.equal(new Set([...dateRound(0),...dateRound(3)].map(d=>d.id)).size,6);assert.deepEqual(dateRound(6),dateRound(0));});
test('saved entries accept only known ISBNs and recover from malformed storage',()=>{const isbn=bookDates[0].book.isbn;assert.deepEqual(readDateSaves(JSON.stringify([isbn,isbn,'unknown',{},null])),[isbn]);assert.deepEqual(readDateSaves('{'),[]);assert.deepEqual(readDateSaves('{}'),[]);});
