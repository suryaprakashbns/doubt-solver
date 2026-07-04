// ─────────────────────────────────────────────
// main.jsx
//
// The true entry point of the React application.
// This file does three things:
// 1. Imports global CSS (Tailwind)
// 2. Wraps the app with necessary Providers
// 3. Renders the app into the HTML document
//
// ORDER OF PROVIDERS MATTERS:
// BrowserRouter must wrap AuthProvider because
// AuthProvider uses useNavigate() — a React Router
// hook that only works inside a Router context.
// AuthProvider must wrap App because App contains
// components that call useAuth().
//
// Think of it like nested containers:
// BrowserRouter > AuthProvider > App
// ─────────────────────────────────────────────

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*
      BrowserRouter: enables React Router throughout the app.
      Uses the HTML5 History API (pushState) to manage
      URLs without full page reloads.
    */}
    <BrowserRouter>
      {/*
        AuthProvider: makes auth state available everywhere.
        Must be INSIDE BrowserRouter because it uses useNavigate.
      */}
      <AuthProvider>
        {/*
          App: the actual application with all routes.
          Must be INSIDE AuthProvider because pages
          and components use useAuth().
        */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)