import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

const ChooseUsername = () => {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSetUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) {
      setError('Vul een gebruikersnaam in')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (!user || userError) {
        setError('Niet ingelogd')
        return
      }
      // Sla username op in een profiles tabel
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        username,
        updated_at: new Date().toISOString(),
      })
      if (error) {
        setError(error.message)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError('Er is een onverwachte fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Kies een gebruikersnaam
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSetUsername}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Gebruikersnaam</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Gebruikersnaam"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChooseUsername
