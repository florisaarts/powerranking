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
}

const GroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select(`
          *,
          profiles (
            username
          )
        `)
        .eq('group_id', groupId)

      if (membersError) {
        console.error('Error loading members:', membersError)
      } else {
        setMembers(membersData || [])
      }
    } catch (err) {
      setError('Er is een fout opgetreden')
      console.error('Error:', err)
    } finally {
      setLoading(false)
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
          <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
          <p className="text-gray-600 mt-2">{group.description || 'Geen beschrijving'}</p>
          <p className="text-sm text-gray-500 mt-1">
            Aangemaakt op {new Date(group.created_at).toLocaleDateString('nl-NL')}
          </p>
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
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.profiles?.username || 'Onbekend'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Lid sinds {new Date(member.joined_at).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                  </div>
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
      </div>
    </div>
  )
}

export default GroupDetail
