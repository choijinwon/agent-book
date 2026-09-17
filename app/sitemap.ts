import type {MetadataRoute} from 'next';
import books from '@/data/discovery.json';
import {siteUrl} from '@/lib/seo';
export default function sitemap():MetadataRoute.Sitemap {
 return [{url:siteUrl+'/'},{url:siteUrl+'/books'},{url:siteUrl+'/reading-journal'},{url:siteUrl+'/work-reflection'},...books.filter(b=>/^\d{13}$/.test(b.isbn)).map(b=>({url:`${siteUrl}/books/${b.isbn}`}))];
}
