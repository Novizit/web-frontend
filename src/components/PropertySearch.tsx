"use client";

import Image from 'next/image';
import React, { useState, useEffect, useCallback, useRef } from 'react';

// Use public SVGs for icons
const RemoveIconGreen = "/remove_icon_green.svg";
const SearchIcon = "/search_icon.svg";
const RemoveIconBlack = "/remove_icon_black.svg";

// Define the props interface
interface PropertySearchProps {
  locationList: string[];
  bhkTypes: string[];
  onFiltersChange: (filters: { location: string; bhkTypes: string[] }) => void;
  isLoading?: boolean;
}

interface FilterState {
  searchLocation: string;
  selectedLocations: string[];
  selectedBhkTypes: string[];
}

const PropertySearch: React.FC<PropertySearchProps> = ({ 
  locationList, 
  bhkTypes, 
  onFiltersChange,
  isLoading = false 
}) => {
  const [filters, setFilters] = useState<FilterState>({
    searchLocation: '',
    selectedLocations: [],
    selectedBhkTypes: []
  });
  const [searchError, setSearchError] = useState<string>('');

  // Use ref to store the latest onFiltersChange function
  const onFiltersChangeRef = useRef(onFiltersChange);
  onFiltersChangeRef.current = onFiltersChange;

  // Use ref to store the debounced function
  const debouncedUpdateFiltersRef = useRef<ReturnType<typeof debounce> | null>(null);

  // Create debounced function only once
  useEffect(() => {
    debouncedUpdateFiltersRef.current = debounce((newFilters: FilterState) => {
      const finalLocation = newFilters.searchLocation || 
        (newFilters.selectedLocations.length > 0 ? newFilters.selectedLocations.join(',') : '');
      
      onFiltersChangeRef.current({
        location: finalLocation,
        bhkTypes: newFilters.selectedBhkTypes
      });
    }, 300);

    // Cleanup function
    return () => {
      if (debouncedUpdateFiltersRef.current) {
        // Cancel any pending debounced calls
        debouncedUpdateFiltersRef.current.cancel?.();
      }
    };
  }, []);

  // Debounced filter update to prevent excessive API calls
  const debouncedUpdateFilters = useCallback((newFilters: FilterState) => {
    if (debouncedUpdateFiltersRef.current) {
      debouncedUpdateFiltersRef.current(newFilters);
    }
  }, []);

  // Update filters whenever state changes, but not for search input changes
  useEffect(() => {
    // Only trigger for location buttons and BHK filters
    // Search will be triggered by form submission
    debouncedUpdateFilters(filters);
  }, [filters.selectedLocations.length, filters.selectedBhkTypes.length, debouncedUpdateFilters, filters]);

  // Handle search submission separately
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  
  useEffect(() => {
    if (searchSubmitted && filters.searchLocation.trim()) {
      debouncedUpdateFilters(filters);
      setSearchSubmitted(false);
    }
  }, [searchSubmitted, filters.searchLocation, debouncedUpdateFilters, filters]);

  // Validate search input
  const validateSearchInput = (input: string): boolean => {
    if (input.length > 0 && input.length < 2) {
      setSearchError('Search term must be at least 2 characters long');
      return false;
    }
    if (input.length > 50) {
      setSearchError('Search term is too long (max 50 characters)');
      return false;
    }
    // Check for invalid characters
    if (input.length > 0 && !/^[a-zA-Z0-9\s\-_,.]+$/.test(input)) {
      setSearchError('Search term contains invalid characters');
      return false;
    }
    setSearchError('');
    return true;
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    // Always update the input value for typing
    setFilters(prev => ({
      ...prev,
      searchLocation: value,
      // Clear selected locations when using search
      selectedLocations: value ? [] : prev.selectedLocations
    }));
    
    // Clear error when user starts typing
    if (searchError) {
      setSearchError('');
    }
    
    // If user clears the search completely, trigger update to show all properties
    if (!value.trim()) {
      onFiltersChangeRef.current({
        location: '',
        bhkTypes: filters.selectedBhkTypes
      });
    }
  };

  // Handle location button click
  const handleLocationButtonClick = (location: string) => {
    setFilters(prev => {
      const newSelectedLocations = prev.selectedLocations.includes(location)
        ? prev.selectedLocations.filter((loc) => loc !== location)
        : [...prev.selectedLocations, location];
      
      return {
        ...prev,
        selectedLocations: newSelectedLocations,
        // Clear search when using location buttons
        searchLocation: newSelectedLocations.length > 0 ? '' : prev.searchLocation
      };
    });
  };

  // Handle BHK button click
  const handleBhkButtonClick = (bhk: string) => {
    setFilters(prev => {
      const newSelectedBhkTypes = prev.selectedBhkTypes.includes(bhk)
        ? prev.selectedBhkTypes.filter((b) => b !== bhk)
        : [...prev.selectedBhkTypes, bhk];
      
      return {
        ...prev,
        selectedBhkTypes: newSelectedBhkTypes
      };
    });
  };

  // Handle remove button click
  const handleRemoveClick = (type: 'location' | 'bhk', value: string) => {
    setFilters(prev => {
      if (type === 'location') {
        return {
          ...prev,
          selectedLocations: prev.selectedLocations.filter((loc) => loc !== value)
        };
      } else {
        return {
          ...prev,
          selectedBhkTypes: prev.selectedBhkTypes.filter((b) => b !== value)
        };
      }
    });
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchValue = filters.searchLocation.trim();
    
    if (searchValue) {
      // Validate the search term
      if (!validateSearchInput(searchValue)) {
        return; // Don't search if validation fails
      }
      
      // Update filters with the validated search term
      setFilters(prev => ({
        ...prev,
        searchLocation: searchValue,
        selectedLocations: [] // Clear selected locations when searching
      }));
      
      // Trigger search
      setSearchSubmitted(true);
    }
  };



  return (
    <div className="bg-[#F7F7EF] py-10 mt-32 mx-10 rounded-xl">
      <div className="text-center text-[#5f5f5f] text-5xl font-bold leading-[76px] tracking-widest mb-6">
        Find property
      </div>

      {/* Search Form */}
      <div className="md:flex items-center">
        <form className="mx-4 md:w-1/5 md:ml-10" onSubmit={handleSearchSubmit}>
          <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"></div>
            <input
              type="search"
              id="default-search"
              className={`block w-full p-3 ps-6 text-sm text-[#696C78] rounded-xl px-10 bg-white focus:outline-none truncate ${
                searchError ? 'border-2 border-red-300' : ''
              }`}
              placeholder="Search Location"
              value={filters.searchLocation}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchSubmit(e as React.FormEvent);
                }
              }}
              disabled={isLoading}
            />
            {filters.searchLocation && (
              <button
                type="button"
                aria-label="Clear search"
                className="absolute end-12 bottom-3"
                onClick={() => {
                  setSearchError('');
                  // Clear search and trigger update to show all properties
                  setFilters(prev => ({
                    ...prev,
                    searchLocation: '',
                    selectedLocations: []
                  }));
                  // Trigger immediate update to clear search
                  onFiltersChangeRef.current({
                    location: '',
                    bhkTypes: filters.selectedBhkTypes
                  });
                }}
                disabled={isLoading}
              >
              </button>
            )}
            <button
              type="submit"
              aria-label="Search"
              className="absolute end-3.5 bottom-3"
              disabled={isLoading}
            >
              <Image src={SearchIcon} alt="Search icon" width={20} height={20} />
            </button>
          </div>
          {searchError && (
            <p className="text-red-500 text-xs mt-1 ml-2">{searchError}</p>
          )}
        </form>

        {/* Popular Locations */}
        <div className="flex items-center">
          <h3 className='text-[#5f5f5f] ml-4 mt-6 font-bold md:mt-1'>Popular Locations</h3>
          <div className="flex flex-wrap mx-2 md:ml-10">
            {locationList.map((location, index) => (
              <button
                key={index}
                type="button"
                aria-label={location}
                className={`ml-2 mt-2 pl-2 py-2 pr-2 md:mx-2 ${
                  filters.selectedLocations.includes(location)
                    ? 'border border-[#D2F26B] rounded-xl'
                    : 'border-none'
                } text-[#696C78] flex items-center ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border border-[#D2F26B] rounded-xl'
                }`}
                onClick={() => handleLocationButtonClick(location)}
                disabled={isLoading}
              >
                {location}
                {filters.selectedLocations.includes(location) && (
                  <Image
                    src={RemoveIconGreen}
                    alt="Remove icon"
                    width={16}
                    height={16}
                    className="ml-4 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveClick('location', location);
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter by BHK */}
      <div className='md:flex md:items-center md:ml-6'>
        <h3 className='text-[#5f5f5f] ml-4 mt-6 font-bold md:mt-1'>Filter by</h3>
        <div className="flex flex-wrap mx-2 md:ml-10">
          {bhkTypes.map((bhk, index) => (
            <button
              key={index}
              type="button"
              aria-label={bhk}
              className={`ml-2 mt-2 pl-2 py-2 pr-2 md:mx-2 ${
                filters.selectedBhkTypes.includes(bhk) 
                  ? 'rounded-xl bg-[#D2F26B]' 
                  : 'border-none'
              } text-[#696C78] flex items-center ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#D2F26B] rounded-xl'
              }`}
              onClick={() => handleBhkButtonClick(bhk)}
              disabled={isLoading}
            >
              {bhk}
              {filters.selectedBhkTypes.includes(bhk) && (
                <Image
                  src={RemoveIconBlack}
                  alt="Remove icon"
                  width={16}
                  height={16}
                  className="ml-4 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveClick('bhk', bhk);
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="mt-4 mx-4 md:ml-10 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#D2F26B]"></div>
          <span className="ml-2 text-[#696C78]">Searching properties...</span>
        </div>
      )}
    </div>
  );
};

// Debounce utility function with cancel method
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout;
  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  debounced.cancel = () => {
    clearTimeout(timeout);
  };
  return debounced;
}

export default PropertySearch; 