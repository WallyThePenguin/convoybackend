const buckets = new Map()

export const rateLimiter = ({ windowMs = 60_000, max = 10 } = {}) => {
  return (req, res, next) => {
    const now = Date.now()
    const key = req.ip ?? req.connection?.remoteAddress ?? 'unknown'
    const entry = buckets.get(key) ?? { count: 0, expiresAt: now + windowMs }

    if (entry.expiresAt <= now) {
      entry.count = 0
      entry.expiresAt = now + windowMs
    }

    entry.count += 1
    buckets.set(key, entry)

    if (entry.count > max) {
      const retryAfterSeconds = Math.ceil((entry.expiresAt - now) / 1000)
      res.setHeader('Retry-After', retryAfterSeconds)
      return res.status(429).json({
        error: {
          code: 'too_many_requests',
          message: 'Too many requests. Try again in a moment.',
        },
      })
    }

    return next()
  }
}
