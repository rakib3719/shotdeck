'use client';

import React, { useState } from 'react';
import { FaBars, FaTimes, FaTachometerAlt, FaGlobe, FaPlus, FaPhotoVideo, FaUsers } from 'react-icons/fa';
import Link from 'next/link';
import logo from '@/assets/logo.png'
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { PiUsersThreeFill } from "react-icons/pi";
import { MdVideoCameraBack } from 'react-icons/md';
import { useSession } from 'next-auth/react';


export default function DashBoardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  const user = useSession();
  console.log(user?.data?.user?.role, 'this is user')

  const router = useRouter()
  const pathname = usePathname();
  if(user?.data?.user?.role !== 'admin'){

  return <div className="flex justify-center items-center min-h-screen bg-gray-900 px-4">
  <div className="bg-gray-800 border-l-4 border-red-600 p-6 rounded-md shadow-lg max-w-md text-center">
    <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
    <p className="text-gray-300 font-medium">
      This dashboard is restricted to <span className="text-red-400 font-semibold">ADMIN</span> users only.
    </p>
    <div className="mt-4 text-sm text-gray-500">
      Please contact support if you believe this is a mistake.
    </div>
  </div>
</div>


  }


  return (
   <div  className=' '>

 <button
          className="text-white absolute top-6 right-4   mb-6 md:hidden"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <FaBars size={20} /> : <FaTimes size={20} />}
        </button>
    <div>

    </div>
     <div className="flex h-screen ">
      {/* Sidebar */}
      <div
        className={`bg-gray-800 mt-[74px] fixed duration-1000 text-white p-4 transition-all   flex flex-col ${
          collapsed ? 'hidden' : 'w-64'
        } md:w-64 md:relative fixed   h-full`}
      >
       

        {!collapsed && (
           <div className="space-y-4 mt-8">
                <Link 
                  href="/admin/" 
                  className={`flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition-colors ${pathname === '/admin' ? 'bg-gray-800 text-blue-400' : 'hover:text-blue-400'}`}
                >
                  <FaTachometerAlt /> <span>Dashboard</span>
                </Link>
                <Link 
                  href="/" 
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 hover:text-blue-400 transition-colors"
                >
                  <FaGlobe /> <span>Website</span>
                </Link>
                <Link 
                  href="/admin/add-shot" 
                  className={`flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition-colors ${pathname === '/admin/add-shot' ? 'bg-gray-800 text-blue-400' : 'hover:text-blue-400'}`}
                >
                  <FaPlus /> <span>Add New Shot</span>
                </Link>
                <Link 
                  href="/admin/requested-shots" 
                  className={`flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition-colors ${pathname === '/admin/requested-shots' ? 'bg-gray-800 text-blue-400' : 'hover:text-blue-400'}`}
                >
                  <MdVideoCameraBack  /> <span>Requested Shots</span>
                </Link>
                <Link 
                  href="/admin/users" 
                  className={`flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition-colors ${pathname === '/admin/users' ? 'bg-gray-800 text-blue-400' : 'hover:text-blue-400'}`}
                >
                  <FaUsers  /> <span>All Users</span>
                </Link>
                <Link 
                  href="/admin/all-shot" 
                  className={`flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition-colors ${pathname === '/admin/all-shot' ? 'bg-gray-800 text-blue-400' : 'hover:text-blue-400'}`}
                >
                <FaPhotoVideo /> <span>All Shot</span>
                </Link>
              </div>
        )}
      </div>

      {/* Main Content */}
      <div className="w-full bg-gray-900  p-4 overflow-auto">
        {children}
      </div>
    </div>
   </div>
  );
}
