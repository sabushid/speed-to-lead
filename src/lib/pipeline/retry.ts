import { logger } from "@/lib/utils/logger";
import { sleep } from "@/lib/utils/dates";

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; stepName?: string } = {}
): Promise<T> {
  const { maxRetries = 3, stepName = "unknown" } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;

      logger.warn(
        { stepName, attempt, maxRetries, error: String(error) },
        `Step failed (attempt ${attempt}/${maxRetries})`
      );

      if (isLastAttempt) throw error;

      const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await sleep(delayMs);
    }
  }

  throw new Error("Unreachable");
}
