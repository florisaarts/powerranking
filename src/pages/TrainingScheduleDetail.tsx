import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'

interface TrainingScheduleDetailProps {
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

interface TrainingExercise {
  id: string
  schedule_id: string
  name: string
  description: string | null
  sets: number
  reps: number
  weight_percentage: number | null
  order_index: number
  exercise_type: 'basis' | 'tussen'
  created_at: string
}

const TrainingScheduleDetail = ({ user }: TrainingScheduleDetailProps) => {
  const { scheduleId } = useParams<{ scheduleId: string }>()
  const navigate = useNavigate()
  const [schedule, setSchedule] = useState<TrainingSchedule | null>(null)
  const [exercises, setExercises] = useState<TrainingExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [exerciseType, setExerciseType] = useState<'basis' | 'tussen'>('basis')
  
  // Form fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('10')
  const [weightPercentage, setWeightPercentage] = useState('70')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    loadScheduleData()
  }, [scheduleId])

  const loadScheduleData = async () => {
    try {
      // Load schedule
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('training_schedules')
        .select('*')
        .eq('id', scheduleId)
        .single()

      if (scheduleError) {
        console.error('Error loading schedule:', scheduleError)
        return
      }

      setSchedule(scheduleData)

      // Load exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('training_exercises')
        .select('*')
        .eq('schedule_id', scheduleId)
        .order('order_index', { ascending: true })

      if (exercisesError) {
        console.error('Error loading exercises:', exercisesError)
      } else {
        setExercises(exercisesData || [])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)

    try {
      const maxOrder = exercises.length > 0 
        ? Math.max(...exercises.map(ex => ex.order_index))
        : -1

      const { error } = await supabase
        .from('training_exercises')
        .insert({
          schedule_id: scheduleId,
          name,
          description,
          sets: parseInt(sets),
          reps: parseInt(reps),
          weight_percentage: parseInt(weightPercentage),
          exercise_type: exerciseType,
          order_index: maxOrder + 1
        })

      if (error) {
        console.error('Error adding exercise:', error)
        alert(`Fout: ${error.message}`)
        return
      }

      // Reset form
      setShowAddModal(false)
      setName('')
      setDescription('')
      setSets('3')
      setReps('10')
      setWeightPercentage('70')
      setExerciseType('basis')
      await loadScheduleData()
    } catch (err) {
      console.error('Error:', err)
      alert('Er is een onverwachte fout opgetreden')
    } finally {
      setAdding(false)
    }
  }

  const deleteExercise = async (exerciseId: string) => {
    if (!confirm('Weet je zeker dat je deze oefening wilt verwijderen?')) return

    const { error } = await supabase
      .from('training_exercises')
      .delete()
      .eq('id', exerciseId)

    if (error) {
      console.error('Error deleting exercise:', error)
      alert(`Fout: ${error.message}`)
    } else {
      await loadScheduleData()
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

  if (!schedule) {
    return (
      <>
        <Navbar user={user} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Schema niet gevonden</h2>
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

  const basisOefeningen = exercises.filter(ex => ex.exercise_type === 'basis')
  const tussenOefeningen = exercises.filter(ex => ex.exercise_type === 'tussen')

  return (
    <>
      <Navbar user={user} />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(`/training/${schedule.group_id}`)}
              className="text-primary hover:text-primary-dark mb-4 flex items-center"
            >
              ← Terug naar Trainingen
            </button>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{schedule.name}</h1>
                <p className="text-gray-600 mt-2">{schedule.description || 'Geen beschrijving'}</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                + Oefening Toevoegen
              </button>
            </div>
          </div>

          {/* Basis Oefeningen */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Basis Oefeningen</h2>
            {basisOefeningen.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nog geen basis oefeningen toegevoegd</p>
            ) : (
              <div className="space-y-3">
                {basisOefeningen.map((exercise, idx) => (
                  <div key={exercise.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-primary">#{idx + 1}</span>
                          <h3 className="text-lg font-semibold text-gray-900">{exercise.name}</h3>
                        </div>
                        {exercise.description && (
                          <p className="text-gray-600 text-sm mt-1">{exercise.description}</p>
                        )}
                        <div className="flex gap-4 mt-3 text-sm">
                          <span className="text-gray-700">
                            <strong>Sets:</strong> {exercise.sets}
                          </span>
                          <span className="text-gray-700">
                            <strong>Reps:</strong> {exercise.reps}
                          </span>
                          {exercise.weight_percentage && (
                            <span className="text-gray-700">
                              <strong>Gewicht:</strong> {exercise.weight_percentage}% van max
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteExercise(exercise.id)}
                        className="text-red-600 hover:text-red-800 ml-4"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tussen Oefeningen */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tussen Oefeningen</h2>
            {tussenOefeningen.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nog geen tussen oefeningen toegevoegd</p>
            ) : (
              <div className="space-y-3">
                {tussenOefeningen.map((exercise, idx) => (
                  <div key={exercise.id} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-blue-600">#{idx + 1}</span>
                          <h3 className="text-lg font-semibold text-gray-900">{exercise.name}</h3>
                        </div>
                        {exercise.description && (
                          <p className="text-gray-600 text-sm mt-1">{exercise.description}</p>
                        )}
                        <div className="flex gap-4 mt-3 text-sm">
                          <span className="text-gray-700">
                            <strong>Sets:</strong> {exercise.sets}
                          </span>
                          <span className="text-gray-700">
                            <strong>Reps:</strong> {exercise.reps}
                          </span>
                          {exercise.weight_percentage && (
                            <span className="text-gray-700">
                              <strong>Gewicht:</strong> {exercise.weight_percentage}% van max
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteExercise(exercise.id)}
                        className="text-red-600 hover:text-red-800 ml-4"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Oefening Toevoegen
              </h3>
              <form onSubmit={handleAddExercise}>
                {/* Exercise Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type Oefening
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="basis"
                        checked={exerciseType === 'basis'}
                        onChange={(e) => setExerciseType(e.target.value as 'basis')}
                        className="mr-2"
                      />
                      Basis Oefening
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="tussen"
                        checked={exerciseType === 'tussen'}
                        onChange={(e) => setExerciseType(e.target.value as 'tussen')}
                        className="mr-2"
                      />
                      Tussen Oefening
                    </label>
                  </div>
                </div>

                {/* Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Naam Oefening *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Bijv. Squat, Bankdrukken"
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beschrijving
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Extra uitleg of tips"
                  />
                </div>

                {/* Sets and Reps */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sets *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      value={sets}
                      onChange={(e) => setSets(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reps *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                    />
                  </div>
                </div>

                {/* Weight Percentage */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Percentage van Maximaal Gewicht *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      value={weightPercentage}
                      onChange={(e) => setWeightPercentage(e.target.value)}
                    />
                    <span className="text-gray-700">%</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={adding}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {adding ? 'Toevoegen...' : 'Voeg Toe'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setName('')
                      setDescription('')
                      setSets('3')
                      setReps('10')
                      setWeightPercentage('70')
                      setExerciseType('basis')
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

export default TrainingScheduleDetail
