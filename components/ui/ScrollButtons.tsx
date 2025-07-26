'use client';

import React from 'react';

interface ScrollButtonsProps {
  containerId: string;
}

export function LeftScrollButton({ containerId }: ScrollButtonsProps) {
  const handleClick = () => {
    document.getElementById(containerId)?.scrollBy({left: -300, behavior: 'smooth'});
  };

  return (
    <button 
      className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md z-10 hidden md:block"
      onClick={handleClick}
      aria-label="Scroll left"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}

export function RightScrollButton({ containerId }: ScrollButtonsProps) {
  const handleClick = () => {
    document.getElementById(containerId)?.scrollBy({left: 300, behavior: 'smooth'});
  };
  
  return (
    <button 
      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md z-10 hidden md:block"
      onClick={handleClick}
      aria-label="Scroll right"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
} 