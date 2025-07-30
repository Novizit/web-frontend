import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './PropertyImageCarousel.css'; // Custom styles for Swiper

interface PropertyImageCarouselProps {
  images: string[];
}

const PropertyImageCarousel: React.FC<PropertyImageCarouselProps> = ({ images }) => {
  return (
    <div className="relative w-full flex justify-center overflow-visible">
      {/* Carousel wrapper with fixed width */}
      <div className="absolute top-1/2 -translate-y-1/2 left-[-60px] hidden sm:flex flex-col gap-4 z-10">
        <button className="custom-swiper-nav custom-swiper-nav-prev bg-white shadow p-2 rounded-full hover:bg-gray-100">
          <span className="material-icons">arrow_back</span>
        </button>
      </div>
      <div className="relative max-w-[700px] w-full">

        {/* Swiper Slider */}
        <Swiper
          modules={[Navigation, Pagination]}
          navigation={{
            nextEl: ".custom-swiper-nav-next",
            prevEl: ".custom-swiper-nav-prev",
          }}
          pagination={{ clickable: true, el: ".custom-swiper-pagination" }}
          className="rounded-2xl overflow-hidden"
          style={{ aspectRatio: "16/9", width: "100%" }}
        >
          {images.map((img, idx) => (
            <SwiperSlide key={idx}>
              <img
                src={img}
                alt={`Property image ${idx + 1}`}
                className="object-cover w-full h-full"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Pagination */}
        <div className="custom-swiper-pagination flex justify-center mt-4"></div>

        {/* Arrows outside carousel */}
        <div className="absolute top-1/2 -translate-y-1/2 right-[-60px] hidden sm:flex flex-col gap-4 z-10">
          <button className="custom-swiper-nav custom-swiper-nav-next bg-white shadow p-2 rounded-full hover:bg-gray-100">
            <span className="material-icons">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyImageCarousel;