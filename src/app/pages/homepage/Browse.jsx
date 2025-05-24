
'use client'
import { useGetShotsQuery } from '@/redux/api/shot'
import { filters } from '@/utils/utils';
import Image from 'next/image';
import React, { useState } from 'react'

export default function Browse({ search: propSearch }) {
  const [showDropDown, setShowDropDown] = useState(false);
  const [id, setId] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [localSearch, setLocalSearch] = useState(propSearch || '');
  const [submittedSearch, setSubmittedSearch] = useState(propSearch || '');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState('mostPopular');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Sort options
  const sortOptions = [
    { label: 'Most Popular', value: 'mostPopular' },
    { label: 'Release Date (Newest to Oldest)', value: 'releaseDateDesc' },
    { label: 'Release Date (Oldest to Newest)', value: 'releaseDateAsc' },
    { label: 'Recently Added', value: 'recentlyAdded' },
    { label: 'Random', value: 'random' },
    { label: 'Alphabetically by Title', value: 'alphabetical' },
  ];

  // Build the query object
  const query = {};
  for (const key in selectedFilters) {
    if (selectedFilters[key].length > 0) {
      query[key] = selectedFilters[key];
    }
  }
  if (submittedSearch && submittedSearch.trim() !== '') {
    query.search = submittedSearch;
  }
  if (sortBy) {
    query.sortBy = sortBy; // Ensure sortBy is included in query
  }

  const searchParams = new URLSearchParams();
  // Convert query object to URLSearchParams
  for (const key in query) {
    if (Array.isArray(query[key])) {
      query[key].forEach((value) => searchParams.append(key, value));
    } else {
      searchParams.append(key, query[key]); // sortBy is appended here
    }
  }
  const queryString = searchParams.toString();

  const { data } = useGetShotsQuery(query); 
  console.log(query, 'this is query');
  console.log('Shots Data:', data);
  console.log(queryString, 'this is queryString');

  const dropDownHandler = (id) => {
    setShowDropDown(!showDropDown);
    setId(id);
  };

  const filterHandler = (e, groupName, value) => {
    const isChecked = e.target.checked;
    setSelectedFilters((prev) => {
      const currentValues = prev[groupName] || [];
      if (isChecked) {
        return {
          ...prev,
          [groupName]: [...currentValues, value],
        };
      } else {
        return {
          ...prev,
          [groupName]: currentValues.filter((v) => v !== value),
        };
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    setLocalSearch('');
    setSubmittedSearch('');
    setSortBy('mostPopular'); // Reset sortBy to default
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSubmittedSearch(localSearch);
    }
  };

  const handleSortSelect = (value) => {
    setSortBy(value);
    setShowSortDropdown(false);
  };

  return (
<div>

   
      <div className="flex">
            <div className="absolute  top-[136.5px] md:top-24 z-50 right-12 md:right-8">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="text-white bg-[#333333] px-4 py-2 rounded-md text-sm focus:outline-none hover:bg-[#444444]"
            >
              Sort by: {sortOptions.find((opt) => opt.value === sortBy)?.label}
            </button>
            <div
              className={`absolute right-0 mt-2 w-64 bg-[#171717] border border-gray-600 rounded-md shadow-lg transform transition-all duration-200 ease-in-out ${
                showSortDropdown ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
              } origin-top z-50`}
            >
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortSelect(option.value)}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#333333] capitalize"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
      
      {/* Filter Sidebar */}
      <section
        className={`bg-[#0a0a0a] fixed top-[73px] min-h-screen p-4 w-64 transform transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:w-64`}
      >
        <div className="flex flex-col gap-4">
          {/* Search Input */}
          <div className="flex">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search shots..."
              className="w-full px-3 py-2 text-sm text-white bg-[#333333] border border-none rounded focus:outline-none"
            />
          </div>
          {/* Filter Results and Clear All */}
          <div className="flex justify-between">
            <p>FILTER RESULTS</p>
            <button onClick={clearAllFilters} className="text-primary">Clear all</button>
          </div>
        </div>

        <div className="mt-8 max-h-[calc(100vh-150px)] overflow-y-auto no-scrollbar">
          {filters.map((filterGroup, idx) => (
            <div
              key={idx}
              onClick={() => dropDownHandler(filterGroup?.id)}
              className="border-b border-gray-600 text-sm py-1 cursor-pointer"
            >
              <p className="px-1 capitalize p-1 hover:bg-[#171717]">{filterGroup?.title}</p>
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out mt-2 ${
                  showDropDown && filterGroup.id === id ? 'max-h-[500px]' : 'max-h-0'
                }`}
              >
                {filterGroup?.item.map((item, index) => {
                  const key = filterGroup.name;
                  const checked = selectedFilters[key]?.includes(item) ?? false;
                  return (
                    <label key={index} className="flex gap-2 px-2 cursor-pointer space-y-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => filterHandler(e, key, item)}
                        className="mt-1"
                      />
                      <p className="capitalize">{item}</p>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Spacer for desktop */}
      <section className="md:min-w-[250px]"></section>


      

      {/* Main Content */}
      <section className="grid mt-32 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full">
        <div className="flex justify-end p-4 space-x-4">
          {/* Toggle Button (Mobile Only) */}


       
          <button onClick={toggleSidebar} className="text-white focus:outline-none md:hidden">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {/* Sort By Dropdown */}
        
        </div>
        {data?.data && data?.data?.map((data, idx) => (
          <div key={idx} className="p-2">
            <Image
              alt="img"
              src={data?.imageUrl}
              height={400}
              width={400}
              className="object-cover w-full h-auto"
            />
          </div>
        ))}
      </section>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
</div>
  );
}
