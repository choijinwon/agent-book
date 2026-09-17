import type {MetadataRoute} from 'next';
import books from '@/data/discovery.json';
import {siteUrl} from '@/lib/seo';
export default function sitemap():MetadataRoute.Sitemap {
 return [{url:siteUrl+'/'},{url:siteUrl+'/books'},...books.filter(b=>/^\d{13}$/.test(b.isbn)).map(b=>({url:`${siteUrl}/books/${b.isbn}`}))];
}
