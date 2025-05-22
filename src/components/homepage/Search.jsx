'use client'
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { IoSearchSharp } from "react-icons/io5";

export default function Search() {
  const [search, setSearch] = useState('');

  const router = useRouter()

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // prevent form submit
      console.log('Search Value:', search);
      router.push(`/browse/${search}`)

 
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="search"
          name="search"
          id="search"
          placeholder="Search by Film, Actor, Lighting, Set, Location, Etc."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyPress}
          className="bg-white text-gray-800 px-4 py-3 pl-12 w-full rounded outline-none placeholder:text-gray-600"
        />
        <IoSearchSharp className="absolute top-3 left-3 text-gray-400 text-2xl" />
      </form>
    </div>
  );
}
