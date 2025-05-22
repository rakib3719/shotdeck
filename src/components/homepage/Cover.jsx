import React from 'react'
import coverImg from '@/assets/cover/cover.jpg'
import line from '@/assets/cover/line.gif'
import Image from 'next/image'
import Search from './Search'

export default function Cover() {
  return (
    <div
      className="w-full lg:h-screen bg-cover bg-center max-h-[80vh]"
      style={{ backgroundImage: `url(${coverImg.src})` }}
    >
      <h1 className="text-white text-center   font-heading p-10">THE INDUSTRY'S BEST RESEARCH TOOL</h1>

<div className='flex justify-center '>
  
      <Image alt='lineGif' src={line} className='text-center'/>
</div>
<div className='flex justify-center items-center mt-24 lg:mt-80'>
  
<Search/>
</div>
<div className='flex justify-center items-center '>
  <h1 className="text-white text-center   font-md flex mt-24 items-end p-10">1,847,868 shots / 8,514 titles / unlimited inspiration</h1>

</div>



    </div>
  )
}
