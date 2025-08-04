import Image from "next/image";
import Link from "next/link";
import { getProperties } from "../services/propertyService";
import ClientPropertyList from "../components/ClientPropertyList";

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

// Server-side data fetching for initial page load
async function getInitialProperties(): Promise<Property[]> {
  try {
    const data = await getProperties({
      page: 1,
      limit: 12
    });
    return data.results || [];
  } catch (error) {
    console.error('Error fetching initial properties:', error);
    // Return empty array if API is not available (for deployment)
    return [];
  }
}

export default async function Home() {
  // Server-side data fetching for SEO and initial load
  const initialProperties = await getInitialProperties();
  
  const location = ["Hitech city", "Madhapur", "abgfdkkj", "Huder"];
  const bhk = ["1RK", "1BHK", "2BHK", "3BHK", "4BHK"];

  return (
    <div className="overscroll-x-none">
      {/* Hero Section */}
      <div className="relative">
        <div className="pt-12">
          <div className="text-[#5f5f5f] ml-10">
            <span className="text-8xl font-bold leading-[76px] tracking-widest">Free</span>
            <span className="text-6xl font-bold leading-[76px] tracking-widest"> </span>
            <span className="text-8xl font-normal leading-[76px] tracking-widest">means</span>
            <span className="text-6xl font-bold leading-[76px] tracking-widest"> </span>
            <span className="text-8xl font-bold leading-[76px] tracking-widest">Free</span>
          </div>
          <div className="text-[#696c78] text-xl leading-relaxed ml-10">
            I don&apos;t even have the payment page
          </div>

          {/* Call-to-action Button */}
          <Link href="post-property">
            <button className="ml-10 flex items-center bg-[#d0ff38] py-3 px-6 md:py-6 md:px-14 m-4 md:m-10 mt-8 md:mt-18 rounded-full">
              <div className="text-sm text-black font-bold pr-2 md:pr-4 leading-normal md:text-xl">
                List property for free
              </div>
              <Image
                src="/add_icon.svg"
                alt="Add Icon"
                width={20}
                height={20}
                className="md:w-[30px] md:h-[30px]"
              />
            </button>
          </Link>
        </div>

        {/* Hero Image */}
        <Image
          src="/hero_img.svg"
          alt="Novizit Hero Image"
          width={800}
          height={200}
          className="md:absolute md:right-10 top-0"
        />
      </div>

      {/* Search Filters and Property Listings - Client Component */}
      <ClientPropertyList 
        initialProperties={initialProperties}
        locationList={location}
        bhkTypes={bhk}
      />
    </div>
  );
}
