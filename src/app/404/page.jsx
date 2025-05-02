"use client"
import { useState, useEffect } from 'react';
import { Home, ChevronLeft } from 'lucide-react';

export default function Custom404() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [stars, setStars] = useState([]);
  const [isHovering, setIsHovering] = useState(false);

  // Generate stars for background
  useEffect(() => {
    const newStars = [];
    for (let i = 0; i < 100; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        blinking: Math.random() > 0.7
      });
    }
    setStars(newStars);
  }, []);

  // Track mouse position for parallax effect
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 20;
    const y = (clientY / window.innerHeight - 0.5) * 20;
    setPosition({ x, y });
  };

  return (
    <div 
      className="bg-black min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Stars background */}
      {stars.map((star) => (
        <div
          key={star.id}
          className={`absolute rounded-full bg-white ${star.blinking ? 'animate-pulse' : ''}`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
          }}
        />
      ))}

      {/* Floating Astronaut */}
      <div 
        className="absolute z-10 transition-transform duration-1000 ease-out"
        style={{ 
          transform: `translate(${position.x * 2}px, ${position.y * 2}px) rotate(${Math.sin(Date.now() / 2000) * 10}deg)`,
        }}
      >
        <div className="relative w-32 h-48 md:w-40 md:h-56">
          {/* Astronaut Body */}
          <div className="absolute top-8 left-10 w-16 h-24 bg-gray-300 rounded-xl"></div>
          
          {/* Helmet */}
          <div className="absolute top-0 left-6 w-24 h-20 bg-gray-200 rounded-full">
            <div className="absolute top-4 left-4 w-16 h-12 bg-blue-900 rounded-full opacity-70"></div>
          </div>
          
          {/* Arms */}
          <div className="absolute top-12 left-2 w-8 h-16 bg-gray-300 rounded-full"></div>
          <div className="absolute top-12 right-2 w-8 h-16 bg-gray-300 rounded-full"></div>
          
          {/* Legs */}
          <div className="absolute bottom-4 left-10 w-8 h-16 bg-gray-300 rounded-xl"></div>
          <div className="absolute bottom-4 right-10 w-8 h-16 bg-gray-300 rounded-xl"></div>
          
          {/* Backpack */}
          <div className="absolute top-10 left-0 w-10 h-16 bg-gray-400 rounded-md"></div>
        </div>
      </div>

      {/* 404 Content */}
      <div 
        className="text-center z-20 px-4"
        style={{ 
          transform: `translate(${position.x / 2}px, ${position.y / 2}px)`,
        }}
      >
        <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl text-white mb-6">Lost in Space</h2>
        <p className="text-gray-300 mb-10 max-w-md">
          Houston, we have a problem. The page you're looking for has drifted into a black hole.
        </p>
        
        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a 
            href="/"
            className="group flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <Home size={20} className={`transition-transform duration-300 ${isHovering ? 'transform -translate-x-1' : ''}`} />
            <span>Return Home</span>
          </a>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 bg-transparent border border-purple-600 text-purple-400 hover:text-white hover:bg-purple-700 font-medium py-3 px-6 rounded-lg transition duration-300"
          >
            <ChevronLeft size={20} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
      
      {/* Shooting star animation */}
      <div className="absolute top-1/4 left-0 h-px w-20 bg-white opacity-70 rotate-12 animate-pulse">
        <div className="absolute right-0 top-0 h-px w-10 bg-gradient-to-l from-white to-transparent"></div>    
      </div>
      <div className="absolute top-3/4 right-1/4 h-px w-20 bg-white opacity-70 -rotate-12 animate-pulse delay-700">
        <div className="absolute right-0 top-0 h-px w-10 bg-gradient-to-l from-white to-transparent"></div>    
      </div>
    </div>
  );
}