import Register from '@/components/authanticaiton/Register'
import React from 'react'

export default function page({params}) {

  const {email} = params
  return (
    <div>
        <Register email={email}/>
    </div>
  )
}
