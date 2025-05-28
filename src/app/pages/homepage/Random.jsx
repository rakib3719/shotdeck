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
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

function Random() {
  const [selectedShot, setSelectedShot] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const user = useSession();
  const axiosInstance = useSecureAxios();
  const Userid = user?.data?.user?.id;

  // Fetch random shots
  const { data, isLoading, error } = useGetShotsQuery({ sortBy: 'random', limit: 10 });

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

  // Split shots into main (center) and side slides
  const mainShots = data?.data?.slice(0, 3); // First 3 for main slider
  const sideShots = data?.data?.slice(3); // Remaining for side sliders

  return (
    <div className="bg-black min-h-screen">
      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8">
        {/* Main Slider - Center (Large) */}
        <div className="relative mb-8 md:mb-12 h-[60vh]">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation
            autoplay={{ delay: 5000 }}
            loop={true}
            className="h-full w-full"
          >
            {mainShots?.map((shot) => (
              <SwiperSlide key={shot._id}>
                <div 
                  className="relative h-full w-full rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => {
                    setSelectedShot(shot);
                    setModalIsOpen(true);
                    handleClick(shot._id);
                  }}
                >
                  <Image
                    src={shot.imageUrl}
                    alt={shot.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
                  <div className="absolute bottom-0 left-0 p-6 text-white">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{shot.title}</h2>
                    <p className="text-sm md:text-base line-clamp-2">{shot.description}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Side Sliders - Smaller */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Left Side Slider */}
          <div className="h-[30vh] md:h-[40vh]">
            <Swiper
              modules={[Autoplay]}
              spaceBetween={15}
              slidesPerView={1}
              autoplay={{ delay: 4000 }}
              loop={true}
              className="h-full"
            >
              {sideShots?.slice(0, 3)?.map((shot) => (
                <SwiperSlide key={shot._id}>
                  <div 
                    className="relative h-full w-full rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => {
                      setSelectedShot(shot);
                      setModalIsOpen(true);
                      handleClick(shot._id);
                    }}
                  >
                    <Image
                      src={shot.imageUrl}
                      alt={shot.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <h3 className="text-lg font-semibold">{shot.title}</h3>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Right Side Slider */}
          <div className="h-[30vh] md:h-[40vh]">
            <Swiper
              modules={[Autoplay]}
              spaceBetween={15}
              slidesPerView={1}
              autoplay={{ delay: 4500, reverseDirection: true }}
              loop={true}
              className="h-full"
            >
              {sideShots?.slice(3)?.map((shot) => (
                <SwiperSlide key={shot._id}>
                  <div 
                    className="relative h-full w-full rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => {
                      setSelectedShot(shot);
                      setModalIsOpen(true);
                      handleClick(shot._id);
                    }}
                  >
                    <Image
                      src={shot.imageUrl}
                      alt={shot.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <h3 className="text-lg font-semibold">{shot.title}</h3>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
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
              className="bg-[#1a1a1a] text-white rounded-xl shadow-2xl w-[95%] md:w-[80%] lg:w-[70%] max-h-[90vh] overflow-y-auto no-scrollbar p-6 relative"
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
              <div className="relative h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
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

