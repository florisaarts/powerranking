import React, { useState } from 'react'

// Mock data for demonstration
const mockRankings = [
  {
    id: 1,
    userName: 'John Doe',
    exercise: 'Bench Press',
    record: '225 lbs',
    date: '2024-10-10',
    group: 'Gym Warriors'
  },
  {
    id: 2,
    userName: 'Sarah Smith',
    exercise: 'Deadlift',
    record: '315 lbs',
    date: '2024-10-12',
    group: 'Gym Warriors'
  },
  {
    id: 3,
    userName: 'Mike Johnson',
    exercise: 'Squat',
    record: '405 lbs',
    date: '2024-10-08',
    group: 'CrossFit Champions'
  },
  {
    id: 4,
    userName: 'Emily Davis',
    exercise: '5K Run',
    record: '18:45',
    date: '2024-10-11',
    group: 'Running Club'
  },
  {
    id: 5,
    userName: 'Alex Wilson',
    exercise: 'Pull-ups',
    record: '25 reps',
    date: '2024-10-09',
    group: 'Gym Warriors'
  },
  {
    id: 6,
    userName: 'Lisa Brown',
    exercise: 'Marathon',
    record: '3:15:22',
    date: '2024-10-05',
    group: 'Running Club'
  }
]

const Ranking: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState('All Groups')
  const [selectedExercise, setSelectedExercise] = useState('All Exercises')

  const groups = ['All Groups', ...Array.from(new Set(mockRankings.map(r => r.group)))]
  const exercises = ['All Exercises', ...Array.from(new Set(mockRankings.map(r => r.exercise)))]

  const filteredRankings = mockRankings.filter(ranking => {
    const groupMatch = selectedGroup === 'All Groups' || ranking.group === selectedGroup
    const exerciseMatch = selectedExercise === 'All Exercises' || ranking.exercise === selectedExercise
    return groupMatch && exerciseMatch
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          🏆 Power Rankings
        </h1>
        <p className="mt-2 text-gray-600">
          See how you stack up against your competition
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Group
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            >
              {groups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Exercise
            </label>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            >
              {exercises.map(exercise => (
                <option key={exercise} value={exercise}>{exercise}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Current Rankings
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Showing {filteredRankings.length} record(s)
          </p>
        </div>
        
        <div className="border-t border-gray-200">
          {filteredRankings.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-gray-500">No records found for the selected filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exercise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Record
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRankings.map((ranking, index) => (
                    <tr key={ranking.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-yellow-600' : 'bg-gray-300'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                              {ranking.userName.split(' ').map(n => n[0]).join('')}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {ranking.userName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ranking.exercise}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                        {ranking.record}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {ranking.group}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ranking.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Record Button */}
      <div className="mt-8 text-center">
        <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md text-sm font-medium transition-colors">
          Add New Record
        </button>
      </div>
    </div>
  )
}

export default Ranking
