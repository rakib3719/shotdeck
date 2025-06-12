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
  const youtubeIframeAPIRef = useRef(null);

  const { refetch } = useGetMyShotQuery(Userid);

  const sortOptions = [
    { label: 'Most Popular', value: 'mostPopular' },
    { label: 'Release Date (Newest to Oldest)', value: 'releaseDateDesc' },
    { label: 'Release Date (Oldest to Newest)', value: 'releaseDateAsc' },
    { label: 'Recently Added', value: 'recentlyAdded' },
    { label: 'Random', value: 'random' },
    { label: 'Alphabetically by Title', value: 'alphabetical' },
  ];

  // Load YouTube IFrame API
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      youtubeIframeAPIRef.current = true;
    };

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  function handleTimecodeClick(timeString, videoUrl, shotId) {
    const timeParts = timeString.split(':');
    const seconds = (+timeParts[0]) * 60 + (+timeParts[1]);
    
    const videoPlayer = videoRefs.current[shotId];
    if (!videoPlayer) return;

    if (videoUrl.includes('youtu')) {
      // For YouTube videos
      if (videoPlayer.player) {
        videoPlayer.player.seekTo(seconds, true);
        videoPlayer.player.playVideo();
      } else {
        // Fallback if player not initialized
        videoPlayer.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'seekTo',
            args: [seconds, true],
          }),
          '*'
        );
      }
    } else if (videoUrl.includes('vimeo.com')) {
      videoPlayer.contentWindow.postMessage(
        {
          method: 'setCurrentTime',
          value: seconds,
        },
        'https://player.vimeo.com'
      );
    } else {
      // For direct video files
      videoPlayer.currentTime = seconds;
      videoPlayer.play().catch((err) => console.error('Video play error:', err));
    }
    
    if (playingVideoId !== shotId) {
      toggleVideoPlay(shotId, videoUrl);
    }
  }

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

  useEffect(() => {
    if (data?.data?.length) {
      const shuffled = [...data.data].sort(() => 0.5 - Math.random());
      setAllShots(shuffled.slice(0, 3));
    }
  }, [data]);

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
      let videoId;
      if (yt.hostname.includes('youtube.com') && yt.pathname.includes('/shorts/')) {
        videoId = yt.pathname.split('/')[2];
      } else if (yt.hostname.includes('youtu.be')) {
        videoId = yt.pathname.split('/')[1];
      } else if (yt.hostname.includes('youtube.com')) {
        videoId = yt.searchParams.get('v');
      }
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`;
    } catch (err) {
      console.error('Error parsing YouTube URL:', err);
      return null;
    }
  }

  function getVimeoEmbedUrl(url) {
    try {
      const vimeo = new URL(url);
      if (vimeo.hostname.includes('vimeo.com')) {
        return `https://player.vimeo.com/video${vimeo.pathname}?autoplay=1&title=0&byline=0&portrait=0`;
      }
    } catch (err) {
      console.error('Error parsing Vimeo URL:', err);
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
      // Pause the current video
      const videoElement = videoRefs.current[shotId];
      if (videoElement) {
        if (videoUrl.includes('youtu')) {
          if (videoElement.player) {
            videoElement.player.pauseVideo();
          } else {
            videoElement.contentWindow.postMessage(
              JSON.stringify({
                event: 'command',
                func: 'pauseVideo',
                args: [],
              }),
              '*'
            );
          }
        } else if (videoUrl.includes('vimeo.com')) {
          videoElement.contentWindow.postMessage(
            {
              method: 'pause',
            },
            'https://player.vimeo.com'
          );
        } else {
          videoElement.pause();
        }
      }
      setPlayingVideoId(null);
    } else {
      // Pause any currently playing video
      if (playingVideoId) {
        const currentVideo = allShots.find(shot => shot._id === playingVideoId);
        if (currentVideo) {
          const currentVideoElement = videoRefs.current[playingVideoId];
          if (currentVideoElement) {
            if (currentVideo.youtubeLink.includes('youtu')) {
              if (currentVideoElement.player) {
                currentVideoElement.player.pauseVideo();
              } else {
                currentVideoElement.contentWindow.postMessage(
                  JSON.stringify({
                    event: 'command',
                    func: 'pauseVideo',
                    args: [],
                  }),
                  '*'
                );
              }
            } else if (currentVideo.youtubeLink.includes('vimeo.com')) {
              currentVideoElement.contentWindow.postMessage(
                {
                  method: 'pause',
                },
                'https://player.vimeo.com'
              );
            } else {
              currentVideoElement.pause();
            }
          }
        }
      }

      // Play the new video
      setPlayingVideoId(shotId);
      const videoElement = videoRefs.current[shotId];
      if (videoElement) {
        if (videoUrl.includes('youtu')) {
          if (videoElement.player) {
            videoElement.player.playVideo();
          } else {
            videoElement.contentWindow.postMessage(
              JSON.stringify({
                event: 'command',
                func: 'playVideo',
                args: [],
              }),
              '*'
            );
          }
        } else if (videoUrl.includes('vimeo.com')) {
          videoElement.contentWindow.postMessage(
            {
              method: 'play',
            },
            'https://player.vimeo.com'
          );
        } else {
          videoElement.play().catch((err) => console.error('Video play error:', err));
        }
      }
      handleClick(shotId);
    }
  };

  const onYouTubeIframeReady = (event, shotId) => {
    if (event.target && !videoRefs.current[shotId]?.player) {
      videoRefs.current[shotId] = {
        ...videoRefs.current[shotId],
        player: event.target
      };
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
                // Pause any playing video when slide changes
                if (playingVideoId) {
                  const currentVideo = allShots.find(shot => shot._id === playingVideoId);
                  if (currentVideo) {
                    const videoElement = videoRefs.current[playingVideoId];
                    if (videoElement) {
                      if (currentVideo.youtubeLink.includes('youtu')) {
                        if (videoElement.player) {
                          videoElement.player.pauseVideo();
                        } else {
                          videoElement.contentWindow.postMessage(
                            JSON.stringify({
                              event: 'command',
                              func: 'pauseVideo',
                              args: [],
                            }),
                            '*'
                          );
                        }
                      } else if (currentVideo.youtubeLink.includes('vimeo.com')) {
                        videoElement.contentWindow.postMessage(
                          {
                            method: 'pause',
                          },
                          'https://player.vimeo.com'
                        );
                      } else {
                        videoElement.pause();
                      }
                    }
                  }
                  setPlayingVideoId(null);
                }
              }}
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
                                  id={`youtube-${shot._id}`}
                                  ref={(el) => (videoRefs.current[shot._id] = el)}
                                  width="100%"
                                  height="100%"
                                  src={getYouTubeEmbedUrl(shot.youtubeLink)}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  onLoad={(e) => onYouTubeIframeReady(e, shot._id)}
                                ></iframe>
                              ) : shot.youtubeLink.includes('vimeo.com') ? (
                                <iframe
                                  id={`vimeo-${shot._id}`}
                                  ref={(el) => (videoRefs.current[shot._id] = el)}
                                  src={getVimeoEmbedUrl(shot.youtubeLink)}
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
                                  muted
                                  autoPlay
                                >
                                  <source src={shot.youtubeLink} type="video/mp4" />
                                  <source src={shot.youtubeLink} type="video/webm" />
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
                          
                          {/* Timecodes section */}
                          {shot.timecodes && shot.timecodes.length > 0 && (
                            <div className="mb-4 bg-[#2a2a2a] p-3 rounded-lg">
                              <h3 className="font-semibold mb-2 text-sm">Timecodes</h3>
                              <div className="space-y-2">
                                {shot.timecodes.map((tc, idx) => (
                                  <div 
                                    key={idx} 
                                    className="flex items-center hover:bg-[#3a3a3a] p-2 rounded cursor-pointer transition-colors"
                                    onClick={() => handleTimecodeClick(tc.time, shot.youtubeLink, shot._id)}
                                  >
                                    <span className="text-blue-400 font-mono mr-3 text-xs">{tc.time}</span>
                                    <span className="text-gray-300 text-xs">{tc.label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 text-xs mb-4">
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