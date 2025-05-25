// 'use client'
// import { useGetShotsQuery } from '@/redux/api/shot'
// import { base_url, filters } from '@/utils/utils';
// import axios from 'axios';
// import { motion, AnimatePresence } from 'framer-motion';
// import Image from 'next/image';
// import { useSearchParams } from 'next/navigation';
// import React, { useState, useEffect, Suspense } from 'react'


// function BrowseWithSuspense() {
//   return (
//     <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
//       <Browse />
//     </Suspense>
//   )
// }

// export default function Browse() {
//   const searchParams = useSearchParams();
//   const [showDropDown, setShowDropDown] = useState(false);
//   const [id, setId] = useState(null);
//   const [selectedFilters, setSelectedFilters] = useState({});
//   const [localSearch, setLocalSearch] = useState('');
//   const [submittedSearch, setSubmittedSearch] = useState('');
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [sortBy, setSortBy] = useState('mostPopular');
//   const [showSortDropdown, setShowSortDropdown] = useState(false);
//   const [modalIsOpen, setModalIsOpen] = useState(false);
//   const [selectedShot, setSelectedShot] = useState(null);

//   const   handleClick = async(id)=>{

//     const data =await axios.patch(`${base_url}/shot/click/${id}`);
//     console.log(data, 'click handle')
 
//   }

//   const sortOptions = [
//     { label: 'Most Popular', value: 'mostPopular' },
//     { label: 'Release Date (Newest to Oldest)', value: 'releaseDateDesc' },
//     { label: 'Release Date (Oldest to Newest)', value: 'releaseDateAsc' },
//     { label: 'Recently Added', value: 'recentlyAdded' },
//     { label: 'Random', value: 'random' },
//     { label: 'Alphabetically by Title', value: 'alphabetical' },
//   ];

//   // Parse URL parameters on component mount
//   useEffect(() => {
//     const params = new URLSearchParams(searchParams);
//     const initialFilters = {};
//     const filterKeys = new Set(filters.map(f => f.name));
    
//     // Extract all parameters from URL
//     params.forEach((value, key) => {
//       if (key === 'search') {
//         setLocalSearch(value);
//         setSubmittedSearch(value);
//       } else if (key === 'sortBy') {
//         setSortBy(value);
//       } else if (filterKeys.has(key)) {
//         if (!initialFilters[key]) {
//           initialFilters[key] = [];
//         }
//         initialFilters[key].push(value);
//       }
//     });
    
//     setSelectedFilters(initialFilters);
//   }, [searchParams]);

//   function getYouTubeEmbedUrl(url) {
//     try {
//       const yt = new URL(url);
//       if (yt.hostname.includes('youtu.be')) {
//         return `https://www.youtube.com/embed/${yt.pathname.split('/')[1]}`;
//       }
//       if (yt.hostname.includes('youtube.com')) {
//         return `https://www.youtube.com/embed/${yt.searchParams.get('v')}`;
//       }
//     } catch (err) {
//       return null;
//     }
//   }

//   // Build query object from state
//   const query = {};
//   for (const key in selectedFilters) {
//     if (selectedFilters[key].length > 0) {
//       query[key] = selectedFilters[key];
//     }
//   }
//   if (submittedSearch && submittedSearch.trim() !== '') {
//     query.search = submittedSearch;
//   }
//   if (sortBy) {
//     query.sortBy = sortBy;
//   }

//   const { data } = useGetShotsQuery(query);

//   // Rest of your component remains the same...
//   const dropDownHandler = (id) => {
//     setShowDropDown(!showDropDown);
//     setId(id);
//   };

//   const filterHandler = (e, groupName, value) => {
//     const isChecked = e.target.checked;
//     setSelectedFilters((prev) => {
//       const currentValues = prev[groupName] || [];
//       if (isChecked) {
//         return {
//           ...prev,
//           [groupName]: [...currentValues, value],
//         };
//       } else {
//         return {
//           ...prev,
//           [groupName]: currentValues.filter((v) => v !== value),
//         };
//       }
//     });
//   };

//   const clearAllFilters = () => {
//     setSelectedFilters({});
//     setLocalSearch('');
//     setSubmittedSearch('');
//     setSortBy('mostPopular');
//   };

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   const handleSearchKeyDown = (e) => {
//     if (e.key === 'Enter') {
//       setSubmittedSearch(localSearch);
//     }
//   };

//   const handleSortSelect = (value) => {
//     setSortBy(value);
//     setShowSortDropdown(false);
//   };;

//   return (
//     <div>
//       <div className="flex">
//         {/* Sort Dropdown */}
//         <div className="absolute top-[136.5px] md:top-24 z-30 right-12 md:right-8">
//           <button
//             onClick={() => setShowSortDropdown(!showSortDropdown)}
//             className="text-white bg-[#333333] px-4 py-2 rounded-md text-sm focus:outline-none hover:bg-[#444444]"
//           >
//             Sort by: {sortOptions.find((opt) => opt.value === sortBy)?.label}
//           </button>
//           <div
//             className={`absolute right-0 mt-2 w-64 bg-[#171717] border border-gray-600 rounded-md shadow-lg transform transition-all duration-200 ease-in-out ${
//               showSortDropdown ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
//             } origin-top z-30`}
//           >
//             {sortOptions.map((option) => (
//               <button
//                 key={option.value}
//                 onClick={() => handleSortSelect(option.value)}
//                 className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#333333] capitalize"
//               >
//                 {option.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Filter Sidebar */}
//         <section
//           className={`bg-[#0a0a0a] fixed top-[73px] min-h-screen p-4 w-64 transform transition-transform duration-300 ease-in-out z-50 ${
//             isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
//           } md:translate-x-0 md:w-64`}
//         >
//           <div className="flex flex-col gap-4">
//             {/* Search Input */}
//             <div className="flex">
//               <input
//                 type="text"
//                 value={localSearch}
//                 onChange={(e) => setLocalSearch(e.target.value)}
//                 onKeyDown={handleSearchKeyDown}
//                 placeholder="Search shots..."
//                 className="w-full px-3 py-2 text-sm text-white bg-[#333333] border border-none rounded focus:outline-none"
//               />
//             </div>
//             <div className="flex justify-between">
//               <p>FILTER RESULTS</p>
//               <button onClick={clearAllFilters} className="text-primary">Clear all</button>
//             </div>
//           </div>

//           <div className="mt-8 max-h-[calc(100vh-150px)] overflow-y-auto no-scrollbar">
//             {filters.map((filterGroup, idx) => (
//               <div
//                 key={idx}
//                 onClick={() => dropDownHandler(filterGroup?.id)}
//                 className="border-b border-gray-600 text-sm py-1 cursor-pointer"
//               >
//                 <p className="px-1 capitalize p-1 hover:bg-[#171717]">{filterGroup?.title}</p>
//                 <div
//                   className={`overflow-hidden transition-all duration-500 ease-in-out mt-2 ${
//                     showDropDown && filterGroup.id === id ? 'max-h-[500px]' : 'max-h-0'
//                   }`}
//                 >
//                   {filterGroup?.item.map((item, index) => {
//                     const key = filterGroup.name;
//                     const checked = selectedFilters[key]?.includes(item) ?? false;
//                     return (
//                       <label key={index} className="flex gap-2 px-2 cursor-pointer space-y-3">
//                         <input
//                           type="checkbox"
//                           checked={checked}
//                           onChange={(e) => filterHandler(e, key, item)}
//                           className="mt-1"
//                         />
//                         <p className="capitalize">{item}</p>
//                       </label>
//                     );
//                   })}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Spacer for layout */}
//         <section className="md:min-w-[250px]"></section>

//         {/* Main Content */}
//         <section className="grid mt-32 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full">
//           <div className="flex justify-end p-4 space-x-4">
//             <button onClick={toggleSidebar} className="text-white focus:outline-none md:hidden">
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
//               </svg>
//             </button>
//           </div>

//           {data?.data && data?.data?.map((data, idx) => (
//             <div
//               onClick={() => {
//                 setSelectedShot(data);
//                 setModalIsOpen(true);
//                 handleClick(data._id)
//               }}
//               key={idx}
//               className="p-2 cursor-pointer"
//             >
//               <Image
//                 alt="img"
//                 src={data?.imageUrl}
//                 height={400}
//                 width={400}
//                 className="object-cover w-full h-auto rounded-lg"
//               />
//             </div>
//           ))}
//         </section>
//       </div>

//       {/* Modal */}
//       <AnimatePresence>
//         {modalIsOpen && selectedShot && (
//           <motion.div
//             className="fixed inset-0 no-scrollbar  flex justify-center items-center z-[999]"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => setModalIsOpen(false)}
//           >
//             <motion.div
//               className="bg-[#1a1a1a] text-white rounded-xl  shadow-2xl w-[60%]  ml-20 mt-16 overflow-y-scroll no-scrollbar max-h-[90vh] p-4 relative"
//               initial={{ scale: 0.8, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.8, opacity: 0 }}
//               transition={{ duration: 0.3 }}
//               onClick={(e) => e.stopPropagation()}
//             >
//               <button
//                 className="absolute top-2 right-2 text-white text-xl font-bold hover:text-red-500"
//                 onClick={() => setModalIsOpen(false)}
//               >
//                 &times;
//               </button>
//               {/* <Image
//                 src={selectedShot.imageUrl}
//                 alt="Shot"
//                 width={600}
//                 height={400}
//                 className="rounded-lg w-full object-cover mb-4"
//               /> */}

//               {/* <iframe
//           id="ytplayer"
//           className={}
//           type="text/html"
//           width="100%"
//           height="360"
//           src={`https://youtu.be/JqGv0EdJdJI?si=7NHTFkpAOHb6Kpa-`}
//           frameborder="0"
//         ></iframe> */}


// {
//   console.log(selectedShot, 'this is selected shot')
// }
//   {selectedShot.youtubeLink?.includes("youtu") ? (
//   <iframe
//     width="100%"
//     height="360"
//     src={getYouTubeEmbedUrl(selectedShot.youtubeLink)}
//     frameBorder="0"
//     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//     allowFullScreen
//   ></iframe>
// ) : selectedShot.youtubeLink?.includes("cloudinary.com") ? (
//   <video width="100%" height="100" controls>
//     <source src={selectedShot.youtubeLink} type="video/mp4" />
//     Your browser does not support the video tag.
//   </video>
// ) : (
//   <p>No valid video link found.</p>
// )}



//               {/* <iframe 
//                 src="https://youtu.be/JqGv0EdJdJI?si=7NHTFkpAOHb6Kpa-" 
//                 width="1920" 
//                 height="1080" 
//                 frameBorder="0" 
//                 allowFullScreen 
//                 uk-responsive 
//                 uk-video="automute: true">
//             </iframe> */}
//               <div className="text-left space-y-2">
//                 <h2 className="text-xl font-semibold">{selectedShot.title || 'Shot Title'}</h2>
//                 <p className="text-sm text-gray-300">{selectedShot.description || 'No description available.'}</p>

//                 <div className='border-t border-gray-400'>
//           <section className='flex justify-between gap-8 '>

//             {/* left side */}
//                     <div className='space-y-1 mt-4'>  

//                     <h4 className='font-semibold text-white text-xs'>Genre:

// {
//   selectedShot?.genre?.map((g, idx)=> (
//     <span key={idx} className='text-xs font-normal ml-4 text-[#999]'>{g}</span>
//   ))
// }

// </h4>

// <h4 className='font-semibold text-white text-xs'>Director:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.director}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Cinematographer:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.cinematographer}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Production Designer:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.productionDesigner}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Costume Designer:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.costumeDesigner}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Editor:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.editor}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Colorist:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.editor}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Actors:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.actors}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Shot Time:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.shotTime}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Time Period:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.timePeriod}</span>

// </h4>


//                   </div>

//                   {/* middle */}

//                      <div className='space-y-1 mt-4'>  

//                     <h4 className='font-semibold text-white text-xs'>Color:

// {
//   selectedShot?.color?.map((g, idx)=> (
//     <span key={idx} className='text-xs font-normal ml-4 text-[#999]'>{g}</span>
//   ))
// }

// </h4>

// <h4 className='font-semibold text-white text-xs'>Aspect Ratio:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.aspectRatio}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Format:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.format}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Frame Size:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.frameSize}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Shot Type:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.shotType}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Lens Size:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.lensSize}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Colorist:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.editor}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Composition:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.composition}</span>

// </h4>

//                     <h4 className='font-semibold text-white text-xs'>Lighting:

// {
//   selectedShot?.lightingStyle?.map((l, idx)=> (
//     <span key={idx} className='text-xs font-normal ml-4 text-[#999]'>{l}</span>
//   ))
// }

// </h4>
//                     <h4 className='font-semibold text-white text-xs'>Lighting Type:

// {
//   selectedShot?.lightingType?.map((l, idx)=> (
//     <span key={idx} className='text-xs font-normal ml-4 text-[#999]'>{l}</span>
//   ))
// }

// </h4>



//                   </div>


//                   {/* right side */}

//          <div className='space-y-1 mt-4'>  

//                     <h4 className='font-semibold text-white text-xs'>Time of Day:

// {
//   selectedShot?.timeOfDay?.map((t, idx)=> (
//     <span key={idx} className='text-xs font-normal ml-4 text-[#999]'>{t}</span>
//   ))
// }

// </h4>

// <h4 className='font-semibold text-white text-xs'>Interior/Exterior:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.interiorExterior}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Location Type:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.filmingLocation}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Set:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.set}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Story Location:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.storyLocation}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Camera:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.camera}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Lens:

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.lens}</span>

// </h4>
// <h4 className='font-semibold text-white text-xs'>Film Stock / Resolution::

// <span className='text-xs font-normal ml-4 text-[#999]'>{selectedShot?.filmStockResolution
// }</span>

// </h4>

                 

                



//                   </div>
//           </section>

//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Hide Scrollbar */}
//       <style jsx>{`
//         .no-scrollbar::-webkit-scrollbar {
//           display: none;
//         }
//         .no-scrollbar {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//       `}</style>
//     </div>
//   );
// }


'use client';
import { useGetShotsQuery } from '@/redux/api/shot';
import { base_url, filters } from '@/utils/utils';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect, Suspense } from 'react';

function Browse() {
  const searchParams = useSearchParams();
  const [showDropDown, setShowDropDown] = useState(false);
  const [id, setId] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [localSearch, setLocalSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState('mostPopular');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedShot, setSelectedShot] = useState(null);

  const handleClick = async (id) => {
    try {
      const data = await axios.patch(`${base_url}/shot/click/${id}`);
      console.log(data, 'click handle');
    } catch (error) {
      console.error('Error handling click:', error);
    }
  };

  const sortOptions = [
    { label: 'Most Popular', value: 'mostPopular' },
    { label: 'Release Date (Newest to Oldest)', value: 'releaseDateDesc' },
    { label: 'Release Date (Oldest to Newest)', value: 'releaseDateAsc' },
    { label: 'Recently Added', value: 'recentlyAdded' },
    { label: 'Random', value: 'random' },
    { label: 'Alphabetically by Title', value: 'alphabetical' },
  ];

  // Parse URL parameters on component mount
  useEffect(() => {
    if (!searchParams) return;
    const params = new URLSearchParams(searchParams);
    const initialFilters = {};
    const filterKeys = new Set(filters.map((f) => f.name));

    params.forEach((value, key) => {
      if (key === 'search') {
        setLocalSearch(value);
        setSubmittedSearch(value);
      } else if (key === 'sortBy') {
        setSortBy(value);
      } else if (filterKeys.has(key)) {
        if (!initialFilters[key]) {
          initialFilters[key] = [];
        }
        initialFilters[key].push(value);
      }
    });

    setSelectedFilters(initialFilters);
  }, [searchParams]);

  function getYouTubeEmbedUrl(url) {
    try {
      const yt = new URL(url);
      if (yt.hostname.includes('youtu.be')) {
        return `https://www.youtube.com/embed/${yt.pathname.split('/')[1]}`;
      }
      if (yt.hostname.includes('youtube.com')) {
        return `https://www.youtube.com/embed/${yt.searchParams.get('v')}`;
      }
    } catch (err) {
      return null;
    }
    return null;
  }

  // Build query object from state
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
    query.sortBy = sortBy;
  }

  const { data, isLoading, error } = useGetShotsQuery(query);

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
    setSortBy('mostPopular');
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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Error loading shots. Please try again later.
      </div>
    );
  }

  return (
    <div>
      <div className="flex">
        {/* Sort Dropdown */}
        <div className="absolute top-[136.5px] md:top-24 z-30 right-12 md:right-8">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="text-white bg-[#333333] px-4 py-2 rounded-md text-sm focus:outline-none hover:bg-[#444444]"
          >
            Sort by: {sortOptions.find((opt) => opt.value === sortBy)?.label}
          </button>
          <div
            className={`absolute right-0 mt-2 w-64 bg-[#171717] border border-gray-600 rounded-md shadow-lg transform transition-all duration-200 ease-in-out ${
              showSortDropdown ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
            } origin-top z-30`}
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
            <div className="flex justify-between">
              <p>FILTER RESULTS</p>
              <button onClick={clearAllFilters} className="text-primary">
                Clear all
              </button>
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

        {/* Spacer for layout */}
        <section className="md:min-w-[250px]"></section>

        {/* Main Content */}
        <section className="grid mt-32 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full">
          <div className="flex justify-end p-4 space-x-4">
            <button onClick={toggleSidebar} className="text-white focus:outline-none md:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {data?.data?.map((data, idx) => (
            <div
              onClick={() => {
                setSelectedShot(data);
                setModalIsOpen(true);
                handleClick(data._id);
              }}
              key={idx}
              className="p-2 cursor-pointer"
            >
              <Image
                alt="img"
                src={data?.imageUrl}
                height={400}
                width={400}
                className="object-cover w-full h-auto rounded-lg"
              />
            </div>
          ))}
        </section>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalIsOpen && selectedShot && (
          <motion.div
            className="fixed inset-0 no-scrollbar flex justify-center items-center z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalIsOpen(false)}
          >
            <motion.div
              className="bg-[#1a1a1a] text-white rounded-xl shadow-2xl w-[60%] ml-20 mt-16 overflow-y-scroll no-scrollbar max-h-[90vh] p-4 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-white text-xl font-bold hover:text-red-500"
                onClick={() => setModalIsOpen(false)}
              >
                ×
              </button>
              {selectedShot.youtubeLink?.includes('youtu') ? (
                <iframe
                  width="100%"
                  height="360"
                  src={getYouTubeEmbedUrl(selectedShot.youtubeLink)}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : selectedShot.youtubeLink?.includes('cloudinary.com') ? (
                <video width="100%" height="100" controls>
                  <source src={selectedShot.youtubeLink} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <p>No valid video link found.</p>
              )}

              <div className="text-left space-y-2">
                <h2 className="text-xl font-semibold">{selectedShot.title || 'Shot Title'}</h2>
                <p className="text-sm text-gray-300">{selectedShot.description || 'No description available.'}</p>

                <div className="border-t border-gray-400">
                  <section className="flex justify-between gap-8">
                    {/* Left Side */}
                    <div className="space-y-1 mt-4">
                      <h4 className="font-semibold text-white text-xs">
                        Genre:
                        {selectedShot?.genre?.map((g, idx) => (
                          <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                            {g}
                          </span>
                        ))}
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Director:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.director}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Cinematographer:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.cinematographer}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Production Designer:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.productionDesigner}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Costume Designer:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.costumeDesigner}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Editor:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.editor}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Colorist:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.colorist}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Actors:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.actors}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Shot Time:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.shotTime}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Time Period:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.timePeriod}</span>
                      </h4>
                    </div>

                    {/* Middle */}
                    <div className="space-y-1 mt-4">
                      <h4 className="font-semibold text-white text-xs">
                        Color:
                        {selectedShot?.color?.map((g, idx) => (
                          <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                            {g}
                          </span>
                        ))}
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Aspect Ratio:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.aspectRatio}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Format:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.format}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Frame Size:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.frameSize}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Shot Type:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.shotType}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Lens Size:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.lensSize}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Composition:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.composition}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Lighting:
                        {selectedShot?.lightingStyle?.map((l, idx) => (
                          <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                            {l}
                          </span>
                        ))}
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Lighting Type:
                        {selectedShot?.lightingType?.map((l, idx) => (
                          <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                            {l}
                          </span>
                        ))}
                      </h4>
                    </div>

                    {/* Right Side */}
                    <div className="space-y-1 mt-4">
                      <h4 className="font-semibold text-white text-xs">
                        Time of Day:
                        {selectedShot?.timeOfDay?.map((t, idx) => (
                          <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                            {t}
                          </span>
                        ))}
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Interior/Exterior:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.interiorExterior}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Location Type:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.filmingLocation}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Set:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.set}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Story Location:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.storyLocation}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Camera:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.camera}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Lens:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.lens}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Film Stock / Resolution:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.filmStockResolution}</span>
                      </h4>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hide Scrollbar */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

// Wrap the Browse component with Suspense
export default function BrowseWithSuspense() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <Browse />
    </Suspense>
  );
}