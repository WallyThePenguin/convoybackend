import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const NODE_ENV = process.env.NODE_ENV || 'development'

const defaultDatabaseFile = path.resolve(__dirname, '../data/convoy.sqlite')

export const DATABASE_FILE =
  process.env.DATABASE_FILE && process.env.DATABASE_FILE.trim().length > 0
    ? process.env.DATABASE_FILE
    : defaultDatabaseFile

export const ADMIN_API_KEY =
  process.env.ADMIN_API_KEY && process.env.ADMIN_API_KEY.trim().length > 0
    ? process.env.ADMIN_API_KEY
    : 'dev-admin-key'

export const SERVER_PORT = Number.parseInt(process.env.PORT ?? '4000', 10)
