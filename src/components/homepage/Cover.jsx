'use client'
import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import coverImg from '@/assets/cover/cover.jpg'
import line from '@/assets/cover/line.gif'
import Image from 'next/image'
import Search from './Search'
import Aos from 'aos'
import 'aos/dist/aos.css'
import { useGetSettingQuery } from '@/redux/api/shot'

export default function Cover() {
  const { data, isFetching } = useGetSettingQuery();
  const coverPhotos = data?.data[0]?.coverphoto || []; // Get the coverphoto array or fallback to empty array
  const [selectedCoverPhoto, setSelectedCoverPhoto] = useState(null);
  const pathname = usePathname(); // Get the current route pathname

  // Select a random cover photo when the component mounts or route changes
  useEffect(() => {
    if (coverPhotos.length > 0) {
      const randomIndex = Math.floor(Math.random() * coverPhotos.length);
      setSelectedCoverPhoto(coverPhotos[randomIndex]);
    } else {
      // Fallback to default cover image if no cover photos are available
      setSelectedCoverPhoto(coverImg.src);
    }
  }, [coverPhotos, pathname]); // Add pathname to dependencies to re-run on route change

  // Initialize AOS for animations
  useEffect(() => {
    Aos.init();
  }, []);

  // Return loader if data is still fetching
  if (isFetching) {
    return (
      <div className="loader mx-auto py-16 mt-28">
        <div className="box">
          <div className="logo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 94 94"
              className="svg"
            >
              <path
                d="M38.0481 4.82927C38.0481 2.16214 40.018 0 42.4481 0H51.2391C53.6692 0 55.6391 2.16214 55.6391 4.82927V40.1401C55.6391 48.8912 53.2343 55.6657 48.4248 60.4636C43.6153 65.2277 36.7304 67.6098 27.7701 67.6098C18.8099 67.6098 11.925 65.2953 7.11548 60.6663C2.37183 56.0036 3.8147e-06 49.2967 3.8147e-06 40.5456V4.82927C3.8147e-06 2.16213 1.96995 0 4.4 0H13.2405C15.6705 0 17.6405 2.16214 17.6405 4.82927V39.1265C17.6405 43.7892 18.4805 47.2018 20.1605 49.3642C21.8735 51.5267 24.4759 52.6079 27.9678 52.6079C31.4596 52.6079 34.0127 51.5436 35.6268 49.4149C37.241 47.2863 38.0481 43.8399 38.0481 39.0758V4.82927Z"
              ></path>
              <path
                d="M86.9 61.8682C86.9 64.5353 84.9301 66.6975 82.5 66.6975H73.6595C71.2295 66.6975 69.2595 64.5353 69.2595 61.8682V4.82927C69.2595 2.16214 71.2295 0 73.6595 0H82.5C84.9301 0 86.9 2.16214 86.9 4.82927V61.8682Z"
              ></path>
              <path
                d="M2.86102e-06 83.2195C2.86102e-06 80.5524 1.96995 78.3902 4.4 78.3902H83.6C86.0301 78.3902 88 80.5524 88 83.2195V89.1707C88 91.8379 86.0301 94 83.6 94H4.4C1.96995 94 0 91.8379 0 89.1707L2.86102e-06 83.2195Z"
              ></path>
            </svg>
          </div>
        </div>
        <div className="box"></div>
        <div className="box"></div>
        <div className="box"></div>
        <div className="box"></div>
      </div>
    );
  }

  return (
    <div
      className="w-full lg:h-screen bg-cover bg-center max-h-[80vh]"
      style={{ backgroundImage: `url(${selectedCoverPhoto || coverImg.src})` }}
    >
      <h1
        data-aos="fade-up"
        data-aos-duration="1500"
        className="text-white text-center pt-28 text-[22px] md:text-[32px] px-4 md:px-10"
      >
        {data?.data[0]?.coverHeading || 'THE INDUSTRY\'S BEST RESEARCH TOOL'}
      </h1>

      <div data-aos="fade-up" data-aos-duration="1500" className="flex justify-center">
        <Image alt="lineGif" src={line} className="text-center space-y-4 py-3" />
      </div>
      <p data-aos="fade-up" data-aos-duration="1500" className="text-center mt-3">
        {data?.data[0]?.coverDescription || 'Find the perfect shots, create decks, share them with your crew'}
      </p>
      <div
        className="flex justify-center items-center data-aos='fade-up' data-aos-duration='1500' mt-24 px-4 md:px-0 lg:mt-80"
      >
        <Search />
      </div>
      <div className="flex justify-center items-center">
        <h1
          data-aos="fade-up"
          data-aos-duration="1500"
          data-aos-delay="500"
          className="text-white text-center font-md flex mt-24 items-end p-4"
        >
          1,847,868 shots / 8,514 titles / unlimited inspiration
        </h1>
      </div>
    </div>
  );
}