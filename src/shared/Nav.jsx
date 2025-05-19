import Link from 'next/link'
import React from 'react'
import { FaHome } from "react-icons/fa";

export default function Nav() {


  const navItems = [
    {
      name:'BROWSE TITLES',
      likn:'/'
    },
    {
      name:'BROWSE SHOTS',
      likn:'/'
    },
    {
      name:'DECKS',
      likn:'/'
    },
    {
      name:'PRICING',
      likn:'/'
    },
    {
      name:'BLOG',
      likn:'/'
    },

  ]
  return (
    <div className='flex text-white font-semibold pt-1 items-center gap-6'>



      <div>
        <Link  href={'/'}>

        <FaHome className='text-primary text-xl' />
        </Link>
      </div>


      {
        navItems.map((item, idx)=>(

<div key={idx}>
        <Link  href={'/'}>

 <p className='hover-primary font-sub-heading'>{item.name}</p>
        </Link>
      </div>

        ))
      }
    </div>
  )
}
