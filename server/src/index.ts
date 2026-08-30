import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// ============ Middleware ============

// Security Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
)

// Rate Limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests, please try again later.',
})
app.use(limiter)

// Body Parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ============ Routes ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Import routes here when ready
// app.use('/api/auth', authRoutes)
// app.use('/api/users', userRoutes)

// ============ Error Handling ============

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err)
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
    },
  })
})

// ============ Start Server ============

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`)
})
