'use client'

import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { base_url } from '@/utils/utils';
import { useSession } from 'next-auth/react';
import { useGetShotByIdQuery } from '@/redux/api/shot';
import { usePathname } from 'next/navigation';
;

export default function MySHot() {
      const user = useSession();
  // console.log(user.data.user.token, 'this is user');
  const token = user?.data?.user?.token
  const {data, isFetching, isError} = useGetShotByIdQuery(token);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedShot, setSelectedShot] = useState(null);
    const [isDetails, setIsDetails] = useState(false);

const pathname = usePathname();

  useEffect(() => {
    if(pathname.includes('my-shot')) {
      setIsDetails(true);
    }
  }, [pathname]);

  const finalData = isDetails ? data?.data : data?.data?.slice(0, 10);
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

  if(isFetching){
    return    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  }

  if(isError){
    return <h4>Something went wrong!</h4>
  }

  return (
    <div className='px-4 md:px-8'>
      <h1 className='text-xl font-semibold mt-8'>My Shot</h1>

      <div className={`${isDetails ? 'grid  grid-cols-[repeat(auto-fit,minmax(200px,1fr))]' : 'flex gap-4'} `}>
        {finalData?.map((data, idx) => (
          <div 
            key={idx} 
            className='mt-8 cursor-pointer'
            onClick={() => {
              setSelectedShot(data);
              setModalIsOpen(true);
              handleClick(data._id);
            }}
          >
            <Image 
              alt={'img'} 
              src={data?.imageUrl} 
              height={300} 
              width={300}
              className='object-cover h-40 w-50 '
            />
          </div>
        ))}
      </div>

      {/* Modal for showing shot details */}
      <AnimatePresence>
        {modalIsOpen && selectedShot && (
          <motion.div
            className="fixed inset-0 no-scrollbar flex justify-center items-center z-[999] "
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