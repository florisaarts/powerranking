import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'

interface ProfileProps {
  user: User
}

interface Profile {
  id: string
  username: string
  created_at: string
}

interface GroupMembership {
  id: string
  name: string
  description: string | null
  member_count: number
}

const Profile = ({ user }: ProfileProps) => {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [groups, setGroups] = useState<GroupMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isOwnProfile = userId === user.id

  useEffect(() => {
    loadProfile()
    loadGroups()
  }, [userId])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err: any) {
      console.error('Error loading profile:', err)
      setError('Profiel niet gevonden')
    } finally {
      setLoading(false)
    }
  }

  const loadGroups = async () => {
    try {
      // Haal groepen op waar deze gebruiker lid van is
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          groups (
            id,
            name,
            description,
            group_members (count)
          )
        `)
        .eq('user_id', userId)

      if (error) throw error

      // Transform de data
      const groupsData = data?.map((item: any) => ({
        id: item.groups.id,
        name: item.groups.name,
        description: item.groups.description,
        member_count: item.groups.group_members[0]?.count || 0
      })) || []

      setGroups(groupsData)
    } catch (err: any) {
      console.error('Error loading groups:', err)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar user={user} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Laden...</p>
          </div>
        </div>
      </>
    )
  }

  if (error || !profile) {
    return (
      <>
        <Navbar user={user} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profiel niet gevonden</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md"
            >
              Terug naar Dashboard
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar user={user} />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-4">
              {/* Avatar placeholder */}
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.username}</h1>
                <p className="text-gray-600">
                  Lid sinds {new Date(profile.created_at).toLocaleDateString('nl-NL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            {isOwnProfile && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Dit is jouw profiel</p>
              </div>
            )}
          </div>

          {/* Groups Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Groepen ({groups.length})
            </h2>
            
            {groups.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                {isOwnProfile ? 'Je bent nog geen lid van een groep' : 'Deze gebruiker is nog geen lid van een groep'}
              </p>
            ) : (
              <div className="grid gap-4">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => navigate(`/group/${group.id}`)}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {group.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {group.description || 'Geen beschrijving'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {group.member_count} {group.member_count === 1 ? 'lid' : 'leden'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-primary hover:text-primary-dark font-medium"
            >
              ← Terug naar Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile
