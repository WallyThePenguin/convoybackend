import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import './db.js'
import { NODE_ENV, SERVER_PORT } from './config.js'
import newsletterRoutes from './routes/newsletterRoutes.js'
import applicationRoutes from './routes/applicationRoutes.js'
import statsRoutes from './routes/statsRoutes.js'

const app = express()

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-admin-key'],
  }),
)
app.use(express.json({ limit: '256kb' }))
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'))

app.get('/api/health', (req, res) => {
  res.json({
    data: {
      status: 'ok',
      environment: NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  })
})

app.use('/api/newsletter', newsletterRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/stats', statsRoutes)

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'not_found',
      message: 'The requested resource was not found.',
    },
  })
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({
    error: {
      code: 'internal_error',
      message: 'Something went wrong. Please try again later.',
    },
  })
})

app.listen(SERVER_PORT, () => {
  if (NODE_ENV !== 'test') {
    console.log(`Server listening on port ${SERVER_PORT}`)
  }
})
