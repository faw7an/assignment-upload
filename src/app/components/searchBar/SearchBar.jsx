import React from 'react'
import seachIcon from '../../../../public/assets/icons/magnifying-glass-solid.svg'
import Image from 'next/image'


function SearchBar() {
  return (
    <div className='flex justify-center m-5'>
      <div className="relative">
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Image 
            src={seachIcon}
            alt="Search"
            width={16}
            height={16}
            className="text-gray-400"
          />
        </span>
        <input 
          id="unitSearch" 
          type="text" 
          className='text-gray-500 bg-white border border-gray-300 shadow-md rounded pl-10 pr-3 py-2 w-[300px] focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500' 
          placeholder='Type to search for unit...'
        />
      </div>
    </div>
  )
}

export default SearchBar