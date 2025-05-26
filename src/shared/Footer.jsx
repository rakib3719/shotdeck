import React from 'react'
import logo from '@/assets/logo.png'
import Image from 'next/image'

export default function Footer() {
  return (
    <div className='bg-primary'>
        
        <div>
          <Image alt='img' src={logo} />
        </div>
        <div>
          <p>© 2025 shoddeck,  - All rights reserved.</p>
        </div>
        
        </div>
  )
}
