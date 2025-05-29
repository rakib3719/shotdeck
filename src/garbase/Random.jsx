'use client';
import { useGetShotsQuery } from '@/redux/api/shot';
import { useSecureAxios } from '@/utils/Axios';
import { base_url } from '@/utils/utils';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import React, { useState, Suspense } from 'react';
import Swal from 'sweetalert2';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';

function Random() {
  const [selectedShot, setSelectedShot] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const user = useSession();
  const axiosInstance = useSecureAxios();
  const Userid = user?.data?.user?.id;

  // Fetch random shots
  const { data, isLoading, error } = useGetShotsQuery({ sortBy: 'random', limit: 10 });

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
      if (cloudinaryUrl.hostname.includes('cloudinary.com') && url.includes('/video/')) {
        const pathParts = cloudinaryUrl.pathname.split('/');
        const uploadIndex = pathParts.findIndex(part => part === 'upload');

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
      data
    });
    if (response.status === 201) {
      Swal.fire({
        title: 'Success',
        text: 'Shot added To Your Collection',
        icon: 'success'
      });
    }
  };

  if (isLoading) {
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
    <div className=" mt-28 min-h-screen">
      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8">
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
            loop={true}
            className="h-full w-full"
            breakpoints={{
              640: { slidesPerView: 1.5, spaceBetween: 10 },
              768: { slidesPerView: 2.5, spaceBetween: 15 },
              1024: { slidesPerView: 3.5, spaceBetween: 20 },
            }}
          >
            {data?.data?.map((shot) => {
              // Determine the image source
              let imageSrc = shot?.imageUrl;

              if (!imageSrc && shot?.youtubeLink) {
                if (shot.youtubeLink.includes('youtu.be') || shot.youtubeLink.includes('youtube.com')) {
                  imageSrc = getYouTubeThumbnail(shot.youtubeLink);
                } else if (shot.youtubeLink.includes('cloudinary.com')) {
                  imageSrc = getCloudinaryThumbnail(shot.youtubeLink);
                }
              }

              return (
                <SwiperSlide key={shot._id}>
                  <div
                    className="relative h-full w-full rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105 shadow-lg"
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
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
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

// Helper function for YouTube embed URLs
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

// Wrap with Suspense
export default function RandomWithSuspense() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black">Loading...</div>}>
      <Random />
    </Suspense>
  );
}