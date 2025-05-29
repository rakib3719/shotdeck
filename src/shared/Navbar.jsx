'use client'
import React from 'react'
import logo from '@/assets/logo.png'
import Image from 'next/image'
import Nav from './Nav'
import { usePathname, useRouter } from 'next/navigation'
import { useGetSettingQuery } from '@/redux/api/shot'


export default function Navbar() {
  const pathName = usePathname();
  const router = useRouter();
const {data, isFetching, isError} = useGetSettingQuery();

  const navigateHandaler = ()=>{
    router.push('/')

  }
  // if(pathName.includes('/admin')){
  //   return null;
  // }
  return (
    <div className='bg-primary px-4 fixed z-50  border-b-gray-400 w-full py-5 flex justify-between '>
      
<section >

{
  isFetching ? <div className="wrapper">
    <div className="circle"></div>
    <div className="circle"></div>
    <div className="circle"></div>
    <div className="shadow"></div>
    <div className="shadow"></div>
    <div className="shadow"></div>
</div> :   <Image onClick={navigateHandaler} alt='logo' src={data?.data[0]?.logo} width={200} height={200} className='pt-2 max-h-[32px] md:w-72  cursor-pointer'/>
}
</section>
<section>
<Nav/>


</section>
    </div>
  )
}


