'use client'
import React from 'react'
import logo from '@/assets/logo.png'
import Image from 'next/image'
import { useGetSettingQuery } from '@/redux/api/shot'

export default function Footer() {
  const {data} = useGetSettingQuery();

  return (
    <div className='bg-primary absolute z-50 w-full  p-2 items-end mt-8 md:flex'>
        
        <div>
         <Image alt='logo' src={logo} className='pt-2 max-h-[32px] md:w-72  mx-auto'/>
        </div>
        <div>
          <p className='text-xs mx-auto text-center md:text-left mt-2 md:mt-0'>{data?.data[0].
footerText}.</p>
        </div>

        
        
        </div>
  )
}
