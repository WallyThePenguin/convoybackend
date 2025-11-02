import { ADMIN_API_KEY } from '../config.js'

export const requireAdminKey = (req, res, next) => {
  const headerKey = req.header('x-admin-key')

  if (!headerKey || headerKey !== ADMIN_API_KEY) {
    return res.status(401).json({
      error: {
        code: 'unauthorized',
        message: 'Admin key is missing or invalid.',
      },
    })
  }

  return next()
}
