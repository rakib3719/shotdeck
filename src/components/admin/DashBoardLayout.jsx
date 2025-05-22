'use client';

import React, { useState } from 'react';
import { FaBars, FaTimes, FaTachometerAlt, FaGlobe, FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import logo from '@/assets/logo.png'
import Image from 'next/image';
import { usePathname } from 'next/navigation';


export default function DashBoardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();


  return (
   <div  className='border '>

 <button
          className="text-white absolute top-6 right-4  mb-6 md:hidden"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <FaBars size={20} /> : <FaTimes size={20} />}
        </button>
    <div>

    </div>
     <div className="flex h-screen ">
      {/* Sidebar */}
      <div
        className={`bg-gray-900 duration-1000 text-white p-4 transition-all   flex flex-col ${
          collapsed ? 'hidden' : 'w-64'
        } md:w-64 md:relative fixed fixed  z-50 h-full`}
      >
       

        {!collapsed && (
           <div className="space-y-4 mt-8">
                <Link 
                  href="/admin/dashboard" 
                  className={`flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition-colors ${pathname === '/admin/dashboard' ? 'bg-gray-800 text-blue-400' : 'hover:text-blue-400'}`}
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
                  <FaPlus /> <span>Requested Shots</span>
                </Link>
              </div>
        )}
      </div>

      {/* Main Content */}
      <div className="w-full  p-4 overflow-auto">
        {children}
      </div>
    </div>
   </div>
  );
}
