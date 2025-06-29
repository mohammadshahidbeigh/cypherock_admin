import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login/Login'
import Signup from './components/Signup/Signup'
import './App.css'
import AdminDashboard from './components/AdminDashboard/AdminDashboard'
import { checkAuth } from './firebase'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

// interface Device {
//   deviceInfo: {
//     deviceId: string;
//     operator: string;
//   };
//   timestamp?: string;
// }

function App() {
  // Use boolean for auth state; could be user info if /me returns it
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  // Check auth status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true)
      const token = localStorage.getItem('jwt_token')
      if (token) {
        try {
          const res = await checkAuth(token)
          setAuthenticated(res.valid)
        } catch {
          setAuthenticated(false)
        }
      } else {
        setAuthenticated(false)
      }
      setLoading(false)
    }
    checkAuthStatus()
  }, [])

  const handleLogin = () => {
    setAuthenticated(true)
  }
  const handleSignup = () => {
    setAuthenticated(true)
  }
  const handleLogout = async () => {
    localStorage.removeItem('jwt_token')
    setAuthenticated(false)
  }

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          authenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/signup" element={
          authenticated ? <Navigate to="/dashboard" replace /> : <Signup onSignup={handleSignup} />
        } />
        <Route path="/dashboard" element={
          authenticated ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />
        } />
        <Route path="*" element={<Navigate to={authenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  )
}

export default App
