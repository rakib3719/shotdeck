'use client'
import { useGetShotsQuery, useDeleteShotMutation } from '@/redux/api/shot'
import { useSecureAxios } from '@/utils/Axios';
import { filters } from '@/utils/utils';
import Image from 'next/image';
import React, { useState } from 'react'
import { FiTrash2, FiFilter, FiEdit } from 'react-icons/fi'
import Swal from 'sweetalert2';





export default function AllShotAdmin() {
  const [showDropDown, setShowDropDown] = useState(false);
  const [id, setId] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const axiosInstance = useSecureAxios();
//   const [deleteShot] = useDeleteShotMutation();

  // Build query from selected filters
  const query = {};
  for (const key in selectedFilters) {
    if (selectedFilters[key].length > 0) {
      query[key] = selectedFilters[key];
    }
  }

  const { data, refetch } = useGetShotsQuery(query);

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

  const handleDelete = async (shotId, shotTitle) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `You are about to delete "${shotTitle}". This action cannot be undone!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        background: '#171717',
        color: '#ffffff'
      });

      if (result.isConfirmed) {
        // Show loading
     Swal.fire({
          title: 'Deleting...',
          allowOutsideClick: false,
          didOpen: () => {
          Swal.showLoading();
          },
          background: '#171717',
          color: '#ffffff'
        });

       const data =  await axiosInstance.delete(`/shot/delete/${shotId}`);
       console.log(data, 'shot is deleted')
        
        // Show success
     Swal.fire({
          title: 'Deleted!',
          text: 'The shot has been deleted.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#171717',
          color: '#ffffff'
        });
        
        refetch();
      }
    } catch (error) {
  Swal.fire({
        title: 'Error!',
        text: 'Failed to delete shot',
        icon: 'error',
        background: '#171717',
        color: '#ffffff'
      });
      console.error('Delete error:', error);
    }
  };

  return (
    <div className=" min-h-screen no-scrollbar  p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Admin - All Shots</h1>
      
      {/* Filter Section - Top */}
      <div className=" rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <FiFilter className="text-primary" />
            <p className="text-white">FILTERS</p>
          </div>
          <button 
            onClick={clearAllFilters} 
            className="text-primary text-sm hover:underline"
          >
            Clear all
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          {filters.map((filterGroup, idx) => (
            <div key={idx} className="relative">
              <button
                onClick={() => dropDownHandler(filterGroup?.id)}
                className="bg-[#222] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#333]"
              >
                {filterGroup.title}
                <span className={`transition-transform ${showDropDown && filterGroup.id === id ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {showDropDown && filterGroup.id === id && (
                <div className="absolute z-10 mt-2 w-56 bg-[#222] rounded-md shadow-lg p-2">
                  {filterGroup?.item.map((item, index) => {
                    const key = filterGroup.name;
                    const checked = selectedFilters[key]?.includes(item) ?? false;
                    return (
                      <label key={index} className="flex items-center gap-2 p-2 hover:bg-[#333] rounded">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => filterHandler(e, key, item)}
                          className="form-checkbox h-4 w-4 text-primary"
                        />
                        <span className="text-white capitalize">{item}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Shots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.data?.map((shot) => (
          <div key={shot._id} className="bg-[#171717] rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative group">
            <div className="relative h-48 w-full">
              <Image 
                src={shot.imageUrl} 
                alt={shot.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* <button
                  onClick={() => {}}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
                  title="Edit shot"
                >
                  <FiEdit size={16} />
                </button> */}
                <button
                  onClick={() => handleDelete(shot._id, shot.title)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
                  title="Delete shot"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-white font-medium truncate">{shot.title}</h3>
              <p className="text-gray-400 text-sm mt-1">{shot.director}</p>
              <p className="text-gray-500 text-xs mt-2">
                {new Date(shot.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {data?.data?.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No shots found matching your filters
        </div>
      )}
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
  )
}

