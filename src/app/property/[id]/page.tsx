import { notFound } from 'next/navigation';
import { getPropertyById } from '../../../services/propertyService';
import PropertyDetails from '../../../components/PropertyDetails';
import ContactOwner from '../../../components/ContactOwner';
import ClientSimilarProperties from '../../../components/ClientSimilarProperties';

interface PropertyPageProps {
  params: {
    id: string;
  };
}

// Server-side data fetching for SEO and initial load
async function getPropertyData(id: string) {
  try {
    const propertyId = parseInt(id, 10);
    if (isNaN(propertyId)) {
      return null;
    }
    
    const property = await getPropertyById(propertyId);
    return property;
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const property = await getPropertyData(params.id);
  
  if (!property) {
    notFound();
  }

  // Add slides property for PropertyDetails component
  const propertyWithSlides = {
    ...property,
    slides: property.imageUrls && property.imageUrls.length > 0 ? property.imageUrls : ["/property_Img.svg"]
  };

      return (
      <div className="p-4">
        <div className='md:flex justify-center gap-20'>
          <div className='mb-10'>
            <PropertyDetails property={propertyWithSlides} />
          </div>
          <div className='max-md:mt-6 mt-10'>
            <ContactOwner owner={{
              ownerName: property.ownerName,
              contactNumber: property.contactNumber,
              ownerType: property.ownerType
            }} />
          </div>
        </div>
      
      {/* Similar Properties - Client Component for dynamic updates */}
      <ClientSimilarProperties 
        propertyId={property.id}
        currentProperty={property}
      />
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PropertyPageProps) {
  const property = await getPropertyData(params.id);
  
  if (!property) {
    return {
      title: 'Property Not Found',
      description: 'The requested property could not be found.',
    };
  }

  return {
    title: `${property.propertyName} - ${property.location}`,
    description: `${property.propertyName} for rent in ${property.location}. ${property.formattedBhkType} ${property.formattedFurnishing} property available from ${new Date(property.availableFrom).toLocaleDateString()}. Rent: ₹${property.rent.toLocaleString()}/month.`,
    openGraph: {
      title: `${property.propertyName} - ${property.location}`,
      description: `${property.propertyName} for rent in ${property.location}. ${property.formattedBhkType} ${property.formattedFurnishing} property.`,
      type: 'website',
      images: ['/property_Img.svg'], // You can add actual property images here
    },
  };
} 