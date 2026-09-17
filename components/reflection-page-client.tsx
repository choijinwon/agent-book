'use client';
import {WorkReflectionPanel} from './work-reflection';
export function ReflectionPageClient(){return <WorkReflectionPanel onSearch={q=>{window.location.assign(`/?q=${encodeURIComponent(q)}`);}}/>;}
