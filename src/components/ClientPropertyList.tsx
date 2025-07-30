"use client";

import { useEffect, useState, useCallback } from "react";
import PropertySearch from "./PropertySearch";
import PropertyCard from "./PropertyCard";
import { getProperties } from "../services/propertyService";

interface Property {
  id: number;
  propertyName: string;
  rent: number;
  bhkType: string;
  furnishing: string;
  availableFrom: string;
  propertyType: string;
  location: string;
  formattedBhkType: string;
  formattedFurnishing: string;
  updatedAt: string;
  imageUrls?: string[];
}

interface ClientPropertyListProps {
  initialProperties: Property[];
  locationList: string[];
  bhkTypes: string[];
}

export default function ClientPropertyList({ 
  initialProperties, 
  locationList, 
  bhkTypes 
}: ClientPropertyListProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState<{ location: string; bhkTypes: string[] }>({
    location: '',
    bhkTypes: []
  });

  // Update properties when initialProperties change (hydration)
  useEffect(() => {
    setProperties(initialProperties);
  }, [initialProperties]);

  const fetchProperties = useCallback(async (currentFilters: { location: string; bhkTypes: string[] }) => {
    setLoading(true);
    setError('');
    try {
      const data = await getProperties({
        location: currentFilters.location,
        bhkTypes: currentFilters.bhkTypes,
        page: 1,
        limit: 12
      });
      setProperties(data.results || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFiltersChange = useCallback((newFilters: { location: string; bhkTypes: string[] }) => {
    setFilters(newFilters);
    
    // Only fetch if filters are actually applied
    if (newFilters.location || newFilters.bhkTypes.length > 0) {
      fetchProperties(newFilters);
    } else {
      // Reset to initial properties if no filters
      setProperties(initialProperties);
    }
  }, [fetchProperties, initialProperties]);

  return (
    <>
      {/* Search Filters */}
      <PropertySearch 
        locationList={locationList} 
        bhkTypes={bhkTypes} 
        onFiltersChange={handleFiltersChange}
        isLoading={loading}
      />

      {/* Property Listings */}
      <div className="flex justify-center mx-4 sm:mx-10">
        <div className="mt-20 gap-8 sm:gap-12 md:gap-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 w-full max-w-7xl">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#D2F26B]"></div>
              <p className="mt-2 text-gray-600">Loading properties...</p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <p className="text-red-500 mb-2">{error}</p>
              <button 
                onClick={() => fetchProperties(filters)}
                className="text-[#D2F26B] underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          ) : properties.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 mb-2">
                {filters.location || filters.bhkTypes.length > 0 
                  ? "No properties found matching your criteria." 
                  : "No properties available at the moment."}
              </p>
              {(filters.location || filters.bhkTypes.length > 0) && (
                <button 
                  onClick={() => handleFiltersChange({ location: '', bhkTypes: [] })}
                  className="text-[#D2F26B] underline hover:no-underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            properties.map((property) => (
              <PropertyCard
                key={property.id}
                slides={property.imageUrls && property.imageUrls.length > 0 ? property.imageUrls : ["/property_Img.svg"]}
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
            ))
          )}
        </div>
      </div>
    </>
  );
} 