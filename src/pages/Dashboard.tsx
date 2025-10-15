import React, { useState } from 'react'
import { User } from '@supabase/supabase-js'

interface DashboardProps {
  user: User
}

// Mock data for demonstration
const mockGroups = [
  {
    id: 1,
    name: 'Gym Warriors',
    memberCount: 12,
    description: 'Hardcore lifting crew',
    lastActivity: '2 hours ago'
  },
  {
    id: 2,
    name: 'Running Club',
    memberCount: 8,
    description: 'Daily runners unite',
    lastActivity: '1 day ago'
  },
  {
    id: 3,
    name: 'CrossFit Champions',
    memberCount: 15,
    description: 'WOD enthusiasts',
    lastActivity: '3 hours ago'
  }
]

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement group creation with Supabase
    console.log('Creating group:', { name: newGroupName, description: newGroupDescription })
    setShowCreateGroup(false)
    setNewGroupName('')
    setNewGroupDescription('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.email?.split('@')[0]}! 💪
        </h1>
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
                    {mockGroups.length}
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
          <button
            onClick={() => setShowCreateGroup(true)}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Create Group
          </button>
        </div>

        <div className="border-t border-gray-200">
          {mockGroups.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-gray-500">No groups yet. Create your first group!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {mockGroups.map((group) => (
                <div
                  key={group.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {group.name}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    {group.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{group.memberCount} members</span>
                    <span>Active {group.lastActivity}</span>
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
                    className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                  >
                    Create Group
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateGroup(false)}
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
