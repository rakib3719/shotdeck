'use client'
import { useGetTrendingShotQuery } from '@/redux/api/shot'
import Image from 'next/image';
import React from 'react'

export default function TrendingShots() {

  const {data, isFetching, isError} = useGetTrendingShotQuery();

  if(isFetching){
    return <h4>Loading....</h4>
  }

  if(isError){
    return <h4>Something went wrong!</h4>
  }
  console.log(data.data, 'this is data for trending')
  return (
    <div className='px-8'>
        
        <h1 className='text-xl font-semibold'>Trending Shot</h1>



       <div className='grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4'>
         {
          data?.data?.map((data, idx)=>(
            <div key={idx} className='mt-8'>

              <Image alt={'img'} src={data?.imageUrl} height={300} width={300}/>
           

            </div>
          ))
        }
       </div>
    </div>
  )
}
