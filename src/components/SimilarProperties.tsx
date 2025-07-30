"use client";

import React from 'react';
import PropertyCard from './PropertyCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export interface Property {
  id: number;
  propertyName: string;
  rent: number;
  bhkType: string;
  furnishing: string;
  availableFrom: string;
  propertyType: string;
  location: string;
  formattedBhkType?: string;
  formattedFurnishing?: string;
  updatedAt?: string;
  slides: string[];
  imageUrls?: string[];
}

interface SimilarPropertiesProps {
  currentProperty: Property;
  allProperties: Property[];
  maxResults?: number;
  isFallback?: boolean;
}

const SimilarProperties: React.FC<SimilarPropertiesProps> = ({
  currentProperty,
  allProperties,
  maxResults = 6,
  isFallback = false,
}) => {
  // Defensive: ensure allProperties is always an array
  const safeProperties = Array.isArray(allProperties) ? allProperties : [];
  // Patch: ensure every property has a slides array
  const similarProperties = (safeProperties ?? [])
    .filter((p) => p && p.id !== currentProperty.id)
    .slice(0, maxResults)
    .map((p) => ({
      ...p,
      slides: Array.isArray(p.slides) && p.slides.length > 0 ? p.slides : ["/property_Img.svg", "/property_Img.svg"],
    }));

  if (!Array.isArray(similarProperties) || typeof similarProperties.length !== 'number') {
    return <div className="text-gray-500">No similar properties found.</div>;
  }

  if (!similarProperties.length) return <div className="text-gray-500">No similar properties found.</div>;

  return (
    <div className="w-full">
      {isFallback && (
        <div className="text-yellow-600 mb-2">
          Showing similar BHK type from other locations.
        </div>
      )}
      <Swiper
        modules={[Navigation, A11y]}
        spaceBetween={16}
        slidesPerView={1}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
          disabledClass: 'opacity-30 pointer-events-none',
        }}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
        a11y={{ enabled: true }}
        className="relative"
      >
        {similarProperties.map((property) => (
          <SwiperSlide key={property.id}>
            <PropertyCard
              slides={property.slides}
              propertyId={property.id}
              title={property.propertyName}
              location={property.location}
              price={property.rent}
              furnishedInfo={property.furnishing}
              availableFrom={property.availableFrom}
              propertyType={property.propertyType}
              bhkType={property.bhkType}
              formattedBhkType={property.formattedBhkType}
              formattedFurnishing={property.formattedFurnishing}
              updatedAt={property.updatedAt}
            />
          </SwiperSlide>
        ))}
        {/* Navigation arrows for desktop/tablet only */}
        <div className="swiper-button-prev hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 cursor-pointer" tabIndex={0} aria-label="Previous slide" />
        <div className="swiper-button-next hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 cursor-pointer" tabIndex={0} aria-label="Next slide" />
      </Swiper>
    </div>
  );
};

export default SimilarProperties; 