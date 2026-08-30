import { Request, Response, NextFunction } from 'express'

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[ERROR]', err)

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.name,
      },
    })
  }

  res.status(500).json({
    success: false,
    error: {
      message: 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR',
    },
  })
}
