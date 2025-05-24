import React from 'react'
import { FiCamera, FiClock, FiUsers } from 'react-icons/fi'

export default function Dashboard() {
  // Mock data - replace with your actual data
  const stats = {
    totalShots: 1243,
    pendingShots: 42,
    totalUsers: 187
  }

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Shots Card */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 font-medium">Total Shots</h3>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalShots}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
              <FiCamera className="text-2xl" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">+12% from last month</p>
          </div>
        </div>

        {/* Pending Shots Card */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 font-medium">Pending Shots</h3>
              <p className="text-3xl font-bold text-white mt-2">{stats.pendingShots}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-500/20 text-yellow-400">
              <FiClock className="text-2xl" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">+3 new today</p>
          </div>
        </div>

        {/* Total Users Card */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 font-medium">Total Users</h3>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
            </div>
            <div className="p-3 rounded-full bg-green-500/20 text-green-400">
              <FiUsers className="text-2xl" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">+8 new this week</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8 bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-start pb-4 border-b border-gray-700 last:border-0">
              <div className="p-2 rounded-full bg-gray-700 mr-4">
                <FiUsers className="text-gray-400" />
              </div>
              <div>
                <p className="text-white">New user registered</p>
                <p className="text-sm text-gray-400 mt-1">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}