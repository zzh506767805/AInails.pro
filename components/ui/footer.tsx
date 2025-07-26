import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 py-6 mt-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">© {new Date().getFullYear()} AInails - AI Nail Art Generator</p>
          </div>
          
          <div className="flex flex-wrap gap-6 justify-center">
            <Link 
              href="/" 
              className="text-sm text-gray-600 hover:text-red-500 transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/pricing" 
              className="text-sm text-gray-600 hover:text-red-500 transition-colors"
            >
              Pricing
            </Link>
            <Link 
              href="/terms" 
              className="text-sm text-gray-600 hover:text-red-500 transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              href="/privacy" 
              className="text-sm text-gray-600 hover:text-red-500 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
          
          <div className="mt-4 md:mt-0">
            <p className="text-xs text-gray-500 mb-2">Friendly Links:</p>
            <div className="flex gap-4">
              <a 
                href="https://chinesenamegenerate.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-red-500 transition-colors"
              >
                Chinese Name Generator
              </a>
              <a 
                href="https://dressmeai.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-red-500 transition-colors"
              >
                DressMeAI
              </a>
              <a 
                href="https://dreamfinityx.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-red-500 transition-colors"
              >
                DreamfinityX
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 