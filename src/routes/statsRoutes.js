import { Router } from 'express'
import { getNewsletterStats } from '../repositories/newsletterRepository.js'
import { getApplicationStats } from '../repositories/applicationRepository.js'
import { sendSuccess } from '../lib/responses.js'

const router = Router()

router.get('/summary', (req, res) => {
  const newsletter = getNewsletterStats()
  const applications = getApplicationStats()

  return sendSuccess(res, 200, {
    newsletter: {
      total: newsletter.total,
      last24Hours: newsletter.last24Hours,
    },
    applications: {
      total: applications.total,
      last24Hours: applications.last24Hours,
    },
    generatedAt: new Date().toISOString(),
  })
})

export default router
