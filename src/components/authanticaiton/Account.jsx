'use client'
import React, { useState } from 'react'

export default function Account() {
    const [read, setRead] = useState(false)
  return (
    <div>
  <h2 className='text-2xl text-center'>Account</h2>

<form className='mx-auto flex justify-center flex-col mt-8 space-y-4'>

<div>
    <p className='text-primary text-center  ml-[33%] cursor-pointer'>Edit</p>
</div>
<div className='relative flex justify-center mx-auto w-full '>
    <input type="text" name="name" id="" className='bg-[#333333] px-3 py-2 w-full max-w-2xl mx-auto  focus:outline-0  '  />
<p className='absolute top-[6px] left-[33%] text-[#999] '>Name</p>
</div>
<div className='relative flex justify-center mx-auto w-full '>
    <input type="email" name="email" id="" className='bg-[#333333] px-3 py-2 w-full max-w-2xl mx-auto  focus:outline-0 '  />
<p className='absolute top-[6px] left-[33%] text-[#999] '>Email</p>
</div>
<div className='relative flex justify-center mx-auto w-full '>
    <input type="tel" name="phone" id="" className='bg-[#333333] px-3 py-2 w-full max-w-2xl mx-auto  focus:outline-0 '  />
<p className='absolute top-[6px] left-[33%] text-[#999] '>Phone</p>
</div>
<div className='relative flex justify-center mx-auto w-full '>
    <input type="password" name="name" id="" className='bg-[#333333] px-3 py-2 w-full max-w-2xl mx-auto  focus:outline-0 '  />
<p className='absolute top-[6px] left-[33%] text-[#999] '>Password</p>
</div>


</form>

    </div>
  )
}
