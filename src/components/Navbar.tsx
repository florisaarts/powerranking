import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

interface NavbarProps {
  user: User
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const location = useLocation()

  const handleSignOut = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      // Demo mode - clear demo user
      localStorage.removeItem('demoUser')
      window.location.reload()
    } else {
      // Real Supabase mode
      await supabase.auth.signOut()
    }
  }

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-primary-dark' : 'hover:bg-gray-700'
  }

  return (
    <nav className="bg-gray-800 text-white fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/dashboard" className="text-xl font-bold text-primary">
              💪 PowerRanking
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard')}`}
              >
                Dashboard
              </Link>
              <Link
                to="/ranking"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/ranking')}`}
              >
                Rankings
              </Link>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300 hidden sm:block">
              {user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-300 hover:text-white focus:outline-none focus:text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-700">
          <Link
            to="/dashboard"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/dashboard')}`}
          >
            Dashboard
          </Link>
          <Link
            to="/ranking"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/ranking')}`}
          >
            Rankings
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
