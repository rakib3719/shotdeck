import Verification from '@/components/authanticaiton/Verification'
import React from 'react'

export default function page({params}) {

    const {email} = params;
  return (
    <div>
        
        <Verification email={email}/>
    </div>
  )
}
