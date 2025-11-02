import { randomUUID } from 'node:crypto'
import db from '../db.js'

export const createApplication = ({
  name,
  email,
  role_interest,
  experience,
  portfolio_url,
  message,
}) => {
  const id = randomUUID()
  const now = new Date().toISOString()

  db.prepare(
    `
      INSERT INTO applications (
        id, name, email, role_interest, experience,
        portfolio_url, message, created_at
      )
      VALUES (
        @id, @name, @email, @role_interest, @experience,
        @portfolio_url, @message, @created_at
      )
    `,
  ).run({
    id,
    name,
    email,
    role_interest,
    experience,
    portfolio_url,
    message,
    created_at: now,
  })

  return {
    id,
    name,
    email,
    role_interest,
    experience,
    portfolio_url,
    message,
    status: 'new',
    created_at: now,
  }
}

export const getApplicationStats = () => {
  const total = db.prepare('SELECT COUNT(1) AS count FROM applications').get()
    .count

  const byStatus = db
    .prepare(
      `
        SELECT status, COUNT(1) AS count
        FROM applications
        GROUP BY status
      `,
    )
    .all()
    .map((row) => ({ status: row.status, count: row.count }))

  const byRoleInterest = db
    .prepare(
      `
        SELECT role_interest AS roleInterest, COUNT(1) AS count
        FROM applications
        GROUP BY role_interest
        ORDER BY count DESC
      `,
    )
    .all()

  const last24h = db
    .prepare(
      `
        SELECT COUNT(1) AS count
        FROM applications
        WHERE created_at >= datetime('now', '-24 hours')
      `,
    )
    .get().count

  return { total, byStatus, byRoleInterest, last24Hours: last24h }
}

export const listApplications = ({ limit, offset, status }) => {
  const baseQuery = `
    SELECT
      id, name, email, role_interest AS roleInterest,
      experience, portfolio_url AS portfolioUrl,
      message, status, created_at AS createdAt
    FROM applications
  `

  if (status) {
    return db
      .prepare(
        `
          ${baseQuery}
          WHERE status = @status
          ORDER BY datetime(created_at) DESC
          LIMIT @limit OFFSET @offset
        `,
      )
      .all({ limit, offset, status })
  }

  return db
    .prepare(
      `
        ${baseQuery}
        ORDER BY datetime(created_at) DESC
        LIMIT @limit OFFSET @offset
      `,
    )
    .all({ limit, offset })
}
