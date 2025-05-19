import React from 'react'
import { IoSearchOutline, IoSearchSharp } from "react-icons/io5";

export default function Search() {
  return (
    <div className='relative'>
    
    <input type="search" name="search" id="search"   className='bg-white px-2 py-3 w-2xl rounded outline-0 focus:outline-0  placeholder:text-gray-600 placeholder:pl-12' placeholder='Search by Film, Actor, Lighting, Set, Locaiton, Etc.' />
    <IoSearchSharp  className='absolute top-2  left-2 z-50  text-gray-400 text-3xl font-bold'/>
    </div>
  )
}
