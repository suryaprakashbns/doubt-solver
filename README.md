# Doubt Solver — Junior-Senior Q&A Platform

A full-stack MERN application where juniors post doubts and seniors answer them.
Similar to StackOverflow, built for college students.

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Axios  
**Backend:** Node.js, Express.js, MongoDB, Mongoose  
**Auth:** JWT, bcrypt  
**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

## Features

- User registration and login with role selection (junior/senior)
- Post, edit, delete questions with tags
- Post, edit, delete answers
- Search and filter questions
- Upvotes and reputation system
- User profiles

## Local Setup

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Environment Variables

See `.env.example` files in both `backend/` and `frontend/` folders.