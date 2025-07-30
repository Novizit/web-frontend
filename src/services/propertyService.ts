const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper function to determine if we're on the server or client
const isServer = typeof window === 'undefined';

// Helper function to get the appropriate base URL
const getBaseUrl = () => {
  if (isServer) {
    // For server-side rendering, use the full URL
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  }
  // For client-side, use relative URL or the configured URL
  return API_BASE_URL;
};

export async function createProperty(property: any) {
  const response = await fetch(`${getBaseUrl()}/properties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(property),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.errors || 'Failed to create property';
    throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
  }
  return response.json();
}

export async function getProperties(filters?: {
  location?: string;
  bhkTypes?: string[];
  page?: number;
  limit?: number;
}) {
  try {
    const params = new URLSearchParams();
    
    // Only add location parameter if it's not empty and has minimum length
    if (filters?.location && filters.location.trim() !== '') {
      const trimmedLocation = filters.location.trim();
      
      // For multiple locations, check if any individual location is at least 2 characters
      if (trimmedLocation.includes(',')) {
        const locations = trimmedLocation.split(',').map(loc => loc.trim()).filter(loc => loc.length >= 2);
        if (locations.length > 0) {
          params.append('location', locations.join(','));
        }
      } else {
        // Single location - check if it's at least 2 characters
        if (trimmedLocation.length >= 2) {
          params.append('location', trimmedLocation);
        }
      }
    }
    
    // Only add BHK types if the array is not empty
    if (filters?.bhkTypes && filters.bhkTypes.length > 0) {
      // Add each BHK type as a separate parameter
      filters.bhkTypes.forEach(bhk => {
        if (bhk && bhk.trim() !== '') {
          params.append('bhkType', bhk);
        }
      });
    }
    
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const url = `${getBaseUrl()}/properties${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache control for better performance
      cache: isServer ? 'no-store' : 'default',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getProperties:', error);
    throw error;
  }
}

export async function getPropertyById(id: number) {
  const response = await fetch(`${getBaseUrl()}/properties/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: isServer ? 'no-store' : 'default',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch property');
  }
  return response.json();
} 

export async function getSimilarProperties(propertyId: number, maxResults: number = 6): Promise<{ properties: any[], isFallback: boolean }> {
  const url = `${getBaseUrl()}/properties/similar-properties/${propertyId}?maxResults=${maxResults}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: isServer ? 'no-store' : 'default',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }
  return response.json();
} 