'use client'
import React from 'react'
import logo from '@/assets/logo.png'
import Image from 'next/image'
import Nav from './Nav'
import { usePathname } from 'next/navigation'


export default function Navbar() {
  const pathName = usePathname();

  // if(pathName.includes('/admin')){
  //   return null;
  // }
  return (
    <div className='bg-primary p-4 flex justify-between '>
      
<section>

  <Image alt='logo' src={logo} className='w-64'/>
</section>
<section>
<Nav/>


</section>
    </div>
  )
}
