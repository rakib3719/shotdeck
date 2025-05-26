'use client'
import React, { useEffect } from 'react'
import coverImg from '@/assets/cover/cover.jpg'
import line from '@/assets/cover/line.gif'
import Image from 'next/image'
import Search from './Search'
import Aos from 'aos'
import 'aos/dist/aos.css'; 


export default function Cover() {
  useEffect(()=>{
       Aos.init();
  },[])
  
  return (
    <div
  
      className="w-full lg:h-screen bg-cover bg-center max-h-[80vh]"
      style={{ backgroundImage: `url(${coverImg.src})` }}
    >
      <h1 data-aos="fade-up" data-aos-duration="1500" className="text-white text-center  pt-28 text-[22px] md:text-[32px] px-4 md:px-10">THE INDUSTRY'S BEST RESEARCH TOOL</h1>
 

<div data-aos="fade-up" data-aos-duration="1500" className='flex justify-center '>
  
      <Image alt='lineGif' src={line} className='text-center space-y-4 py-3'/>
</div>
     <p data-aos="fade-up" data-aos-duration="1500" className='text-center mt-3'>Find the perfect shots, create decks, share them with your crew</p>
<div className='flex justify-center items-center data-aos="fade-up" data-aos-duration="1500" mt-24 px-4 md:px-0 lg:mt-80'>
  
<Search/>
</div>
<div className='flex justify-center items-center '>
  <h1 data-aos="fade-up" data-aos-duration="1500"  data-aos-delay="500" className="text-white text-center   font-md flex mt-24 items-end p-4">1,847,868 shots / 8,514 titles / unlimited inspiration</h1>

</div>



    </div>
  )
}
