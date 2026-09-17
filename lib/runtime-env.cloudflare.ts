import { env } from 'cloudflare:workers';
import type { AIKeys } from './recommend';

// The Sites Vite build selects this adapter instead of the Node adapter.
export function runtimeKeys(): AIKeys {
  return env as unknown as AIKeys;
}
