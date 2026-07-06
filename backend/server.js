import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import questionRoutes from './routes/questionRoutes.js'
import {notFound,errorHandler} from './middleware/errorMiddleware.js'
import answerRoutes from './routes/answerRoutes.js'
import userRoutes from './routes/userRoutes.js'

const app =express()

connectDB()

app.use(express.json())

app.use(express.urlencoded({extended:true}))



// Update the CORS configuration in server.js
// Replace the existing cors() call with:

app.use(cors({
  origin: function (origin, callback) {
    // Allow these origins
    const allowedOrigins = [
      'https://doubt-solver-steel.vercel.app',  // your Vercel URL
      'http://localhost:5173',                   // local dev
      'http://localhost:3000',                   // local dev alt
    ]

    // Allow requests with no origin (Postman, Render health checks)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log('CORS blocked origin:', origin)
      callback(new Error(`CORS blocked: ${origin}`))
    }
  },
  methods:      ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
}))

// Handle preflight requests explicitly


// Already in server.js — make sure this exists:
app.get('/', (req, res) => {
  res.json({
    message: 'Doubt Solver API is running',
    version: '1.0.0',
    status:  'healthy',
    env:     process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/answers', answerRoutes)
app.use('/api/users', userRoutes)

app.use(notFound)
app.use(errorHandler)


const PORT = 3000

app.listen(PORT,()=>{
    console.log(`
  ┌─────────────────────────────────────────┐
  │   Doubt Solver Backend                  │
  │   Server running on port ${PORT}        │
  │   Environment: ${process.env.NODE_ENV}  │
  └─────────────────────────────────────────┘
  `)
})


process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing MongoDB connection...')
  await mongoose.connection.close()
  console.log('MongoDB connection closed. Server shutting down.')
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing MongoDB connection...')
  await mongoose.connection.close()
  console.log('MongoDB connection closed. Server shutting down.')
  process.exit(0)
})
