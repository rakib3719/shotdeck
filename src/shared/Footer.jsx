import React from 'react'
import logo from '@/assets/logo.png'
import Image from 'next/image'

export default function Footer() {
  return (
    <div className='bg-primary absolute z-50 w-full  p-2 items-end mt-8 flex'>
        
        <div>
         <Image alt='logo' src={logo} className='pt-2 max-h-[32px] md:w-72  '/>
        </div>
        <div>
          <p className='text-xs'>© 2025 shoddeck,  - All rights reserved.</p>
        </div>

        
        
        </div>
  )
}
