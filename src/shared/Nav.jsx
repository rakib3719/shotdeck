import Link from 'next/link'
import React, { useState, useRef, useEffect } from 'react'
import { FaHome } from "react-icons/fa";
import { IoMdSettings, IoMdLogOut, IoMdPerson } from "react-icons/io";
import { BiSolidDownArrow } from "react-icons/bi";
import { motion, AnimatePresence } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import { RiMenuFill, RiCloseFill } from "react-icons/ri";
import { usePathname } from 'next/navigation';

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const user = useSession();
  const pathname = usePathname();
  
  if(pathname.includes('/admin')){
    return null;
  }

  const navItems = [
    { name: 'ADD SHOTS', link: '/add-shots' },
    { name: 'BROWSE SHOTS', link: '/browse' },
    { name: 'RENDOM SHOTS', link: '/browse/?sortBy=random' },
    { name: 'ADD SHOT', link: '/' },
  ];

  const [showMenu, setShowMenu] = useState(false);

  const toggleShowMenu = () => {
    setShowMenu(!showMenu);
  }

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
    <div className='bg-primary'>
      {/* Mobile menu button */}
      <div className='lg:hidden flex justify-end '>
        <button 
          onClick={toggleShowMenu}
          className='text-white focus:outline-none'
          aria-label='Toggle menu'
        >
          {showMenu ? (
            <RiCloseFill className='text-3xl mr-4' />
          ) : (
            <RiMenuFill className='text-3xl' />
          )}
        </button>
      </div>

      {/* Navigation content */}
      <AnimatePresence>
        {(showMenu || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: 1, 
              height: showMenu ? 'auto' : 0,
              transition: { 
                opacity: { duration: 0.3 },
                height: { duration: 0.4 }
              }
            }}
            exit={{ 
              opacity: 0, 
              height: 0,
              transition: { 
                opacity: { duration: 0.2 },
                height: { duration: 0.3 }
              }
            }}
            className={`lg:mt-0 overflow-hidden lg:overflow-visible lg:flex lg:items-center lg:space-x-6 lg:space-y-0 lg:relative lg:h-auto`}
          >
            <div className={`lg:flex space-y-4 lg:space-y-0 text-white font-semibold p-4 lg:p-0 items-center gap-6`}>
              {/* Home Icon */}
              <div className='flex justify-end lg:justify-start  lg:mt-[30px]'>
                <Link href={'/'}>
                  <FaHome className='text-white hover:text-[#31caff] text-xl hover:text-primary-light transition-colors' />
                </Link>
              </div>

              {/* Navigation Items */}
              {navItems.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 + 0.2 }}
                >
                  <Link href={item.link}>
                    <p className='hover:text-primary hover:text-[#31caff] lg:mt-8 text-right lg:text-left font-sub-heading transition-colors whitespace-nowrap'>
                      {item.name}
                    </p>
                  </Link>
                </motion.div>
              ))}

              {user.status !== "authenticated" && (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: navItems.length * 0.05 + 0.2 }}
                >
                  <Link href={'/sign-in'} className='uppercase'>
                    <p className='hover:text-primary lg:mt-[30px] font-sub-heading transition-colors text-right lg:text-left'>
                      Sign In
                    </p>
                  </Link>
                </motion.div>
              )}

              {/* Settings Dropdown */}
              {user.status === "authenticated" ? (
                <motion.div 
                  ref={dropdownRef} 
                  className='relative flex justify-end lg:justify-start'
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: navItems.length * 0.05 + 0.2 }}
                >
                  <div 
                    className='flex items-center  gap-1 cursor-pointer hover:text-primary transition-colors'
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <IoMdSettings className='text-white text-xl lg:mt-8' />
                    <motion.div
                   
                    >
                      <BiSolidDownArrow className='text-white hover:text-[#31caff] text-xs lg:mt-8' />
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
                        className='absolute right-0 mt-16 w-48 bg-primary rounded-md shadow-lg z-50 overflow-hidden border border-gray-700'
                      >
                        <Link href="/account">
                          <motion.div 
                            whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                            className='px-4 py-3 text-sm text-gray-300 hover:text-white flex items-center gap-2'
                          >
                            <IoMdPerson className="text-white " />
                            <span>Your Account</span>
                          </motion.div>
                        </Link>
                        
                        <motion.button
                          whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                          className='w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white flex items-center gap-2'
                          onClick={() => {
                            signOut()
                            setIsOpen(false);
                          }}
                        >
                          <IoMdLogOut className="text-red-500" />
                          <span>Logout</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  className='flex justify-end mt-[30px] lg:justify-start'
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: navItems.length * 0.05 + 0.2 }}
                >
                  <Link href={'/sign-up'} className='w-full bg-[#31caff] whitespace-nowrap text-white font-bold py-3 px-4 rounded-md cursor-pointer block text-center'>
                    Sign Up for free
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}