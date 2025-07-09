'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface ScreenshotPreviewProps {
  src: string;
  alt: string;
}

export function ScreenshotPreview({ src, alt }: ScreenshotPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleClick = () => {
    window.open(src, '_blank', 'noopener,noreferrer');
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg my-4">
        <div className="text-center">
          <p className="text-gray-500 mb-2">Failed to load screenshot</p>
          <button
            type="button"
            onClick={handleClick}
            className="text-blue-500 hover:text-blue-700 underline flex items-center gap-1"
          >
            View original link
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative my-4 group">
      {isLoading && (
        <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}

      {/* biome-ignore lint/nursery/noStaticElementInteractions: <explanation> */}
      <div
        className={`relative cursor-pointer transition-transform hover:scale-[1.02] ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClick}
      >
        {/* Container with fixed aspect ratio and max dimensions */}
        <div className="relative w-full max-w-lg mx-auto aspect-video max-h-96 overflow-hidden rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            width={1000}
            height={1000}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className="w-full h-full aspect-video object-cover object-top"
          />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white dark:bg-gray-800 px-3 py-2 rounded-md shadow-lg flex items-center gap-2">
            <ExternalLink size={16} />
            <span className="text-sm font-medium">Click to view full size</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
        {alt} - Click to open in new tab
      </p>
    </div>
  );
}
