'use client';

import React, { useState } from 'react';
import { FaBars, FaTimes, FaTachometerAlt, FaGlobe, FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import logo from '@/assets/logo.png'
import Image from 'next/image';


export default function DashBoardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
   <div >


    <div>

    </div>
     <div className="flex h-screen ">
      {/* Sidebar */}
      <div
        className={`bg-gray-900 text-white p-4 transition-all duration-300 flex flex-col ${
          collapsed ? 'w-16' : 'w-64'
        } md:w-64 md:relative fixed md:static z-50 h-full`}
      >
        <button
          className="text-white mb-6 md:hidden"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <FaBars size={20} /> : <FaTimes size={20} />}
        </button>

        {!collapsed && (
          <div className="space-y-4">
            <Link href="/admin/dashboard" className="flex items-center gap-2 hover:text-blue-400">
              <FaTachometerAlt /> <span>Dashboard</span>
            </Link>
            <Link href="/admin/website" className="flex items-center gap-2 hover:text-blue-400">
              <FaGlobe /> <span>Website</span>
            </Link>
            <Link href="/admin/add-shot" className="flex items-center gap-2 hover:text-blue-400">
              <FaPlus /> <span>Add New Shot</span>
            </Link>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1   p-4 overflow-auto">
        {children}
      </div>
    </div>
   </div>
  );
}
