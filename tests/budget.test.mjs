import test from 'node:test';import assert from 'node:assert/strict';
import {budgetPrice,withinBudget} from '../lib/budget.ts';
const book=(price,shipping)=>({offers:[{kind:'seller',available:true,price,shipping}]});
test('book budget includes boundary and excludes higher prices',()=>{assert.ok(withinBudget(book(20000,null),'book','20000'));assert.equal(withinBudget(book(20001,0),'book','20000'),false);});
test('shipping is counted and unknown shipping is never treated as free',()=>{assert.equal(withinBudget(book(18000,3000),'total','20000'),false);assert.equal(withinBudget(book(18000,null),'total','20000'),false);assert.ok(withinBudget(book(18000,2000),'total','20000'));});
test('unknown, unavailable and non-seller prices do not pass a capped budget',()=>{assert.equal(budgetPrice({offers:[]},'book'),undefined);for(const offer of [{kind:'seller',available:true,price:0},{kind:'aggregate',available:true,price:100},{kind:'seller',available:false,price:100}])assert.equal(withinBudget({offers:[offer]},'book','20000'),false);assert.ok(withinBudget({offers:[]},'book','all'));});
