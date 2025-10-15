import { useState, useEffect } from 'react'  
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

interface DashboardProps {
  user: User
}



const Dashboard = ({ user }: DashboardProps) => {
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showJoinGroup, setShowJoinGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<any[]>([])
  const [createError, setCreateError] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [joiningGroup, setJoiningGroup] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkUsername = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking username:', error)
        }

        if (!data || !data.username) {
          // Geen username gevonden, stuur naar username pagina
          navigate('/choose-username')
        } else {
          setUsername(data.username)
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    checkUsername()
    loadGroups()
  }, [user.id, navigate])

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members (
            count
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading groups:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
      } else {
        console.log('Loaded groups:', data)
        setGroups(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingGroup(true)
    setCreateError(null)

    try {
      console.log('Creating group...', { name: newGroupName, description: newGroupDescription, user_id: user.id })
      
      // Maak de groep aan
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: newGroupName,
          description: newGroupDescription,
          created_by: user.id,
        })
        .select()
        .single()

      if (groupError) {
        console.error('Group creation error:', groupError)
        setCreateError(groupError.message)
        return
      }

      console.log('Group created:', group)

      // Voeg de creator automatisch toe als member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
        })

      if (memberError) {
        console.error('Member add error:', memberError)
        setCreateError(memberError.message)
        return
      }

      console.log('Member added successfully')

      // Reset form en herlaad groepen
      setShowCreateGroup(false)
      setNewGroupName('')
      setNewGroupDescription('')
      await loadGroups()
    } catch (err) {
      setCreateError('Er is een onverwachte fout opgetreden')
      console.error('Error creating group:', err)
    } finally {
      setCreatingGroup(false)
    }
  }

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setJoiningGroup(true)
    setJoinError(null)

    try {
      // Zoek groep op basis van code
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('invite_code', joinCode.toUpperCase())
        .single()

      if (groupError || !group) {
        setJoinError('Groep niet gevonden. Controleer de code.')
        return
      }

      // Check of je al lid bent
      const { data: existing } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single()

      if (existing) {
        setJoinError('Je bent al lid van deze groep')
        return
      }

      // Voeg toe als member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
        })

      if (memberError) {
        setJoinError(memberError.message)
        return
      }

      // Reset en herlaad
      setShowJoinGroup(false)
      setJoinCode('')
      await loadGroups()
      
      // Navigeer naar de groep
      navigate(`/group/${group.id}`)
    } catch (err) {
      setJoinError('Er is een onverwachte fout opgetreden')
      console.error('Error joining group:', err)
    } finally {
      setJoiningGroup(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {username || user.email?.split('@')[0]}! 💪
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          🚀 App successfully deployed on GitHub! Last updated: {new Date().toLocaleDateString('nl-NL')}
        </p>
        <p className="mt-2 text-gray-600">
          Track your progress and compete with your groups
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Groups
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {groups.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded text-white flex items-center justify-center text-sm font-bold">
                  #2
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Overall Rank
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    2nd Place
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded text-white flex items-center justify-center text-sm font-bold">
                  🏆
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Personal Records
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    12 PRs
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Your Groups
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Groups you're currently a member of
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowJoinGroup(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Join Group
            </button>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Create Group
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200">
          {groups.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-gray-500">No groups yet. Create your first group!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => navigate(`/group/${group.id}`)}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {group.name}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    {group.description || 'Geen beschrijving'}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{group.group_members?.[0]?.count || 0} members</span>
                    <span>{new Date(group.created_at).toLocaleDateString('nl-NL')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create New Group
              </h3>
              {createError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {createError}
                </div>
              )}
              <form onSubmit={handleCreateGroup}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    rows={3}
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Describe your group"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={creatingGroup}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingGroup ? 'Creating...' : 'Create Group'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateGroup(false)
                      setCreateError(null)
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinGroup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Join een Groep
              </h3>
              {joinError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {joinError}
                </div>
              )}
              <form onSubmit={handleJoinGroup}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Groepscode
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary uppercase text-center text-2xl font-bold tracking-wider"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Vraag de groepscode aan bij een groepslid
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={joiningGroup}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {joiningGroup ? 'Joining...' : 'Join Group'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinGroup(false)
                      setJoinError(null)
                      setJoinCode('')
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
