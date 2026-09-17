import type { AIKeys } from './recommend';

// Read server credentials at request time; never expose them in client bundles.
export function runtimeKeys(): AIKeys {
  return {
    NAVER_CLIENT_ID: process.env.NAVER_CLIENT_ID,
    NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET,
    ALADIN_TTB_KEY: process.env.ALADIN_TTB_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
  };
}
