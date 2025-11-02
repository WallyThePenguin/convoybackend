import { randomUUID } from 'node:crypto'
import db from '../db.js'

export const getSubscriberByEmail = (email) => {
  return db
    .prepare(
      `
        SELECT id, email, name, source, is_confirmed AS isConfirmed,
               created_at AS createdAt, confirmed_at AS confirmedAt
        FROM subscribers
        WHERE email = ?
      `,
    )
    .get(email)
}

export const createSubscriber = ({ email, name, source }) => {
  const existing = getSubscriberByEmail(email)
  if (existing) {
    return { duplicate: true, subscriber: existing }
  }

  const id = randomUUID()
  const now = new Date().toISOString()

  db.prepare(
    `
      INSERT INTO subscribers (id, email, name, source, created_at)
      VALUES (@id, @email, @name, @source, @created_at)
    `,
  ).run({
    id,
    email,
    name,
    source,
    created_at: now,
  })

  return {
    duplicate: false,
    subscriber: {
      id,
      email,
      name,
      source,
      isConfirmed: 0,
      createdAt: now,
      confirmedAt: null,
    },
  }
}

export const getNewsletterStats = () => {
  const total = db.prepare('SELECT COUNT(1) AS count FROM subscribers').get()
    .count

  const confirmed = db
    .prepare(
      `
        SELECT COUNT(1) AS count
        FROM subscribers
        WHERE is_confirmed = 1
      `,
    )
    .get().count

  const last24h = db
    .prepare(
      `
        SELECT COUNT(1) AS count
        FROM subscribers
        WHERE created_at >= datetime('now', '-24 hours')
      `,
    )
    .get().count

  return {
    total,
    confirmed,
    last24Hours: last24h,
  }
}

export const listSubscribers = ({ limit, offset }) => {
  return db
    .prepare(
      `
        SELECT id, email, name, source, is_confirmed AS isConfirmed,
               created_at AS createdAt, confirmed_at AS confirmedAt
        FROM subscribers
        ORDER BY datetime(created_at) DESC
        LIMIT @limit OFFSET @offset
      `,
    )
    .all({ limit, offset })
}
