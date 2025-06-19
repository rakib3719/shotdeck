'use client';
import { useGetMyShotQuery, useGetShotCountQuery, useGetShotsQuery } from '@/redux/api/shot';
import { useSecureAxios } from '@/utils/Axios';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, Suspense } from 'react';
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

  // Helper functions for video handling
  const convertTimecodeToSeconds = (timecode) => {
    const parts = timecode.split(':').reverse();
    return parts.reduce((total, part, index) => {
      return total + (parseInt(part) || 0) * Math.pow(60, index);
    }, 0);
  };

  const getYouTubeThumbnail = (url) => {
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
      return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    } catch (err) {
      console.error('Error parsing YouTube URL:', err);
      return null;
    }
  };

  const getVimeoThumbnail = (url) => {
    try {
      const vimeoUrl = new URL(url);
      const videoId = vimeoUrl.pathname.split('/').pop();
      return videoId ? `https://vumbnail.com/${videoId}.jpg` : null;
    } catch (err) {
      console.error('Error parsing Vimeo URL:', err);
      return null;
    }
  };

  const getCloudinaryThumbnail = (url, timecode = '0:00') => {
    try {
      const seconds = convertTimecodeToSeconds(timecode);
      const cloudinaryUrl = new URL(url);
      if (cloudinaryUrl.hostname.includes('cloudinary.com') && url.includes('/video/')) {
        const pathParts = cloudinaryUrl.pathname.split('/');
        const uploadIndex = pathParts.findIndex((part) => part === 'upload');
        if (uploadIndex !== -1) {
          pathParts.splice(uploadIndex + 1, 0, `c_thumb,w_400,h_400,g_auto,so_${seconds}`);
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
  };

  // Video Player Component
  const VideoPlayer = ({ shot }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
      videoRefs.current[shot._id] = {
        element: videoRef.current,
        isPlaying: false,
      };

      const handlePlay = () => {
        setIsPlaying(true);
        setPlayingVideoId(shot._id);
      };

      const handlePause = () => {
        setIsPlaying(false);
        if (playingVideoId === shot._id) {
          setPlayingVideoId(null);
        }
      };

      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.addEventListener('play', handlePlay);
        videoElement.addEventListener('pause', handlePause);
      }

      return () => {
        if (videoElement) {
          videoElement.removeEventListener('play', handlePlay);
          videoElement.removeEventListener('pause', handlePause);
        }
        delete videoRefs.current[shot._id];
      };
    }, [shot._id]);

    const getVideoThumbnail = (url, timecode = '0:00') => {
      try {
        const seconds = convertTimecodeToSeconds(timecode);
        if (url.includes('cloudinary.com')) {
          return getCloudinaryThumbnail(url, timecode);
        } else if (url.includes('youtu')) {
          return getYouTubeThumbnail(url);
        } else if (url.includes('vimeo.com')) {
          return getVimeoThumbnail(url);
        }
        return null;
      } catch (err) {
        console.error('Error generating thumbnail:', err);
        return null;
      }
    };

    const getYouTubeEmbedUrl = (url, startTime = 0) => {
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
        return videoId ? `https://www.youtube.com/embed/${videoId}?start=${startTime}&autoplay=1` : null;
      } catch (err) {
        console.error('Error parsing YouTube URL:', err);
        return null;
      }
    };

    const getVimeoEmbedUrl = (url) => {
      try {
        const vimeo = new URL(url);
        if (vimeo.hostname.includes('vimeo.com')) {
          const videoId = vimeo.pathname.split('/').filter(segment => segment)[0];
          if (videoId) {
            return `https://player.vimeo.com/video/${videoId}`;
          }
        }
      } catch (err) {
        console.error('Error parsing Vimeo URL:', err);
      }
      return null;
    };

    const getCloudinaryVideoUrl = (url) => {
      try {
        const cloudinaryUrl = new URL(url);
        if (cloudinaryUrl.hostname.includes('cloudinary.com') && url.includes('/video/')) {
          const pathParts = cloudinaryUrl.pathname.split('/');
          const fileName = pathParts[pathParts.length - 1];
          if (fileName.endsWith('.mp4') || fileName.endsWith('.webm')) {
            return url;
          }
          pathParts[pathParts.length - 1] = fileName.split('.')[0] + '.mp4';
          return `${cloudinaryUrl.origin}${pathParts.join('/')}`;
        }
      } catch (err) {
        console.error('Error parsing Cloudinary URL:', err);
      }
      return null;
    };

    return (
      <div className="relative w-full h-full">
        {shot.youtubeLink.includes('youtu') ? (
          <iframe
            ref={videoRef}
            width="100%"
            height="100%"
            src={getYouTubeEmbedUrl(shot.youtubeLink)}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        ) : shot.youtubeLink.includes('vimeo.com') ? (
          <div className="relative pb-[56.25%] h-0 overflow-hidden">
            <iframe
              ref={videoRef}
              src={`${getVimeoEmbedUrl(shot.youtubeLink)}${isPlaying ? '?autoplay=1' : ''}`}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : shot.youtubeLink.includes('cloudinary.com') ? (
          <video
            ref={videoRef}
            width="100%"
            height="100%"
            controls
            playsInline
            preload="metadata"
            className="w-full h-full object-contain bg-black"
            poster={shot.imageUrl || getVideoThumbnail(shot.youtubeLink, shot.thumbnailTimecode?.[0] || '0:00')}
          >
            <source src={getCloudinaryVideoUrl(shot.youtubeLink)} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <span className="text-white">Invalid video URL</span>
          </div>
        )}

        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={() => {
              if (videoRef.current) {
                if (shot.youtubeLink.includes('youtu') || shot.youtubeLink.includes('vimeo.com')) {
                  setIsPlaying(true);
                  setPlayingVideoId(shot._id);
                } else if (shot.youtubeLink.includes('cloudinary.com')) {
                  videoRef.current.play().catch((err) => {
                    console.error('Play failed, trying muted:', err);
                    videoRef.current.muted = true;
                    videoRef.current.play().catch((e) => console.error('Muted play failed:', e));
                  });
                }
              }
            }}
          >
            <div className="w-16 h-16 bg-black bg-opacity-60 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Handle timecode clicks
  const handleTimecodeClick = (timeString, videoUrl, shotId) => {
    const timeParts = timeString.split(':');
    const seconds = (+timeParts[0]) * 60 + (+timeParts[1]);
    const videoElement = videoRefs.current[shotId]?.element;

    if (!videoElement) return;

    if (videoUrl.includes('youtu')) {
      // For YouTube, recreate iframe with new timestamp
      setPlayingVideoId(shotId);
      videoRefs.current[shotId].isPlaying = true;
    } else if (videoUrl.includes('vimeo.com')) {
      // For Vimeo, use postMessage to seek
      if (videoElement.contentWindow) {
        videoElement.contentWindow.postMessage(
          { method: 'seekTo', value: seconds },
          'https://player.vimeo.com'
        );
      }
      setPlayingVideoId(shotId);
      videoRefs.current[shotId].isPlaying = true;
    } else if (videoUrl.includes('cloudinary.com')) {
      // For direct video, set currentTime
      videoElement.currentTime = seconds;
      if (!videoRefs.current[shotId]?.isPlaying) {
        videoElement.play().catch((err) => {
          console.error('Play failed:', err);
          videoElement.muted = true;
          videoElement.play().catch((e) => console.error('Muted play failed:', e));
        });
      }
      setPlayingVideoId(shotId);
      videoRefs.current[shotId].isPlaying = true;
    }
    handleClick(shotId);
  };

  // Track video clicks
  const handleClick = async (id) => {
    try {
      await axios.patch(`${base_url}/shot/click/${id}`);
    } catch (error) {
      console.error('Error handling click:', error);
    }
  };

  // Initialize filters from URL params
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

  // Build query for fetching shots
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

  // Shuffle and select 3 random shots
  useEffect(() => {
    if (data?.data?.length) {
      const shuffled = [...data.data].sort(() => 0.5 - Math.random());
      setAllShots(shuffled.slice(0, 3));
    }
  }, [data]);

  // Filter handlers
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

  // Loading state
  if (isLoading && allShots.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Error loading shots. Please try again later.
      </div>
    );
  }

  return (
    <div className="pt-28 min-h-screen">
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
                <p className="px-1 capitalize p-1 text-white hover:bg-[#171717]">{filterGroup?.title}</p>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out mt-2 ${
                    openDropdowns[filterGroup.id] ? 'max-h-[500px]' : 'max-h-0'
                  }`}
                >
                  {filterGroup?.item?.map((item, index) => {
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

          <div className="mt-8 border-t border-gray-600 pt-4">
            <Link href="/donate" className="text-blue-500 hover:text-blue-400 text-sm">
              Support Us with a Donation
            </Link>
            <button
              onClick={clearAllFilters}
              className="mt-4 text-red-500 hover:text-red-400 text-sm w-full text-left"
            >
              Clear All Filters
            </button>
          </div>
        </section>

        {/* Spacer for layout */}
        <section className="md:min-w-[250px]"></section>

        {/* Main Content Area */}
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center drop-shadow-md">
            Random Shots
          </h1>

          {/* Mobile filter toggle */}
          <div className="flex justify-end absolute top-20 right-0 p-4 space-x-4 md:hidden">
            <button onClick={toggleSidebar} className="text-white focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Search input */}
          <div className="mb-6 max-w-md mx-auto">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search shots..."
              className="w-full px-4 py-2 rounded-md bg-[#333333] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Carousel Slider */}
          <div className="relative mb-8 h-[80vh]">
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
              onSlideChange={() => {
                if (playingVideoId) {
                  const videoElement = videoRefs.current[playingVideoId]?.element;
                  if (videoElement) {
                    videoElement.pause();
                  }
                  setPlayingVideoId(null);
                  videoRefs.current[playingVideoId].isPlaying = false;
                }
              }}
            >
              <AnimatePresence>
                {allShots.map((shot) => {
                  let imageSrc = shot?.imageUrl;
                  if (!imageSrc && shot?.youtubeLink) {
                    if (shot.youtubeLink.includes('cloudinary.com')) {
                      imageSrc = getCloudinaryThumbnail(shot.youtubeLink, shot.thumbnailTimecode?.[0] || '0:00');
                    } else if (shot.youtubeLink.includes('youtu')) {
                      imageSrc = getYouTubeThumbnail(shot.youtubeLink);
                    } else if (shot.youtubeLink.includes('vimeo.com')) {
                      imageSrc = getVimeoThumbnail(shot.youtubeLink);
                    }
                  }

                  return (
                    <SwiperSlide key={shot._id}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="relative h-full w-full rounded-xl overflow-hidden shadow-lg bg-[#1a1a1a]"
                      >
                        {/* Video Container */}
                        <div className="h-1/2 w-full relative">
                          <VideoPlayer shot={shot} />
                        </div>

                        {/* Shot Info */}
                        <div className="h-1/2 p-4 overflow-y-auto">
                          <h2 className="text-lg md:text-xl font-bold mb-2 text-white">{shot.title}</h2>
                          <p className="text-sm text-gray-300 mb-4">{shot.description}</p>

                          {/* Timecodes section */}
                          {shot.timecodes && shot.timecodes.length > 0 && (
                            <div className="mb-4 bg-[#2a2a2a] p-3 rounded-lg">
                              <h3 className="font-semibold mb-2 text-sm">Interest Points</h3>
                              <div className="space-y-2">
                                {shot.timecodes.map((tc, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center hover:bg-[#3a3a3a] p-2 rounded cursor-pointer transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTimecodeClick(tc.time, shot.youtubeLink, shot._id);
                                    }}
                                  >
                                    <Image 
                                      alt='img' 
                                      src={tc.image} 
                                      width={80} 
                                      height={60}
                                      className="rounded-md mr-3"
                                    />
                                    <div>
                                      <p className="text-blue-400 font-mono text-xs">{tc.time}</p>
                                      <p className="text-gray-300 text-xs">{tc.label}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Shot Details */}
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
                            <div>
                              <p className="text-gray-400">Genre</p>
                              <p className="text-white">{shot.genre?.join(', ') || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Color</p>
                              <p className="text-white">{shot.color?.join(', ') || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Lighting</p>
                              <p className="text-white">{shot.lightingStyle?.join(', ') || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Time of Day</p>
                              <p className="text-white">{shot.timeOfDay?.join(', ') || 'N/A'}</p>
                            </div>
                          </div>

                          {/* Additional Details */}
                          <div className="mt-4 space-y-2 text-xs">
                            <div>
                              <p className="text-gray-400">Focal Length</p>
                              <p className="text-white">{shot.focalLength?.join(', ') || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Video Type</p>
                              <p className="text-white">{shot.videoType?.join(', ') || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Video Quality</p>
                              <p className="text-white">{shot.videoQuality?.join(', ') || 'N/A'}</p>
                            </div>
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
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

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

export default function RandomWithSuspense() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black">Loading...</div>}>
      <Random />
    </Suspense>
  );
}