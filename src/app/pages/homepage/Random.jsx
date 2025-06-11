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
import { Navigation, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';
import { base_url, filters } from '@/utils/utils';
import Link from 'next/link';

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
  const [allShots, setAllShots] = useState([]);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const user = useSession();
  const axiosInstance = useSecureAxios();
  const Userid = user?.data?.user?.id;
  const swiperRef = useRef(null);
  const videoRefs = useRef({});

  const { refetch } = useGetMyShotQuery(Userid);

  const sortOptions = [
    { label: 'Most Popular', value: 'mostPopular' },
    { label: 'Release Date (Newest to Oldest)', value: 'releaseDateDesc' },
    { label: 'Release Date (Oldest to Newest)', value: 'releaseDateAsc' },
    { label: 'Recently Added', value: 'recentlyAdded' },
    { label: 'Random', value: 'random' },
    { label: 'Alphabetically by Title', value: 'alphabetical' },
  ];

  function handleTimecodeClick(timeString, videoUrl) {
    const timeParts = timeString.split(':');
    const seconds = (+timeParts[0]) * 60 + (+timeParts[1]);
    
    if (videoUrl.includes('youtu')) {
      // YouTube video
      const videoPlayer = document.getElementById('video-player');
      if (videoPlayer) {
        const embedUrl = getYouTubeEmbedUrl(videoUrl);
        videoPlayer.src = `${embedUrl}?start=${seconds}&autoplay=1`;
      }
    } else if (videoUrl.includes('vimeo.com')) {
      // Vimeo video
      const videoPlayer = document.getElementById('video-player');
      if (videoPlayer && videoPlayer.contentWindow) {
        videoPlayer.contentWindow.postMessage({
          method: 'setCurrentTime',
          value: seconds
        }, 'https://player.vimeo.com');
      }
    } else {
      // Cloudinary or direct video
      const videoPlayer = document.getElementById('cloudinary-video');
      if (videoPlayer) {
        videoPlayer.currentTime = seconds;
        videoPlayer.play();
      }
    }
  }

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
    setAllShots([]);
  }, [searchParams]);

  // Build query object
  const query = {
    ...Object.fromEntries(
      Object.entries(selectedFilters).filter(([_, values]) => values.length > 0)
    ),
    ...(submittedSearch && submittedSearch.trim() !== '' && { search: submittedSearch }),
    ...(sortBy && { sortBy }),
    limit: 100,
  };

  const { data, isLoading, error } = useGetShotsQuery(query);
  const { data: count } = useGetShotCountQuery();

  // Select 3 random shots when data changes
  useEffect(() => {
    if (data?.data?.length) {
      const shuffled = [...data.data].sort(() => 0.5 - Math.random());
      setAllShots(shuffled.slice(0, 3));
    }
  }, [data]);

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

  function getVimeoEmbedUrl(url) {
    try {
      const vimeo = new URL(url);
      if (vimeo.hostname.includes('vimeo.com')) {
        return `https://player.vimeo.com/video${vimeo.pathname}`;
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
    setAllShots([]);
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    setLocalSearch('');
    setSubmittedSearch('');
    setSortBy('random');
    setAllShots([]);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSubmittedSearch(localSearch);
      setAllShots([]);
    }
  };

  const handleSortSelect = (value) => {
    setSortBy(value);
    setShowSortDropdown(false);
    setAllShots([]);
  };

  const toggleVideoPlay = (shotId, videoUrl) => {
    if (playingVideoId === shotId) {
      // Pause the video
      const videoElement = videoRefs.current[shotId];
      if (videoElement) {
        videoElement.pause();
      }
      setPlayingVideoId(null);
    } else {
      // Play the video
      setPlayingVideoId(shotId);
      handleClick(shotId);
    }
  };

  if (isLoading && allShots.length === 0) {
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
          
          {/* Donation Link */}
          <div className="mt-8 border-t border-gray-600 pt-4">
            <Link href="/donate" className="text-blue-500 hover:text-blue-400 text-sm">
              Support Us with a Donation
            </Link>
          </div>
        </section>

        {/* Spacer for layout */}
        <section className="md:min-w-[250px]"></section>

        {/* Main Content Area */}
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center drop-shadow-md">
            Random Shots
          </h1>

          <div className="flex justify-end absolute top-20 right-0 p-4 space-x-4">
            <button onClick={toggleSidebar} className="text-white focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Carousel Slider */}
          <div className="relative mb-8 h-[60vh]">
            <Swiper
              modules={[Navigation, EffectCoverflow]}
              effect="coverflow"
              coverflowEffect={{
                rotate: 30,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }}
              spaceBetween={30}
              slidesPerView={1}
              centeredSlides={true}
              navigation
              className="h-full w-full"
              breakpoints={{
                768: { slidesPerView: 1.5 },
                1024: { slidesPerView: 2 },
              }}
              onSwiper={(swiper) => (swiperRef.current = swiper)}
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
                        className="relative h-full w-full rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 shadow-lg bg-[#1a1a1a]"
                      >
                        {/* Video or Image Container */}
                        <div className="h-1/2 w-full relative">
                          {playingVideoId === shot._id ? (
                            <div className="h-full w-full bg-black">
                              {shot.youtubeLink.includes('youtu') ? (
                                <iframe
                                  id={`video-${shot._id}`}
                                  ref={(el) => (videoRefs.current[shot._id] = el)}
                                  width="100%"
                                  height="100%"
                                  src={`${getYouTubeEmbedUrl(shot.youtubeLink)}?autoplay=1`}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                ></iframe>
                              ) : shot.youtubeLink.includes('vimeo.com') ? (
                                <iframe
                                  id={`video-${shot._id}`}
                                  ref={(el) => (videoRefs.current[shot._id] = el)}
                                  src={`${getVimeoEmbedUrl(shot.youtubeLink)}?autoplay=1`}
                                  width="100%"
                                  height="100%"
                                  frameBorder="0"
                                  allow="autoplay; fullscreen; picture-in-picture"
                                  allowFullScreen
                                ></iframe>
                              ) : (
                                <video
                                  id={`video-${shot._id}`}
                                  ref={(el) => (videoRefs.current[shot._id] = el)}
                                  width="100%"
                                  height="100%"
                                  controls
                                  autoPlay
                                >
                                  <source src={shot.youtubeLink} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                              )}
                            </div>
                          ) : imageSrc ? (
                            <>
                              <Image
                                src={imageSrc}
                                alt={shot.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                              {/* Play Button */}
                              <div 
                                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                                onClick={() => toggleVideoPlay(shot._id, shot.youtubeLink)}
                              >
                                <div className="w-16 h-16 bg-black bg-opacity-60 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all">
                                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                  </svg>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="bg-gray-800 h-full w-full flex items-center justify-center">
                              <span className="text-gray-500 text-sm">No thumbnail available</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        </div>
                        
                        {/* Shot Info */}
                        <div className="h-1/2 p-4 overflow-y-auto">
                          <h2 className="text-lg md:text-xl font-bold mb-2 text-white">{shot.title}</h2>
                          <p className="text-sm text-gray-300 mb-4">{shot.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-gray-400">Director</p>
                              <p className="text-white">{shot.director || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Cinematographer</p>
                              <p className="text-white">{shot.cinematographer || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Camera</p>
                              <p className="text-white">{shot.camera || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Lens</p>
                              <p className="text-white">{shot.lens || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              className="text-xs px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                addCollection(shot._id, shot);
                              }}
                            >
                              Add to Collection
                            </button>
                            <button
                              className="text-xs px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedShot(shot);
                                setModalIsOpen(true);
                                handleClick(shot._id);
                              }}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </SwiperSlide>
                  );
                })}
              </AnimatePresence>
            </Swiper>
          </div>

          {/* No Shots Message */}
          {allShots.length === 0 && !isLoading && (
            <div className="text-center my-8 text-white">
              <p>No shots found matching your criteria.</p>
            </div>
          )}
        </div>
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
              className="bg-[#1a1a1a] text-white rounded-xl shadow-2xl w-[90%] lg:w-[60%] lg:ml-20 mt-16 overflow-y-scroll no-scrollbar max-h-[90vh] p-4 relative"
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
              {selectedShot.youtubeLink ? (
                <div>
                  {/* Video Player */}
                  {selectedShot.youtubeLink.includes('youtu') ? (
                    <iframe
                      id="video-player"
                      width="100%"
                      height="460"
                      src={getYouTubeEmbedUrl(selectedShot.youtubeLink)}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : selectedShot.youtubeLink.includes('vimeo.com') ? (
                    <div className="relative pb-[56.25%] h-0 overflow-hidden">
                      <iframe
                        id="video-player"
                        src={getVimeoEmbedUrl(selectedShot.youtubeLink)}
                        className="absolute top-0 left-0 w-full h-full"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <video id="cloudinary-video" width="100%" height="460" controls>
                      <source src={selectedShot.youtubeLink} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                
                  {/* Timecodes section */}
                  {selectedShot.timecodes && selectedShot.timecodes.length > 0 && (
                    <div className="mt-4 bg-[#2a2a2a] p-3 rounded-lg">
                      <h3 className="font-semibold mb-2">Timecodes</h3>
                      <div className="space-y-2">
                        {selectedShot.timecodes.map((tc, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center hover:bg-[#3a3a3a] p-2 rounded cursor-pointer transition-colors"
                            onClick={() => handleTimecodeClick(tc.time, selectedShot.youtubeLink)}
                          >
                            <span className="text-blue-400 font-mono mr-3">{tc.time}</span>
                            <span className="text-gray-300">{tc.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p>No valid video link found.</p>
              )}
              
              {/* Rest of your existing modal content */}
              <div className="text-left space-y-2">
                <h2 className="text-xl font-semibold">{selectedShot.title || 'Shot Title'}</h2>
                <p className="text-sm text-gray-300">{selectedShot.description || 'No description available.'}</p>
      
                <div className="border-t border-gray-400">
                  <section className="lg:flex justify-between gap-8">
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