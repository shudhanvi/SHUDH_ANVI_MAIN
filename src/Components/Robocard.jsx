import React from 'react';

export default function Robocard() {
   
  return (
   
   <section className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 h-80 w-100 hover:shadow-xl hover:shadow-blue-200 hover:scale-105 transition-shadow duration-300">
   <div className="flex ">
    <div>
      <img
        src="/images/robo.png"
        alt="Device"
        className="w-full h-40 object-contain rounded-lg mb-4"
      />
    </div>
    <div className='flex  text-sm text-gray-600 text-start pl-5 items-center'>

      <div className="space-y-2">
        <p className="flex items-center mb-2">
          <span className="text-lg  "> <img src="/icons/robot-icon.png" alt="Device Icon" className="inline-block w-4 h-4 mr-1" /></span>Device ID: 
        </p>
        <p className="flex items-center mb-2">
          <span className="text-lg"> <img src="/icons/calendar-icon.png" alt="Last Operation Icon" className="inline-block w-4 h-4 mr-1" /></span>Last operation: 
        </p>
        <p className="flex items-center mb-2">
          <span className="text-lg"> <img src="/icons/gas-icon.png" alt="Gas Level Icon" className="inline-block w-4 h-4 mr-1" /></span>Gas level: %
        </p>
      </div>
      </div>
      </div>

      {/* Divider */}
      <hr className="my-4" />

      {/* Stats */}
      <div className='px-15 py-2'>
         <div className="flex justify-between items-center">
        <div className="text-center">
          <p className="text-3xl font-bold">17kgs</p>
          <p className="text-xs text-gray-500">waste Collect</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold">7</p>
          <p className="text-xs text-gray-500">Operations</p>
        </div>
      </div>
      </div>

    </section>
  );
}
  
