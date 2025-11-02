export const sendSuccess = (res, status, data) => {
  res.status(status).json({ data })
}

export const sendError = (res, status, code, message, details) => {
  const payload = { error: { code, message } }
  if (details) {
    payload.error.details = details
  }
  res.status(status).json(payload)
}
