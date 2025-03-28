import React from 'react'

function Assignment({unit,description}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 z-0">
          {/* Unit 1 */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold">{unit}</h2>
            <p className="text-gray-600">{description}</p>
            <button className='rounded bg-blue-600 p-1 m-2'>Add submission</button>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold">{unit}</h2>
            <p className="text-gray-600">{description}</p>
            <button className='rounded bg-blue-600 p-1 m-2'>Add submission</button>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold">{unit}</h2>
            <p className="text-gray-600">{description}</p>
            <button className='rounded bg-blue-600 p-1 m-2'>Add submission</button>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold">{unit}</h2>
            <p className="text-gray-600">{description}</p>
            <button className='rounded bg-blue-600 p-1 m-2'>Add submission</button>
          </div>
          
         
          
        </div>
  )
}

export default Assignment