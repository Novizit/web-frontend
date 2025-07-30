"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// Use public SVGs for icons
const LocationIcon = "/location.svg";
const RightArrowIcon = "/right_arrow_icon.svg";
const LeftArrowIcon = "/left_arrow_icon.svg";

interface PropertyCardProps {
  autoSlide?: boolean;
  autoSlideInterval?: number;
  slides: string[];
  propertyId: number;
  title: string;
  location: string;
  price: number;
  propertyType: string;
  furnishedInfo: string;
  availableFrom: string;
  bhkType: string;
  formattedBhkType?: string;
  formattedFurnishing?: string;
  updatedAt?: string;
}

export default function PropertyCard({
  autoSlide = true,
  autoSlideInterval = 3000,
  slides,
  propertyId,
  title,
  location,
  price,
  propertyType,
  furnishedInfo,
  availableFrom,
  bhkType,
  formattedBhkType,
  formattedFurnishing,
  updatedAt,
}: PropertyCardProps) {
  const router = useRouter();
  const [curr, setCurr] = useState(0);

  const prev = () => setCurr((curr) => (curr === 0 ? slides.length - 1 : curr - 1));
  const next = () => setCurr((curr) => (curr === slides.length - 1 ? 0 : curr + 1));

  useEffect(() => {
    if (!autoSlide) return;
    const slideInterval = setInterval(next, autoSlideInterval);
    return () => clearInterval(slideInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSlide, autoSlideInterval, curr, slides.length]);

  const handleViewClick = () => {
    router.push(`/property/${Number(propertyId)}`);
  };

  // Helper to check if availableFrom is today or past
  const isReadyToMove = (() => {
    if (!availableFrom) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const availDate = new Date(availableFrom);
    availDate.setHours(0,0,0,0);
    return availDate <= today;
  })();

  // Use formatted values if available
  const bhkDisplay = formattedBhkType || bhkType;
  const furnishingDisplay = formattedFurnishing || furnishedInfo;

  // Calculate days ago from updatedAt
  let daysAgoText = '';
  if (updatedAt) {
    const updatedDate = new Date(updatedAt);
    const now = new Date();
    // Zero out time for both dates
    updatedDate.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    const diffMs = now.getTime() - updatedDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) daysAgoText = 'Today';
    else if (diffDays === 1) daysAgoText = '1 day ago';
    else daysAgoText = `${diffDays} days ago`;
  }

  return (
    <div className="flex justify-center md:justify-start w-full">
      <div className="w-full max-w-[400px] sm:w-[340px] bg-white rounded-2xl shadow-none p-0">
        {/* Image slider */}
        <div className="overflow-hidden relative rounded-2xl w-full aspect-[4/3]">
          <div
            className="flex transition-transform ease-out duration-500 h-full"
            style={{ width: `${slides.length * 100}%`, transform: `translateX(-${curr * (100 / slides.length)}%)` }}
          >
            {slides.map((img, index) => (
              <div key={index} className="relative h-full" style={{ width: `${100 / slides.length}%` }}>
                <Image src={img} alt="Property Images" fill className="object-cover" />
              </div>
            ))}
          </div>
          {/* Slider controls and dots */}
          <div className="absolute inset-0 flex items-center justify-between p-4">
            <button
              onClick={prev}
              aria-label="Previous"
              className="py-2 px-3 rounded-full shadow bg-white/50 text-gray-800 hover:bg-white"
            >
              <Image src={LeftArrowIcon} alt="Prev" width={16} height={16} />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="py-2 px-3 rounded-full shadow bg-white/50 text-gray-800 hover:bg-white"
            >
              <Image src={RightArrowIcon} alt="Next" width={16} height={16} />
            </button>
          </div>
          <div className="absolute bottom-4 right-0 left-0">
            <div className="flex items-center justify-center gap-2">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`transition-all w-2 h-2 bg-white rounded-full ${curr === i ? "p-1" : "bg-opacity-50"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Badges and time */}
        <div className="flex items-center justify-between mt-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="bg-[#F7F7EF] text-[#24272C] text-xs font-medium px-2.5 py-0.5 rounded-md">{bhkDisplay}</span>
            <span className="bg-[#F7F7EF] text-[#24272C] text-xs font-medium px-2.5 py-0.5 rounded-md">{propertyType}</span>
          </div>
          <p className="text-xs text-[#848484] font-semibold">{daysAgoText}</p>
        </div>

        {/* Main content */}
        <div className="flex flex-col mt-2 min-h-[90px]">
          <div className="flex justify-between mb-2">
            <h5 className="text-base font-semibold tracking-tight text-gray-900 truncate">
              {title}
            </h5>
            <p className="text-[#848484] text-sm">{furnishingDisplay}</p>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <Image src={LocationIcon} alt="Location icon" width={14} height={14} />
              <p className="text-[#848484] text-sm ms-2 truncate">{location}</p>
            </div>
              
              <p className="text-[#848484] text-sm">
                {isReadyToMove
                  ? 'Ready to move'
                  : (availableFrom ? `Available from ${new Date(availableFrom).toLocaleDateString()}` : 'N/A')}
              </p>
          </div>
        </div>

        {/* Price and View button in a row */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-[#24272C]">
            ₹{price.toLocaleString()}
            <span className="text-[#848484] text-lg">/month</span>
          </span>
          <button
            onClick={handleViewClick}
            className="text-[#24272C] font-medium rounded-full text-base w-1/2 ml-2 py-2.5 text-center bg-[#D2F26B] hover:bg-[#BDD279]"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
} 