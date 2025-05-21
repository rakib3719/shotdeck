import Browse from '@/app/pages/homepage/Browse';
import React from 'react'

export default function page({params}) {
    const search = params?.search;
  return (
    <div>
        <Browse search={search}/>
    </div>
  )
}
