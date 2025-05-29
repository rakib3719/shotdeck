'use client'

import { useGetTrendingShotQuery } from '@/redux/api/shot';
import Image from 'next/image';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { base_url } from '@/utils/utils';

export default function TrendingShots() {
  const { data, isFetching, isError } = useGetTrendingShotQuery();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedShot, setSelectedShot] = useState(null);

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

  function getCloudinaryThumbnail(url) {
    try {
      const cloudinaryUrl = new URL(url);
      if (cloudinaryUrl.hostname.includes('cloudinary.com')) {
        const pathParts = cloudinaryUrl.pathname.split('/');
        const uploadIndex = pathParts.findIndex(part => part === 'upload');

        if (uploadIndex !== -1) {
          pathParts.splice(uploadIndex + 1, 0, 'c_thumb,w_400,h_400,g_auto');
          return `${cloudinaryUrl.origin}${pathParts.join('/')}`;
        }
      }
    } catch (err) {
      console.error('Error parsing Cloudinary URL:', err);
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

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return <h4>Something went wrong!</h4>;
  }

  return (
    <div className='px-4 md:px-8'>
      <h1 className='text-xl font-semibold mt-8'>Trending Shot</h1>

      <div className='grid w-full grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]'>
        {data?.data?.map((data, idx) => {
          // Determine the image source
          let imageSrc = data?.imageUrl;

          if (!imageSrc && data?.youtubeLink) {
            if (data.youtubeLink.includes('youtu.be') || data.youtubeLink.includes('youtube.com')) {
              imageSrc = getYouTubeThumbnail(data.youtubeLink);
            } else if (data.youtubeLink.includes('cloudinary.com')) {
              imageSrc = getCloudinaryThumbnail(data.youtubeLink);
            }
          }

          return (
            <div
              key={idx}
              className='mt-8 cursor-pointer'
              onClick={() => {
                setSelectedShot(data);
                setModalIsOpen(true);
                handleClick(data._id);
              }}
            >
              {imageSrc ? (
                <Image
                  alt={'img'}
                  src={imageSrc}
                  height={300}
                  width={300}
                  className='object-cover h-40 w-50'
                />
              ) : (
                <div className="bg-gray-800 h-40 w-full flex items-center justify-center">
                  <span className="text-gray-500">No thumbnail available</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for showing shot details */}
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
              className="bg-[#1a1a1a] text-white rounded-xl shadow-2xl w-full md:w-[80%] lg:w-[60%] max-h-[90vh] overflow-y-auto no-scrollbar p-4 relative"
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

              {/* Video Player */}
              {selectedShot.youtubeLink?.includes('youtu') ? (
                <div className="aspect-w-16 aspect-h-9 w-full">
                  <iframe
                    width="100%"
                    height="400"
                    src={getYouTubeEmbedUrl(selectedShot.youtubeLink)}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                </div>
              ) : selectedShot.youtubeLink?.includes('cloudinary.com') ? (
                <video width="100%" height="400" controls className="rounded-lg">
                  <source src={selectedShot.youtubeLink} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
                  <p>No valid video link found</p>
                </div>
              )}

              {/* Shot Details */}
              <div className="mt-4 space-y-4">
                <h2 className="text-2xl font-bold">{selectedShot.title}</h2>
                <p className="text-gray-300">{selectedShot.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {/* Left Column */}
                  <div className="space-y-2">
                    {selectedShot.director && (
                      <div>
                        <span className="font-semibold">Director: </span>
                        <span>{selectedShot.director}</span>
                      </div>
                    )}
                    {selectedShot.cinematographer && (
                      <div>
                        <span className="font-semibold">Cinematographer: </span>
                        <span>{selectedShot.cinematographer}</span>
                      </div>
                    )}
                    {selectedShot.genre?.length > 0 && (
                      <div>
                        <span className="font-semibold">Genre: </span>
                        <span>{selectedShot.genre.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Middle Column */}
                  <div className="space-y-2">
                    {selectedShot.aspectRatio && (
                      <div>
                        <span className="font-semibold">Aspect Ratio: </span>
                        <span>{selectedShot.aspectRatio}</span>
                      </div>
                    )}
                    {selectedShot.camera && (
                      <div>
                        <span className="font-semibold">Camera: </span>
                        <span>{selectedShot.camera}</span>
                      </div>
                    )}
                    {selectedShot.lens && (
                      <div>
                        <span className="font-semibold">Lens: </span>
                        <span>{selectedShot.lens}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-2">
                    {selectedShot.lightingStyle?.length > 0 && (
                      <div>
                        <span className="font-semibold">Lighting: </span>
                        <span>{selectedShot.lightingStyle.join(', ')}</span>
                      </div>
                    )}
                    {selectedShot.timeOfDay?.length > 0 && (
                      <div>
                        <span className="font-semibold">Time of Day: </span>
                        <span>{selectedShot.timeOfDay.join(', ')}</span>
                      </div>
                    )}
                    {selectedShot.interiorExterior && (
                      <div>
                        <span className="font-semibold">Location: </span>
                        <span>{selectedShot.interiorExterior}</span>
                      </div>
                    )}
                  </div>
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