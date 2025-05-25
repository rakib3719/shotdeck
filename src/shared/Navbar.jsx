'use client'
import React from 'react'
import logo from '@/assets/logo.png'
import Image from 'next/image'
import Nav from './Nav'
import { usePathname, useRouter } from 'next/navigation'


export default function Navbar() {
  const pathName = usePathname();
  const router = useRouter();

  const navigateHandaler = ()=>{
    router.push('/')

  }
  // if(pathName.includes('/admin')){
  //   return null;
  // }
  return (
    <div className='bg-primary px-4 fixed z-50 border-b border-b-gray-400 w-full py-5 flex justify-between '>
      
<section >

  <Image onClick={navigateHandaler} alt='logo' src={logo} className='w-64  cursor-pointer'/>
</section>
<section>
<Nav/>


</section>
    </div>
  )
}
