'use client';
import { useGetMyShotQuery, useGetShotCountQuery, useGetShotsQuery } from '@/redux/api/shot';
import { useSecureAxios } from '@/utils/Axios';

import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Swal from 'sweetalert2';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';
import { base_url, filters } from '@/utils/utils';

function Random() {
  const searchParams = useSearchParams();
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [localSearch, setLocalSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState('random');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedShot, setSelectedShot] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allShots, setAllShots] = useState([]);
  const user = useSession();
  const axiosInstance = useSecureAxios();
  const Userid = user?.data?.user?.id;
  const swiperRef = useRef(null); // Ref for Swiper instance

  const { refetch } = useGetMyShotQuery(Userid);

  const sortOptions = [
    { label: 'Most Popular', value: 'mostPopular' },
    { label: 'Release Date (Newest to Oldest)', value: 'releaseDateDesc' },
    { label: 'Release Date (Oldest to Newest)', value: 'releaseDateAsc' },
    { label: 'Recently Added', value: 'recentlyAdded' },
    { label: 'Random', value: 'random' },
    { label: 'Alphabetically by Title', value: 'alphabetical' },
  ];

  // Parse URL parameters
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
    setCurrentPage(1);
    setAllShots([]);
    setHasMore(true);
  }, [searchParams]);

  // Build query object
  const query = {
    ...Object.fromEntries(
      Object.entries(selectedFilters).filter(([_, values]) => values.length > 0)
    ),
    ...(submittedSearch && submittedSearch.trim() !== '' && { search: submittedSearch }),
    ...(sortBy && { sortBy }),
    page: currentPage,
    limit: 10, // Smaller limit for carousel
  };

  const { data, isLoading, error, isFetching } = useGetShotsQuery(query, {
    skip: !hasMore || isFetching,
  });
  const { data: count } = useGetShotCountQuery();

  // Append new shots to allShots
  useEffect(() => {
    if (data?.data?.length) {
      setAllShots((prev) => {
        const newShots = data.data.filter(
          (newShot) => !prev.some((shot) => shot._id === newShot._id)
        );
        return [...prev, ...newShots];
      });
      setHasMore(data.data.length === query.limit && allShots.length + data.data.length < count?.count);
    }
  }, [data, count?.count, query.limit, allShots.length]);

  // Swiper slide change handler to trigger loading more shots
  const handleSlideChange = useCallback(() => {
    if (!swiperRef.current || !hasMore || isFetching || isLoading) return;
    const swiper = swiperRef.current.swiper;
    if (swiper.activeIndex >= allShots.length - 3) { // Load more when nearing the end
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasMore, isFetching, isLoading, allShots.length]);

  // Helper functions for video thumbnails
  function getYouTubeThumbnail(url) {
    try {
      const yt = new URL(url);
      let videoId;
      if (yt.hostname.includes('youtube.com') && yt.pathname.includes('/shorts/')) {
        videoId = yt.pathname.split('/')[2];
      } else if (yt.hostname.includes('youtu.be')) {
        videoId = yt.pathname.split('/')[1];
      } else if (yt.hostname.includes('youtube.com')) {
        videoId = yt.searchParams.get('v');
      }
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    } catch (err) {
      console.error('Error parsing YouTube URL:', err);
    }
    return null;
  }

  function getCloudinaryThumbnail(url) {
    try {
      const cloudinaryUrl = new URL(url);
      if (cloudinaryUrl.hostname.includes('cloudinary.com') && url.includes('/video/')) {
        const pathParts = cloudinaryUrl.pathname.split('/');
        const uploadIndex = pathParts.findIndex((part) => part === 'upload');
        if (uploadIndex !== -1) {
          pathParts.splice(uploadIndex + 1, 0, 'c_thumb,w_400,h_400,g_auto,so_10');
          const fileNameParts = pathParts[pathParts.length - 1].split('.');
          if (fileNameParts.length > 1) {
            fileNameParts[fileNameParts.length - 1] = 'jpg';
            pathParts[pathParts.length - 1] = fileNameParts.join('.');
          }
          return `${cloudinaryUrl.origin}${pathParts.join('/')}`;
        }
      }
    } catch (err) {
      console.error('Error parsing Cloudinary URL:', err);
    }
    return null;
  }

  function getYouTubeEmbedUrl(url) {
    try {
      const yt = new URL(url);
      if (yt.hostname.includes('youtube.com') && yt.pathname.includes('/shorts/')) {
        return `https://www.youtube.com/embed/${yt.pathname.split('/')[2]}`;
      } else if (yt.hostname.includes('youtu.be')) {
        return `https://www.youtube.com/embed/${yt.pathname.split('/')[1]}`;
      } else if (yt.hostname.includes('youtube.com')) {
        return `https://www.youtube.com/embed/${yt.searchParams.get('v')}`;
      }
    } catch (err) {
      return null;
    }
    return null;
  }

  const handleClick = async (id) => {
    try {
      await axios.patch(`${base_url}/shot/click/${id}`);
    } catch (error) {
      console.error('Error handling click:', error);
    }
  };

  const addCollection = async (id, data) => {
    const response = await axiosInstance.post(`/shot/collection/`, {
      userId: Userid,
      shotId: id,
      data,
    });
    if (response.status === 201) {
      Swal.fire({
        title: 'Success',
        text: 'Shot added to your collection',
        icon: 'success',
      });
      refetch();
    }
  };

  const dropDownHandler = (id) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filterHandler = (e, groupName, value) => {
    const isChecked = e.target.checked;
    setSelectedFilters((prev) => {
      const currentValues = prev[groupName] || [];
      return {
        ...prev,
        [groupName]: isChecked
          ? [...currentValues, value]
          : currentValues.filter((v) => v !== value),
      };
    });
    setCurrentPage(1);
    setAllShots([]);
    setHasMore(true);
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    setLocalSearch('');
    setSubmittedSearch('');
    setSortBy('random');
    setCurrentPage(1);
    setAllShots([]);
    setHasMore(true);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSubmittedSearch(localSearch);
      setCurrentPage(1);
      setAllShots([]);
      setHasMore(true);
    }
  };

  const handleSortSelect = (value) => {
    setSortBy(value);
    setShowSortDropdown(false);
    setCurrentPage(1);
    setAllShots([]);
    setHasMore(true);
  };

  if (isLoading && currentPage === 1) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Error loading shots. Please try again later.
      </div>
    );
  }

  return (
    <div className="mt-28 min-h-screen">
      <div className="flex">
        {/* Sort Dropdown */}
        <div className="absolute top-[90.5px] md:top-24 z-30 right-12 md:right-8">
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
                className="w-full px-3 py-2 text-sm text-white bg-[#333333] border-none rounded focus:outline-none"
              />
            </div>
            <div className="flex justify-between">
              <p>FILTER RESULTS</p>
              <button onClick={clearAllFilters} className="text-blue-500 hover:text-blue-400">
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
                    openDropdowns[filterGroup.id] ? 'max-h-[500px]' : 'max-h-0'
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

        {/* Main Content Area */}
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center drop-shadow-md">
            Random Shots
          </h1>

          <div className="flex justify-end absolute top-20 right-0  p-4 space-x-4">
            <button onClick={toggleSidebar} className="text-white focus:outline-none ">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Carousel Slider */}
          <div className="relative mb-8 h-[40vh] md:h-[50vh] lg:h-[60vh]">
            <Swiper
              modules={[Navigation, Autoplay, EffectCoverflow]}
              effect="coverflow"
              coverflowEffect={{
                rotate: 30,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }}
              spaceBetween={10}
              slidesPerView={1.5}
              centeredSlides={true}
              navigation
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              loop={false} // Disable loop to support infinite loading
              className="h-full w-full"
              breakpoints={{
                640: { slidesPerView: 1.5, spaceBetween: 10 },
                768: { slidesPerView: 2.5, spaceBetween: 15 },
                1024: { slidesPerView: 3.5, spaceBetween: 20 },
              }}
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              onSlideChange={handleSlideChange}
            >
              <AnimatePresence>
                {allShots.map((shot) => {
                  let imageSrc = shot?.imageUrl;
                  if (!imageSrc && shot?.youtubeLink) {
                    if (shot.youtubeLink.includes('youtu')) {
                      imageSrc = getYouTubeThumbnail(shot.youtubeLink);
                    } else if (shot.youtubeLink.includes('cloudinary.com')) {
                      imageSrc = getCloudinaryThumbnail(shot.youtubeLink);
                    }
                  }

                  return (
                    <SwiperSlide key={shot._id}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="relative h-full w-full rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 shadow-lg"
                        onClick={() => {
                          setSelectedShot(shot);
                          setModalIsOpen(true);
                          handleClick(shot._id);
                        }}
                      >
                        {imageSrc ? (
                          <Image
                            src={imageSrc}
                            alt={shot.title}
                            fill
                            className="object-cover rounded-xl"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="bg-gray-800 h-full w-full flex items-center justify-center rounded-xl">
                            <span className="text-gray-500 text-sm">No thumbnail available</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 p-4 text-white">
                          <h2 className="text-lg md:text-xl font-bold mb-1 drop-shadow-md">{shot.title}</h2>
                          <p className="text-xs md:text-sm line-clamp-2 drop-shadow-md">{shot.description}</p>
                          <button
                            className="mt-2 text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded self-start transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              addCollection(shot._id, shot);
                            }}
                          >
                            Add to Collection
                          </button>
                        </div>
                      </motion.div>
                    </SwiperSlide>
                  );
                })}
              </AnimatePresence>
            </Swiper>
          </div>

          {/* Loading Indicator */}
          {isFetching && hasMore && (
            <div className="flex justify-center my-8">
              <motion.div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </div>
          )}

          {/* No More Data Message */}
          {!hasMore && allShots.length > 0 && (
            <div className="text-center my-8 text-white">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                No more shots to load.
              </motion.p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalIsOpen && selectedShot && (
          <motion.div
            className="fixed inset-0 flex justify-center items-center z-[999] bg-black bg-opacity-90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalIsOpen(false)}
          >
            <motion.div
              className="bg-[#1a1a1a] text-white rounded-xl shadow-2xl w-[95%] md:w-[80%] lg:w-[60%] max-h-[90vh] overflow-y-auto no-scrollbar p-6 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-red-500 z-10"
                onClick={() => setModalIsOpen(false)}
              >
                ×
              </button>

              {/* Video/Image Section */}
              <div className="relative h-64 md:h-80 lg:h-96 mb-6 rounded-lg overflow-hidden">
                {selectedShot.youtubeLink?.includes('youtu') ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={getYouTubeEmbedUrl(selectedShot.youtubeLink)}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                ) : selectedShot.youtubeLink?.includes('cloudinary.com') ? (
                  <video width="100%" height="100%" controls className="rounded-lg">
                    <source src={selectedShot.youtubeLink} type="video/mp4" />
                  </video>
                ) : (
                  <Image
                    src={selectedShot.imageUrl}
                    alt={selectedShot.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                )}
              </div>

              {/* Details Section - Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Creative Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-700">Creative</h3>
                  <DetailItem label="Title" value={selectedShot.title} />
                  <DetailItem label="Director" value={selectedShot.director} />
                  <DetailItem label="Cinematographer" value={selectedShot.cinematographer} />
                  <DetailItem label="Genre" value={selectedShot.genre?.join(', ')} />
                </div>

                {/* Technical Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-700">Technical</h3>
                  <DetailItem label="Camera" value={selectedShot.camera} />
                  <DetailItem label="Lens" value={selectedShot.lens} />
                  <DetailItem label="Aspect Ratio" value={selectedShot.aspectRatio} />
                  <DetailItem label="Lighting" value={selectedShot.lightingStyle?.join(', ')} />
                </div>

                {/* Contextual Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-700">Context</h3>
                  <DetailItem label="Time of Day" value={selectedShot.timeOfDay?.join(', ')} />
                  <DetailItem label="Location" value={selectedShot.filmingLocation} />
                  <DetailItem label="Shot Type" value={selectedShot.shotType} />
                  <DetailItem label="Color Palette" value={selectedShot.color?.join(', ')} />
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-300">{selectedShot.description || 'No description available.'}</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => addCollection(selectedShot._id, selectedShot)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
                >
                  Add to Collection
                </button>
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
        .swiper-slide {
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .swiper-slide:not(.swiper-slide-active) {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}

// Helper component for detail items
function DetailItem({ label, value }) {
  return (
    <div className="mb-3">
      <p className="text-sm font-medium text-gray-300">{label}</p>
      <p className="text-sm text-gray-400">{value || 'N/A'}</p>
    </div>
  );
}

export default function RandomWithSuspense() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black">Loading...</div>}>
      <Random />
    </Suspense>
  );
}