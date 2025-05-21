import Link from 'next/link'
import React, { useState, useRef, useEffect } from 'react'
import { FaHome } from "react-icons/fa";
import { IoMdSettings, IoMdLogOut, IoMdPerson } from "react-icons/io";
import { BiSolidDownArrow } from "react-icons/bi";
import { motion, AnimatePresence } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const user = useSession();
  console.log(user, 'hey user')

  const navItems = [
    { name: 'BROWSE TITLES', link: '/' },
    { name: 'BROWSE SHOTS', link: '/' },
    { name: 'DECKS', link: '/' },
    // { name: 'PRICING', link: '/' },
    { name: 'BLOG', link: '/' },
  ];




  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='flex text-white font-semibold pt-1 items-center gap-6 relative'>
      {/* Home Icon */}
      <div>
        <Link href={'/'}>
          <FaHome className='text-primary text-xl hover:text-primary-light transition-colors' />
        </Link>
      </div>

      {/* Navigation Items */}
      {navItems.map((item, idx) => (
        <div key={idx}>
          <Link href={item.link}>
            <p className='hover:text-primary font-sub-heading transition-colors'>
              {item.name}
            </p>
          </Link>
        </div>
      ))}


      {
        user.status !== "authenticated" &&  <div >
          <Link href={'/sign-in'} className='uppercase'>
            <p className='hover:text-primary font-sub-heading transition-colors'>
            Sign In
            </p>
          </Link>
        </div>
      }

      {/* Settings Dropdown */}
     {
      user.status === "authenticated" ?  <div ref={dropdownRef} className='relative'>
        <div 
          className='flex items-center gap-1 cursor-pointer hover:text-primary transition-colors'
          onClick={() => setIsOpen(!isOpen)}
        >
          <IoMdSettings className='text-primary text-xl' />
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <BiSolidDownArrow className='text-primary text-xs' />
          </motion.div>
        </div>

        {/* Animated Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className='absolute right-0 mt-2 w-48 bg-primary rounded-md shadow-lg z-50 overflow-hidden border border-gray-700'
            >
              <Link href="/account">
                <motion.div 
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  className='px-4 py-3 text-sm text-gray-300 hover:text-white flex items-center gap-2'
                >
                  <IoMdPerson className="text-primary" />
                  <span>Your Account</span>
                </motion.div>
              </Link>
              
              <motion.button
                whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                className='w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white flex items-center gap-2'
                onClick={() => {
                  signOut()
                  console.log('Logging out...');
                  setIsOpen(false);
                }}
              >
                <IoMdLogOut className="text-red-500" />
                <span>Logout</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div> : <div>
        <Link href={'/sign-up'} className='w-full bg-[#31caff] text-white font-bold py-3 px-4 rounded-md    cursor-pointer '>
          Sign Up for free
        </Link>
      </div>
     }
    </div>
  );
}