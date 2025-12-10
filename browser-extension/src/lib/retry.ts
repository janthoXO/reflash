export function retry<T>(fn: () => Promise<T>, retries: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const attempt = (n: number) => {
      fn()
        .then(resolve)
        .catch((error) => {
          if (n > 0) {
            // Exponential backoff with jitter
            // Base delay: 1s, 2s, 4s...
            const baseDelay = 1000 * Math.pow(2, n - 1)
            // Jitter: +/- 20%
            const jitter = baseDelay * 0.2 * (Math.random() * 2 - 1)
            const delay = baseDelay + jitter
            setTimeout(() => attempt(n - 1), delay)
          } else {
            reject(error)
          }
        })
    }
    attempt(retries)
  })
}
