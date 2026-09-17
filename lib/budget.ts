import {bestOffer,type Book} from './books.ts';
export type BudgetBasis='book'|'total';
export function budgetPrice(book:Book,basis:BudgetBasis):number|undefined {
 if(basis==='total')return bestOffer(book.offers)?.total;
 const prices=book.offers.filter(o=>o.kind==='seller'&&o.available&&Number.isFinite(o.price)&&o.price>0).map(o=>o.price);
 return prices.length?Math.min(...prices):undefined;
}
export function withinBudget(book:Book,basis:BudgetBasis,limit:string){
 if(limit==='all')return true;
 const value=budgetPrice(book,basis);return value!==undefined&&value<=Number(limit);
}
