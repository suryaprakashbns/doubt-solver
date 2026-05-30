import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import connectDB from './config/db.js'

import {notFound,errorHandler} from './middleware/errorMiddleware.js'

const app =express()

connectDB()

app.use(express.json())

app.use(express.urlencoded({extended:true}))



app.use(cors({
     origin: process.env.CLIENT_URL || 'http://localhost:5173',
     methods: ['GET','POST','PUT','DELETE','PATCH'],
     allowedHeaders:['Content-Type','Authorization'],
     credentials : true
}))

app.get('/',(req,res) => {
  res.json({
    message: 'Doubt solver API is running',
    version: '1.0.0',
    status: 'healthy',
  })
})

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
