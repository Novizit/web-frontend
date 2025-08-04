"use client";

import { useEffect, useState } from 'react';
import { getSimilarProperties } from '../services/propertyService';
import SimilarProperties from './SimilarProperties';

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
}

interface ClientSimilarPropertiesProps {
  propertyId: number;
  currentProperty: Property;
}

export default function ClientSimilarProperties({ 
  propertyId, 
  currentProperty 
}: ClientSimilarPropertiesProps) {
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const fetchSimilarProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await getSimilarProperties(propertyId, 6);
        setSimilarProperties((result.properties as Property[]) || []);
        setIsFallback(result.isFallback || false);
      } catch (err) {
        console.error('Error fetching similar properties:', err);
        setError('Failed to fetch similar properties');
        setSimilarProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProperties();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="p-4">
        <h3 className="text-[#24272c] text-xl font-medium my-10">Similar properties</h3>
        <div className="flex justify-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#D2F26B]"></div>
          <span className="ml-2 text-gray-600">Loading similar properties...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h3 className="text-[#24272c] text-xl font-medium my-10">Similar properties</h3>
        <div className="text-center py-8">
          <p className="text-red-500 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-[#D2F26B] underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (similarProperties.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-[#24272c] text-xl font-medium my-10">Similar properties</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No similar properties found.</p>
        </div>
      </div>
    );
  }

  // Add slides property to properties for compatibility
  const propertiesWithSlides = similarProperties.map(property => ({
    ...property,
    slides: ["/property_Img.svg", "/property_Img.svg", "/property_Img.svg"]
  }));

  const currentPropertyWithSlides = {
    ...currentProperty,
    slides: ["/property_Img.svg", "/property_Img.svg", "/property_Img.svg"]
  };

  return (
    <div className="p-4">
      <h3 className="text-[#24272c] text-xl font-medium my-10">
        Similar properties
        {isFallback && (
          <span className="text-sm text-gray-500 ml-2">(showing general recommendations)</span>
        )}
      </h3>
      <SimilarProperties 
        currentProperty={currentPropertyWithSlides} 
        allProperties={propertiesWithSlides} 
        isFallback={isFallback} 
      />
    </div>
  );
} 