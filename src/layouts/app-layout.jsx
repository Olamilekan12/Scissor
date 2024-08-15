import React from 'react'
import { Outlet } from 'react-router-dom';
import Header from '@/components/header';
import LandingPage from '@/pages/landing';
const AppLayout = () => {
  return (
    <div>
      <main className="min-h-screen container">
    <Header/>
    <Outlet />
    
      </main>
     

      {/* footer  */}
      <div className="p-10 text-center bg-gray-800 mt-10">
        Made with ❤ by Prince Lekins
      </div>
    </div>
  )
}

export default AppLayout;
