'use client'
import Cover from '@/components/homepage/Cover'
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
 {
  user.status === 'authenticated' &&     <MySHot/> 
 }
 {
  user.status === 'authenticated' &&    <MyCollection/>
 }
    </div>
  )
}
