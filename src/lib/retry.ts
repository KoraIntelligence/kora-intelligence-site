// src/lib/retry.ts
// Exponential backoff retry wrapper for OpenAI API calls.
// Retries on 429 (rate limit) and 5xx (server errors).
// Does NOT retry on 4xx client errors (bad request, auth, etc.)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  { maxRetries = 3, baseDelayMs = 1000 }: RetryOptions = {}
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const isLastAttempt = attempt === maxRetries;

      if (isLastAttempt) throw err;

      const status = err?.status ?? err?.statusCode ?? 0;

      if (status === 429) {
        // Rate limited — exponential backoff
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.warn(`⏳ OpenAI rate limit (429). Retry ${attempt + 1}/${maxRetries} in ${delay}ms`);
        await sleep(delay);
        continue;
      }

      if (status >= 500) {
        // Server error — shorter backoff
        const delay = baseDelayMs;
        console.warn(`⏳ OpenAI server error (${status}). Retry ${attempt + 1}/${maxRetries} in ${delay}ms`);
        await sleep(delay);
        continue;
      }

      // Client error (4xx) — don't retry, fail immediately
      throw err;
    }
  }

  // TypeScript: this line is unreachable but satisfies the return type
  throw new Error("withRetry: exhausted retries");
}
