'use client'
import { store } from '@/redux/store'
import React from 'react'
import { Provider } from 'react-redux'

export default function ReduxProvider({children}) {
  return (
    <div>
   <Provider store={store}>
         {children}
   </Provider>
    </div>
  )
}
 



































































