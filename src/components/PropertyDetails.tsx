"use client";


import PropertyImageCarousel from "./PropertyImageCarousel";

interface Property {
  id: number;
  propertyName: string;
  rent: number;
  securityDeposit?: number;
  maintenance?: number;
  location: string;
  propertyType: string;
  formattedBhkType?: string;
  bhkType?: string;
  formattedFurnishing?: string;
  furnishing?: string;
  preferredTenant?: string;
  tenantType?: string;
  availableFrom: string;
  imageUrls?: string[];
  slides?: string[];
  title?: string;
  price?: number;
}

export default function PropertyDetails({ property }: { property: Property }) {

  // Use actual images from imageUrls or slides
  const images: string[] =
    Array.isArray(property.imageUrls) && property.imageUrls.length > 0
      ? property.imageUrls
      : Array.isArray(property.slides) && property.slides.length > 0
      ? property.slides
      : [];

  return (
    <div className="mt-10">
  {/* Property Images */}
  <div className="mb-4">
    {images && images.length > 0 ? (
      <PropertyImageCarousel images={images} />
    ) : (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    )}
  </div>

  {/* Title and Rent */}
  <h2 className="text-3xl font-semibold mt-14">{property.propertyName || property.title}</h2>

  <div className="flex justify-between items-center mt-6">
    <p className="text-2xl font-[550] mb-4">
      ₹{property.rent || property.price}
      <span className="text-base font-normal text-gray-500">/month</span>
    </p>

    {/* Property Type + BHK Pills */}
    <div className="flex gap-3 mb-6">
      <span className="text-sm px-4 py-1 rounded-full bg-[#d2f26b] text-black font-medium">
        {property.propertyType}
      </span>
      <span className="text-sm px-4 py-1 rounded-full border border-black text-black font-medium">
        {property.formattedBhkType || property.bhkType}
      </span>
    </div>
  </div>

  {/* Details Section - Two Column Layout */}
  <div className="grid grid-cols-[1fr_auto] gap-y-4 gap-x-6 text-base font-medium text-gray-500 mb-10">
    <div>Security Deposit</div>
    <div className="text-right text-black">₹{property.securityDeposit || '—'}</div>

    <div>Maintenance</div>
    <div className="text-right text-black">₹{property.maintenance || '—'}</div>

    <div>Furnishing Status</div>
    <div className="text-right text-black">
      {property.formattedFurnishing || property.furnishing}
    </div>

    <div>Preferred Tenant</div>
    <div className="text-right text-black">
      {property.preferredTenant || property.tenantType}
    </div>

    <div>Available from</div>
    <div className="text-right text-black">
      {property.availableFrom
        ? new Date(property.availableFrom).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'Not specified'}
    </div>
  </div>

  {/* Location */}
  <div className="mt-6">
    <h3 className="font-semibold text-lg mb-1">Location</h3>
    <p className="text-base font-medium text-gray-400 max-w-xl">
      {property.location}
    </p>
  </div>
</div>
  );
}