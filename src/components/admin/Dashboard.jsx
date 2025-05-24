'use client'
import { useGetOverviewQuery } from '@/redux/api/shot'
import React from 'react'
import { FiCamera, FiClock, FiUsers, FiPlusSquare, FiHome, FiFilm, FiSettings } from 'react-icons/fi'

export default function Dashboard() {
  // Mock data - replace with your actual data
  const stats = {
    totalShots: 1243,
    pendingShots: 42,
    totalUsers: 187
  }

  const latestVideos = [
    {
      id: 1,
      title: "Sunset Beach Scene",
      views: "12.4k",
      thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      uploaded: "2 hours ago"
    },
    {
      id: 2,
      title: "Urban Night Lights",
      views: "8.7k",
      thumbnail: "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      uploaded: "1 day ago"
    },
    {
      id: 3,
      title: "Mountain Documentary",
      views: "24.1k",
      thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      uploaded: "3 days ago"
    }
  ]

  const menuItems = [
    { name: "Dashboard", icon: <FiHome />, active: true },
    { name: "Add Shot", icon: <FiPlusSquare /> },
    { name: "All Videos", icon: <FiFilm /> },
    { name: "Settings", icon: <FiSettings /> }
  ]

  const {data, isLoading, isError} = useGetOverviewQuery();
  if(isLoading){
    return <p>Loading...</p>
  }

  if(isError){
    return <p>Something went worng!</p>
  }

  
  const overview = data?.overView;
    console.log(overview, 'this is overview');

  return (
    <div className="flex bg-gray-900 min-h-screen">
      {/* Sidebar Navigation */}
      {/* <div className="w-64 bg-gray-800 p-4 hidden md:block">
        <h2 className="text-xl font-bold text-white mb-8 p-2">Shot Dashboard</h2>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <a 
                  href="#" 
                  className={`flex items-center p-3 rounded-lg transition-colors ${item.active ? 'bg-gray-700 text-blue-400' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div> */}

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Shots Card */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-400 font-medium">Total Shots</h3>
                <p className="text-3xl font-bold text-white mt-2">{overview?.totalShot}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                <FiCamera className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
{
  overview?.totalShotToday < 1 ?               <p className="text-sm text-gray-400">    Today No video added Right now</p> :               <p className="text-sm text-gray-400">    +{overview?.totalShotToday - 1 } New video add Today</p>
}
            </div>
          </div>

          {/* Pending Shots Card */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-yellow-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-400 font-medium">Pending Shots</h3>
                <p className="text-3xl font-bold text-white mt-2">{overview?.pendingShot}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/20 text-yellow-400">
                <FiClock className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
{
  overview?.totalPendingShotToday < 1 ?               <p className="text-sm text-gray-400">No Pending Video Available today</p> :               <p className="text-sm text-gray-400">+{overview?.totalPendingShotToday - 1} new this week</p>
}
            </div>
          </div>

          {/* Total Users Card */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-400 font-medium">Total Users</h3>
                <p className="text-3xl font-bold text-white mt-2">{overview.totalUsers}</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/20 text-green-400">
                <FiUsers className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
{
  overview?.totalUserToday < 1 ?               <p className="text-sm text-gray-400">No User Resigter today</p> :               <p className="text-sm text-gray-400">+{overview?.totalUserToday } new this week</p>
}
            </div>
          </div>
        </div>

        {/* Latest Videos Section */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Latest Videos</h2>
            <a href="#" className="text-blue-400 hover:text-blue-300 text-sm">View All</a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestVideos.map(video => (
              <div key={video.id} className="bg-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative pb-[56.25%]"> {/* 16:9 aspect ratio */}
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="absolute h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  {/* <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.views} views
                  </span> */}
                </div>
                <div className="p-4">
                  <h3 className="text-white font-medium mb-1 truncate">{video.title}</h3>
                  <p className="text-gray-400 text-sm">{video.uploaded}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex justify-around md:hidden py-3">
          {menuItems.slice(0, 4).map((item, index) => (
            <a 
              key={index} 
              href="#"
              className={`flex flex-col items-center p-2 ${item.active ? 'text-blue-400' : 'text-gray-400'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}