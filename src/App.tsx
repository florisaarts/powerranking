import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import ChooseUsername from './pages/ChooseUsername'
import Dashboard from './pages/Dashboard'
import Ranking from './pages/Ranking'
import GroupDetail from './pages/GroupDetail'
import Profile from './pages/Profile'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Debug logging for deployment
  console.log('PowerRanking App starting...', {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    mode: import.meta.env.MODE
  })

  useEffect(() => {
    // Get Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes on auth state (logged in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar user={user} />}
        <main className={user ? "pt-16" : ""}>
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/dashboard" replace />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register /> : <Navigate to="/dashboard" replace />} 
            />
            <Route 
              path="/choose-username" 
              element={user ? <ChooseUsername /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/ranking" 
              element={user ? <Ranking /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/group/:groupId" 
              element={user ? <GroupDetail /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/profile/:userId" 
              element={user ? <Profile user={user} /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/" 
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
