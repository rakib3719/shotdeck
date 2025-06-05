'use client'

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { base_url } from '@/utils/utils';
import { useGetMyShotQuery } from '@/redux/api/shot';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { useSecureAxios } from '@/utils/Axios';
import Link from 'next/link';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Swal from 'sweetalert2';

export default function MyCollection() {
  const user = useSession();
  const id = user?.data?.user?.id;
  const { data, isFetching, isError, refetch } = useGetMyShotQuery(id);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedShot, setSelectedShot] = useState(null);
  const [isDetails, setIsDetails] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('All');
  const pathname = usePathname();
  const axiosInstance = useSecureAxios();
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    if (pathname.includes('my-collection')) {
      setIsDetails(true);
    }
  }, [pathname]);

  // Helper functions for video thumbnails
  function getYouTubeThumbnail(url) {
    try {
      const yt = new URL(url);
      let videoId;

      if (yt.hostname.includes('youtu.be')) {
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

  function getVimeoThumbnail(url) {
    try {
      const vimeoUrl = new URL(url);
      const videoId = vimeoUrl.pathname.split('/').pop();
      if (videoId) {
        return `https://vumbnail.com/${videoId}.jpg`;
      }
    } catch (err) {
      console.error('Error parsing Vimeo URL:', err);
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
        const videoId = yt.pathname.split('/')[2];
        return `https://www.youtube.com/embed/${videoId}`;
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
        const videoId = vimeo.pathname.split('/')[1];
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`;
        }
      }
    } catch (err) {
      console.error('Error parsing Vimeo URL:', err);
    }
    return null;
  }

  function handleTimecodeClick(timeString, videoUrl) {
    const timeParts = timeString.split(':');
    const seconds = (+timeParts[0]) * 60 + (+timeParts[1]);
    
    if (videoUrl.includes('youtu')) {
      const videoPlayer = document.getElementById('video-player');
      if (videoPlayer) {
        const embedUrl = getYouTubeEmbedUrl(videoUrl);
        videoPlayer.src = `${embedUrl}?start=${seconds}&autoplay=1`;
      }
    } else if (videoUrl.includes('vimeo.com')) {
      const videoPlayer = document.getElementById('video-player');
      if (videoPlayer && videoPlayer.contentWindow) {
        videoPlayer.contentWindow.postMessage({
          method: 'setCurrentTime',
          value: seconds
        }, 'https://player.vimeo.com');
      }
    } else {
      const videoPlayer = document.getElementById('cloudinary-video');
      if (videoPlayer) {
        videoPlayer.currentTime = seconds;
        videoPlayer.play();
      }
    }
  }

  const handleClick = async (id) => {
    try {
      await axios.patch(`${base_url}/shot/click/${id}`);
    } catch (error) {
      console.error('Error handling click:', error);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    console.log('Deleting item with id:', id);
    const resp = await axiosInstance.delete(`/shot/collection/${id}`);
    console.log(resp, 'This is response');
    refetch();
  };

  const createNewCollection = async () => {
    if (!newCollectionName.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'Please enter a collection name',
        icon: 'error',
      });
      return;
    }

    try {
      const response = await axiosInstance.post(`/collection/save-collection`, {
        userId: id,
        name: newCollectionName
      });

      if (response.status === 201) {
        Swal.fire({
          title: 'Success',
          text: 'Collection created successfully',
          icon: 'success',
        });
        refetch();
        setNewCollectionName('');
        setShowCreateCollection(false);
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to create collection',
        icon: 'error',
      });
    }
  };

  // Group shots by collectionName
  const collections = data?.data?.reduce((acc, item) => {
    const collectionName = item.collectionName || 'Uncategorized';
    if (!acc[collectionName]) {
      acc[collectionName] = [];
    }
    acc[collectionName].push(item);
    return acc;
  }, {});

  // Create an array of collection names including "All"
  const collectionNames = ['All', ...Object.keys(collections || {}).sort()];

  // Filter shots based on selected collection
  const finalData = isDetails
    ? selectedCollection === 'All'
      ? data?.data
      : collections?.[selectedCollection] || []
    : (selectedCollection === 'All' ? data?.data : collections?.[selectedCollection] || [])?.slice(0, 10);

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64 bg-gradient-to-b from-gray-900 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (isError) {
    return <h4 className="text-center py-8 text-white bg-gray-900">Something went wrong!</h4>;
  }

  return (
    <div className="px-4 md:px-8 py-16 bg-gradient-to-b from-gray-900 to-black min-h-screen">
      <Image src={'/api/frames?url=https://youtu.be/_Nd2i4OpbdU&timestamp=00:00:50'} width={400} height={400} alt='astase wait'/>
      <h1 className="text-3xl font-bold text-white mb-8 text-center" data-aos="fade-up">My Cinematic Collection</h1>

      {/* Collection Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-8" data-aos="fade-up" data-aos-delay="100">
        {collectionNames.map((name) => (
          <motion.button
            key={name}
            onClick={() => setSelectedCollection(name)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              selectedCollection === name
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {name}
          </motion.button>
        ))}
        
        {/* Add Collection Button */}
        <motion.button
          onClick={() => setShowCreateCollection(true)}
          className="px-4 py-2 rounded-full text-sm font-semibold bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus /> New
        </motion.button>
      </div>

      {/* Create Collection Modal */}
      <AnimatePresence>
        {showCreateCollection && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateCollection(false)}
          >
            <motion.div
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Create New Collection</h3>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateCollection(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={createNewCollection}
                  className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shot Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {finalData?.map((item, index) => {
          let imageSrc = item?.data?.imageUrl;
          if (!imageSrc && item?.data?.youtubeLink) {
            if (item.data.youtubeLink.includes('youtu.be') || item.data.youtubeLink.includes('youtube.com')) {
              imageSrc = getYouTubeThumbnail(item.data.youtubeLink);
            } else if (item.data.youtubeLink.includes('cloudinary.com')) {
              imageSrc = getCloudinaryThumbnail(item.data.youtubeLink);
            } else if (item.data.youtubeLink.includes('vimeo.com')) {
              imageSrc = getVimeoThumbnail(item.data.youtubeLink);
            }
          }

          return (
            <motion.div
              key={item._id}
              className="relative group bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
              data-aos="fade-up"
              data-aos-delay={100 + index * 100}
              onClick={() => {
                setSelectedShot(item?.data);
                setModalIsOpen(true);
                handleClick(item._id);
              }}
              whileHover={{ y: -5 }}
            >
              {imageSrc ? (
                <Image
                  alt={item.data.title}
                  src={imageSrc}
                  height={300}
                  width={300}
                  className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="bg-gray-700 h-48 w-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No thumbnail available</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="text-white font-semibold text-lg truncate">{item.data.title}</h3>
                <p className="text-gray-400 text-sm truncate">{item.data.description || 'No description'}</p>
                <p className="text-yellow-400 text-xs mt-2">{item.collectionName || 'Uncategorized'}</p>
              </div>
              <button
                onClick={(e) => handleDelete(e, item._id)}
                className="absolute top-2 right-2 p-2 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500"
                aria-label="Delete"
              >
                <FaTrash className="text-white text-lg" />
              </button>
            </motion.div>
          );
        })}
      </div>

      {isDetails ? null : (
        <Link href={'/my-collection'} className="text-yellow-400 flex justify-center text-center w-full mt-8 text-lg font-semibold hover:underline" data-aos="fade-up">
          See More
        </Link>
      )}

      {/* Shot Details Modal */}
      <AnimatePresence>
        {modalIsOpen && selectedShot && (
          <motion.div
            className="fixed inset-0 flex justify-center items-center z-[999] bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalIsOpen(false)}
          >
            <motion.div
              className="bg-gray-900 text-white rounded-xl shadow-2xl w-[90%] lg:w-[70%] max-h-[90vh] overflow-y-auto no-scrollbar p-6 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-yellow-400"
                onClick={() => setModalIsOpen(false)}
              >
                ×
              </button>
              {selectedShot.youtubeLink ? (
                <div>
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

                  {selectedShot.timecodes && selectedShot.timecodes.length > 0 && (
                    <div className="mt-4 bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-semibold text-white mb-2">Timecodes</h3>
                      <div className="space-y-2">
                        {selectedShot.timecodes.map((tc, idx) => (
                          <motion.div
                            key={idx}
                            className="flex items-center hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors"
                            onClick={() => handleTimecodeClick(tc.time, selectedShot.youtubeLink)}
                            whileHover={{ scale: 1.02 }}
                          >
                            <span className="text-yellow-400 font-mono mr-3">{tc.time}</span>
                            <span className="text-gray-300">{tc.label}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400">No valid video link found.</p>
              )}

              <div className="text-left space-y-4 mt-6">
                <h2 className="text-2xl font-bold text-white">{selectedShot.title || 'Shot Title'}</h2>
                <p className="text-gray-300">{selectedShot.description || 'No description available.'}</p>

                <div className="border-t border-gray-700 pt-4">
                  <section className="lg:grid lg:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-white text-sm">
                        Genre:
                        {selectedShot?.genre?.map((g, idx) => (
                          <span key={idx} className="text-sm font-normal ml-2 text-gray-400">{g}</span>
                        ))}
                      </h4>
                      <h4 className="font-semibold text-white text-sm">
                        Director: <span className="font-normal text-gray-400">{selectedShot?.director}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-sm">
                        Cinematographer: <span className="font-normal text-gray-400">{selectedShot?.cinematographer}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-sm">
                        Production Designer: <span className="font-normal text-gray-400">{selectedShot?.productionDesigner}</span>
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-white text-sm">
                        Color:
                        {selectedShot?.color?.map((g, idx) => (
                          <span key={idx} className="text-sm font-normal ml-2 text-gray-400">{g}</span>
                        ))}
                      </h4>
                      <h4 className="font-semibold text-white text-sm">
                        Aspect Ratio: <span className="font-normal text-gray-400">{selectedShot?.aspectRatio}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-sm">
                        Format: <span className="font-normal text-gray-400">{selectedShot?.format}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-sm">
                        Frame Size: <span className="font-normal text-gray-400">{selectedShot?.frameSize}</span>
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-white text-sm">
                        Time of Day:
                        {selectedShot?.timeOfDay?.map((t, idx) => (
                          <span key={idx} className="text-sm font-normal ml-2 text-gray-400">{t}</span>
                        ))}
                      </h4>
                      <h4 className="font-semibold text-white text-sm">
                        Interior/Exterior: <span className="font-normal text-gray-400">{selectedShot?.interiorExterior}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-sm">
                        Location Type: <span className="font-normal text-gray-400">{selectedShot?.filmingLocation}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-sm">
                        Camera: <span className="font-normal text-gray-400">{selectedShot?.camera}</span>
                      </h4>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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