import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

interface GroupMember {
  id: string
  user_id: string
  joined_at: string
  profiles: {
    username: string
  }
}

interface Group {
  id: string
  name: string
  description: string
  created_by: string
  created_at: string
  invite_code: string
}

const GroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  useEffect(() => {
    loadGroupData()
  }, [groupId])

  const loadGroupData = async () => {
    try {
      // Laad groep info
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single()

      if (groupError) {
        setError('Groep niet gevonden')
        return
      }

      setGroup(groupData)

      // Laad members
      console.log('Loading members for group:', groupId)
      
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)

      console.log('Members data:', membersData)
      console.log('Members error:', membersError)

      if (membersError) {
        console.error('Error loading members:', membersError)
        setMembers([])
        return
      }

      // Laad profiles voor deze members
      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(m => m.user_id)
        console.log('Looking for profiles with user IDs:', userIds)
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds)

        console.log('Profiles query result:', profiles)
        console.log('Profiles error:', profilesError)

        if (profilesError) {
          console.error('Error loading profiles:', profilesError)
        }

        // Combineer members met profiles
        const membersWithProfiles = membersData.map(member => {
          const profile = profiles?.find(p => p.id === member.user_id)
          console.log(`Member ${member.user_id} matched with profile:`, profile)
          
          return {
            ...member,
            profiles: profile || { username: 'Unknown' }
          }
        })

        console.log('Setting members:', membersWithProfiles.length, 'members found')
        console.log('Members with profiles:', membersWithProfiles)
        setMembers(membersWithProfiles)
      } else {
        console.log('No members found for this group')
        setMembers([])
      }
    } catch (err) {
      setError('Er is een fout opgetreden')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setInviteError(null)
    setInviteSuccess(false)

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        setInviteError('Niet ingelogd')
        return
      }

      const { error } = await supabase.from('group_invites').insert({
        group_id: groupId,
        invited_by: currentUser.id,
        invited_user_email: inviteEmail.toLowerCase(),
        invited_user_id: null, // Wordt ingevuld wanneer user accepteert
      })

      if (error) {
        setInviteError(error.message)
      } else {
        setInviteSuccess(true)
        setInviteEmail('')
        setTimeout(() => {
          setShowInviteModal(false)
          setInviteSuccess(false)
        }, 2000)
      }
    } catch (err) {
      setInviteError('Er is een fout opgetreden')
      console.error('Error:', err)
    } finally {
      setInviting(false)
    }
  }

  const copyInviteCode = () => {
    if (group?.invite_code) {
      navigator.clipboard.writeText(group.invite_code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
          >
            Terug naar Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary hover:text-primary-dark mb-4 flex items-center"
          >
            ← Terug naar Dashboard
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
              <p className="text-gray-600 mt-2">{group.description || 'Geen beschrijving'}</p>
              <p className="text-sm text-gray-500 mt-1">
                Aangemaakt op {new Date(group.created_at).toLocaleDateString('nl-NL')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/training/${groupId}`)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                📅 Trainingen
              </button>
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Uitnodigen
              </button>
            </div>
          </div>
          
          {/* Invite Code Box */}
          <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Groepscode</p>
                <p className="text-2xl font-bold text-primary mt-1">{group.invite_code}</p>
                <p className="text-xs text-gray-500 mt-1">Deel deze code om mensen toe te laten treden</p>
              </div>
              <button
                onClick={copyInviteCode}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                {copiedCode ? '✓ Gekopieerd!' : 'Kopieer Code'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members Section */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Leden ({members.length})
              </h2>
              <div className="space-y-3">
                {members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => navigate(`/profile/${member.user_id}`)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                        {(member.profiles?.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.profiles?.username || 'Onbekend'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Lid sinds {new Date(member.joined_at).toLocaleDateString('nl-NL')}
                        </p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Activity/Ranking Section */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Groep Ranking
              </h2>
              <div className="text-center py-12 text-gray-500">
                <p>Ranking functionaliteit komt binnenkort...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Nodig iemand uit
                </h3>
                {inviteSuccess && (
                  <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    Uitnodiging verzonden!
                  </div>
                )}
                {inviteError && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {inviteError}
                  </div>
                )}
                <form onSubmit={handleInvite}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email adres
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="gebruiker@voorbeeld.nl"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      De gebruiker moet al een account hebben
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={inviting}
                      className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {inviting ? 'Verzenden...' : 'Uitnodigen'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowInviteModal(false)
                        setInviteError(null)
                        setInviteEmail('')
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition-colors"
                    >
                      Annuleren
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GroupDetail
