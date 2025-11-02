import { Router } from 'express'
import { newsletterInputSchema, paginationSchema } from '../lib/validators.js'
import { sendSuccess, sendError } from '../lib/responses.js'
import {
  createSubscriber,
  getNewsletterStats,
  listSubscribers,
} from '../repositories/newsletterRepository.js'
import { rateLimiter } from '../middleware/rateLimiter.js'
import { requireAdminKey } from '../middleware/adminKey.js'

const router = Router()

router.post(
  '/',
  rateLimiter({ windowMs: 60_000, max: 5 }),
  (req, res) => {
    const parseResult = newsletterInputSchema.safeParse(req.body)

    if (!parseResult.success) {
      return sendError(
        res,
        400,
        'invalid_payload',
        'Invalid newsletter signup payload.',
        parseResult.error.issues,
      )
    }

    const { duplicate, subscriber } = createSubscriber(parseResult.data)

    if (duplicate) {
      return sendError(
        res,
        409,
        'duplicate_subscriber',
        'This email is already subscribed.',
      )
    }

    return sendSuccess(res, 201, {
      subscriber,
      message: 'Thanks for subscribing. You are on the list!',
    })
  },
)

router.get('/stats', requireAdminKey, (req, res) => {
  const stats = getNewsletterStats()
  return sendSuccess(res, 200, stats)
})

router.get('/', requireAdminKey, (req, res) => {
  const parseResult = paginationSchema.safeParse({
    page: req.query.page ?? '1',
    limit: req.query.limit ?? '25',
  })

  if (!parseResult.success) {
    return sendError(
      res,
      400,
      'invalid_query',
      'Invalid pagination parameters.',
      parseResult.error.issues,
    )
  }

  const { page, limit } = parseResult.data
  const offset = (page - 1) * limit
  const subscribers = listSubscribers({ limit, offset })

  return sendSuccess(res, 200, {
    page,
    limit,
    count: subscribers.length,
    subscribers,
  })
})

export default router
