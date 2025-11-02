import { Router } from 'express'
import { applicationInputSchema, paginationSchema } from '../lib/validators.js'
import { sendSuccess, sendError } from '../lib/responses.js'
import {
  createApplication,
  getApplicationStats,
  listApplications,
} from '../repositories/applicationRepository.js'
import { rateLimiter } from '../middleware/rateLimiter.js'
import { requireAdminKey } from '../middleware/adminKey.js'

const allowedStatuses = new Set(['new', 'reviewing', 'accepted', 'rejected'])

const router = Router()

router.post(
  '/',
  rateLimiter({ windowMs: 60_000, max: 5 }),
  (req, res) => {
    const parseResult = applicationInputSchema.safeParse(req.body)

    if (!parseResult.success) {
      return sendError(
        res,
        400,
        'invalid_payload',
        'Invalid application payload.',
        parseResult.error.issues,
      )
    }

    const application = createApplication(parseResult.data)

    return sendSuccess(res, 201, {
      application,
      message: 'Application received. We will be in touch soon.',
    })
  },
)

router.get('/stats', requireAdminKey, (req, res) => {
  const stats = getApplicationStats()
  return sendSuccess(res, 200, stats)
})

router.get('/', requireAdminKey, (req, res) => {
  const paginationResult = paginationSchema.safeParse({
    page: req.query.page ?? '1',
    limit: req.query.limit ?? '25',
  })

  if (!paginationResult.success) {
    return sendError(
      res,
      400,
      'invalid_query',
      'Invalid pagination parameters.',
      paginationResult.error.issues,
    )
  }

  const { page, limit } = paginationResult.data
  const status = req.query.status?.toString()

  if (status && !allowedStatuses.has(status)) {
    return sendError(
      res,
      400,
      'invalid_status',
      'Status filter must be one of new, reviewing, accepted, or rejected.',
    )
  }

  const offset = (page - 1) * limit
  const applications = listApplications({ limit, offset, status })

  return sendSuccess(res, 200, {
    page,
    limit,
    count: applications.length,
    applications,
  })
})

export default router
