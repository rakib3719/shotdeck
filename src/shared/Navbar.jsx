import React from 'react'
import logo from '@/assets/logo.png'
import Image from 'next/image'
import Nav from './Nav'

export default function Navbar() {
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
