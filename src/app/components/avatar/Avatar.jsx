"use client";
import React, { useEffect, useState } from 'react';
import { createAvatar } from '@dicebear/core';
import { initials } from '@dicebear/collection';

function Avatar({ name = "User"}) {
  const [svgString, setSvgString] = useState('');
  
  useEffect(() => {
    // Generate avatar when component mounts or name changes
    const avatar = createAvatar(initials, {
      seed: name,
      backgroundColor: ["c0aede"],
      radius: 50,
      fontWeight: 400,
      fontSize: 50,
    
    });
    
    const svg = avatar.toString();
    setSvgString(svg);
  }, [name]);

  return (
    <div 
      className="overflow-hidden flex items-center justify-center w-[46px] h-[46px] sm:w-[48px] sm:h-[48px] md:w-[50px] md:h-[50px] lg:w-[56px] lg:h-[56px] absolute right-4 top-[-36px] sm:top-[-45px] sm:right-5 md:right-6 md:top-[-50px] p-0.5 rounded-full"
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}

export default Avatar;