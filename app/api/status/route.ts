import { keys } from '@/lib/api';
export function GET() {const k=keys();return Response.json({aladin:!!k.ALADIN_TTB_KEY,naver:!!(k.NAVER_CLIENT_ID&&k.NAVER_CLIENT_SECRET)},{headers:{'Cache-Control':'no-store'}});}
