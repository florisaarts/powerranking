import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'

interface TrainingProps {
  user: User
}

interface TrainingSchedule {
  id: string
  group_id: string
  name: string
  description: string | null
  created_by: string
  created_at: string
}

interface TrainingSession {
  id: string
  schedule_id: string
  name: string
  description: string | null
  scheduled_date: string
  scheduled_time: string | null
  duration_minutes: number | null
  location: string | null
}

const Training = ({ user }: TrainingProps) => {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState<TrainingSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newScheduleName, setNewScheduleName] = useState('')
  const [newScheduleDescription, setNewScheduleDescription] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadSchedules()
  }, [groupId])

  const loadSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('training_schedules')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading schedules:', error)
      } else {
        setSchedules(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const { error } = await supabase
        .from('training_schedules')
        .insert({
          group_id: groupId,
          name: newScheduleName,
          description: newScheduleDescription,
          created_by: user.id
        })

      if (error) {
        console.error('Error creating schedule:', error)
        alert(`Fout: ${error.message}`)
        return
      }

      setShowCreateModal(false)
      setNewScheduleName('')
      setNewScheduleDescription('')
      await loadSchedules()
    } catch (err) {
      console.error('Error:', err)
      alert('Er is een onverwachte fout opgetreden')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar user={user} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar user={user} />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(`/group/${groupId}`)}
              className="text-primary hover:text-primary-dark mb-4 flex items-center"
            >
              ← Terug naar Groep
            </button>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Trainingsschemas</h1>
                <p className="text-gray-600 mt-2">Beheer trainingen en volg deelname</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                + Nieuw Schema
              </button>
            </div>
          </div>

          {/* Schedules List */}
          {schedules.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 mb-4">Nog geen trainingsschemas aangemaakt</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md"
              >
                Maak eerste schema
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  onClick={() => navigate(`/training/${schedule.id}`)}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {schedule.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {schedule.description || 'Geen beschrijving'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Aangemaakt op {new Date(schedule.created_at).toLocaleDateString('nl-NL')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nieuw Trainingsschema
              </h3>
              <form onSubmit={handleCreateSchedule}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schema Naam
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    value={newScheduleName}
                    onChange={(e) => setNewScheduleName(e.target.value)}
                    placeholder="Bijv. Winter 2024/2025"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beschrijving
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    rows={3}
                    value={newScheduleDescription}
                    onChange={(e) => setNewScheduleDescription(e.target.value)}
                    placeholder="Beschrijf het trainingsschema"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {creating ? 'Aanmaken...' : 'Maak Schema'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setNewScheduleName('')
                      setNewScheduleDescription('')
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition-colors"
                  >
                    Annuleren
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Training
