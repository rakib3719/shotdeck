'use client'
import { useGetShotsQuery } from '@/redux/api/shot'
import { filters } from '@/utils/utils';
import Image from 'next/image';
import React, { useState, useEffect } from 'react'

export default function Browse({search}) {
  const [showDropDown, setShowDropDown] = useState(false);
  const [id, setId] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({}); 

  // console.log(selectedFilters, 'selected filters')
  console.log(search, 'this is search for ')

  const query = {};
  for (const key in selectedFilters) {
    if (selectedFilters[key].length > 0) {
      query[key] = selectedFilters[key];
    }
  }
  const searchParams = new URLSearchParams(query).toString();
  // console.log(searchParams,'this is query')

  const { data } = useGetShotsQuery(query); 
  console.log(query, 'thisi sqauery')
  
  console.log('Shots Data:', data);

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
  };

  return (
    <div className="flex">
      <section className="bg-[#0a0a0a] min-h-screen p-4">
        <div className="flex justify-between">
          <p>FILTER RESULTS</p>
          <button onClick={clearAllFilters} className="text-primary">Clear all</button>
        </div>

        <div className="mt-8">
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

      {/* <section className="flex-1 p-4">
        <h2 className="text-white text-lg font-bold mb-4">Filtered Shots</h2>
        <pre className="text-white">{JSON.stringify(query, null, 2)}</pre>
      </section> */}


      <section className='grid grid-cols-4'>
        {
          data?.data && data?.data?.map((data, idx)=> (
            <div key={idx}>
              <Image alt='img' src={data?.imageUrl} height={400} width={400}/>

            </div>
          ))
        }
      </section>
    </div>
  );
}