'use client'
import React from 'react'
import logo from '@/assets/logo.png'
import Image from 'next/image'
import { useGetSettingQuery } from '@/redux/api/shot'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const {data} = useGetSettingQuery();

  const pathname = usePathname();
  if(pathname.includes('/admin')){
    return null;
  }

  return (
    <div className='bg-primary absolute z-50 w-full   items-end mt-8 md:flex'>
        
        <div>
         <Image alt='logo' src={logo} className=' max-h-[32px] md:w-72 py-2  mx-auto'/>
        </div>
        <div>
          <p className='text-xs mx-auto text-center md:text-left mt-2 md:mt-0'>{data?.data[0].
footerText}.</p>
        </div>

        
        
        </div>
  )
}
