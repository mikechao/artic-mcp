export class RateLimiter {
  private requestTimestamps: number[] = [];
  private maxRequestsPerWindow: number;
  private windowMs: number;
  private isWaiting: boolean = false;
  private waitQueue: Array<() => void> = [];

  constructor(maxRequestsPerWindow: number, windowMs: number = 60000) {
    this.maxRequestsPerWindow = maxRequestsPerWindow;
    this.windowMs = windowMs;
  }

  async fetch(url: string | URL, options?: RequestInit): Promise<Response> {
    await this.acquireToken();

    try {
      return await fetch(url, options);
    }
    catch (error) {
      // For certain errors like network failures, don't count against rate limit
      if (error instanceof TypeError) {
        this.releaseToken(); // Remove the timestamp we added
      }
      throw error;
    }
  }

  private async acquireToken(): Promise<void> {
    // Clean up old timestamps outside the window
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => now - timestamp < this.windowMs,
    );

    // Check if we're at the limit
    if (this.requestTimestamps.length >= this.maxRequestsPerWindow) {
      // Calculate how long to wait
      const oldestTimestamp = this.requestTimestamps[0];
      const timeToWait = this.windowMs - (now - oldestTimestamp);

      if (timeToWait > 0) {
        console.error(`Rate limit reached. Waiting ${timeToWait}ms before next request`);
        await this.waitInQueue(timeToWait);
        // After waiting, try again (recursive call) to ensure we're still under the limit
        return this.acquireToken();
      }
    }

    // Add current timestamp to the list
    this.requestTimestamps.push(now);
  }

  private releaseToken(): void {
    // Remove the most recent timestamp
    if (this.requestTimestamps.length > 0) {
      this.requestTimestamps.pop();
    }
  }

  private async waitInQueue(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.isWaiting) {
        this.waitQueue.push(resolve);
        return;
      }

      this.isWaiting = true;

      setTimeout(() => {
        this.isWaiting = false;
        resolve();

        // Process all eligible requests in the queue
        while (
          this.waitQueue.length > 0
          && this.requestTimestamps.length < this.maxRequestsPerWindow
        ) {
          const next = this.waitQueue.shift();
          if (next)
            next();
        }
      }, ms);
    });
  }
}

/**
 * Create and export a singleton instance for Art Institute of Chicago API
 *
 * Limited to 60 requests per minute per their documentation
 * https://api.artic.edu/docs/#authentication
 */
export const articRateLimiter = new RateLimiter(60, 60000);
