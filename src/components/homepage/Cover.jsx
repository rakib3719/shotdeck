'use client'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import coverImg from '@/assets/cover/cover.jpg';
import line from '@/assets/cover/line.gif';
import Image from 'next/image';
import Search from './Search';
import Aos from 'aos';
import 'aos/dist/aos.css';
import { useGetSettingQuery } from '@/redux/api/shot';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Cover() {
  const { data, isFetching } = useGetSettingQuery();
  const coverPhotos = data?.data[0]?.coverphoto || [];
  const [selectedCoverPhoto, setSelectedCoverPhoto] = useState(null);
  const pathname = usePathname();

  const bgRef = useRef(null); // Ref for background div

  // Set random cover photo
  useEffect(() => {
    if (coverPhotos.length > 0) {
      const randomIndex = Math.floor(Math.random() * coverPhotos.length);
      setSelectedCoverPhoto(coverPhotos[randomIndex]);
    } else {
      setSelectedCoverPhoto(coverImg.src);
    }
  }, [coverPhotos, pathname]);

  // Init AOS animations
  useEffect(() => {
    Aos.init();
  }, []);

  // GSAP scroll background animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          backgroundPosition: "50% 100%",
          ease: "none",
          scrollTrigger: {
            trigger: bgRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, bgRef);

    return () => ctx.revert();
  }, []);

  // Loader
  if (isFetching) {
    return (
      <div className="loader mx-auto py-16 mt-28">
        <div className="box" />
        <div className="box" />
        <div className="box" />
        <div className="box" />
      </div>
    );
  }

  return (
    <div
      ref={bgRef}
      className="w-full bg-cover bg-center bg-no-repeat bg-fixed max-h-[80vh] lg:h-screen"
      style={{
        backgroundImage: `url(${selectedCoverPhoto || coverImg.src})`,
        backgroundPosition: '50% 0%',
      }}
    >
      <h1
        data-aos="fade-up"
        data-aos-duration="1500"
        className="text-white text-center pt-28 text-[22px] md:text-[32px] px-4 md:px-10"
      >
        {data?.data[0]?.coverHeading || 'THE INDUSTRY\'S BEST RESEARCH TOOL'}
      </h1>

      <div data-aos="fade-up" data-aos-duration="1500" className="flex justify-center">
        <Image alt="lineGif" src={line} className="py-3" />
      </div>

      <p
        data-aos="fade-up"
        data-aos-duration="1500"
        className="text-white text-center mt-3"
      >
        {data?.data[0]?.coverDescription || 'Find the perfect shots, create decks, share them with your crew'}
      </p>

      <div
        data-aos="fade-up"
        data-aos-duration="1500"
        className="flex justify-center items-center mt-24 px-4 md:px-0 lg:mt-80"
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
