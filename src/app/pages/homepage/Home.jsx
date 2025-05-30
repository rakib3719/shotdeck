'use client'
import About from '@/components/homepage/About'
import CinematographersSpotlight from '@/components/homepage/CinematographersSpotlight'
import Cover from '@/components/homepage/Cover'
import FAQ from '@/components/homepage/FAQ'
import MyCollection from '@/components/homepage/MyCollection'
import MySHot from '@/components/homepage/MyShot'
import Treanding from '@/components/homepage/Treanding'
import TrendingShots from '@/components/homepage/TrendingShots'
import { useSession } from 'next-auth/react'
import React from 'react'

export default function HomePage() {
  const user = useSession();
  console.log(user.status, 'this is user')



  return (
    <div>
     <Cover/>
     <Treanding/>
     <TrendingShots/>
     <About/>
     <FAQ/>
     {/* <CinematographersSpotlight/> */}
 {
  user.status === 'authenticated' &&     <MySHot/> 
 }
 {
  user.status === 'authenticated' &&    <MyCollection/>
 }
    </div>
  )
}
