"use client";

import { useState } from 'react';
import { createProperty } from '../../services/propertyService';

// Helper to get SAS URL from backend
async function getAzureSasUrl(filename: string, contentType: string): Promise<{ uploadUrl: string; blobUrl: string; expiresOn: string }> {
  const res = await fetch('http://localhost:3001/api/azure/sas-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, contentType }),
  });
  if (!res.ok) throw new Error('Failed to get SAS URL');
  return res.json();
}

const PostProperty = () => {
    const [formData, setFormData] = useState({
        propertyName: '',
        propertyRent: '',
        securityDeposit: '',
        maintenance: '',
        propertyLocation: '',
        availableFrom: '',
        propertyType: '',
        bhkType: '',
        furnishedInfo: '',
        tenantType: '',
        ownerName: '',
        contactNumber: '',
        ownerType: '',
    });

    const [successMessage, setSuccessMessage] = useState(''); // State to manage success message
    const [errorMessage, setErrorMessage] = useState(''); // State to manage error message
    const [imageFiles, setImageFiles] = useState<File[]>([]); // File[]
    const [imagePreviews, setImagePreviews] = useState<string[]>([]); // string[]
    const [uploading, setUploading] = useState(false);

    // Add index signatures to allow string indexing
    const propertyTypeLabels: { [key: string]: string } = { INDIVIDUAL: 'Individual', APARTMENT: 'Apartment', VILLA: 'Villa' };
    const bhkTypeDisplayLabels: { [key: string]: string } = { ONE_RK: '1RK', ONE_BHK: '1BHK', TWO_BHK: '2BHK', THREE_BHK: '3BHK', FOUR_BHK: '4BHK' };
    const bhkTypeBackendLabels: { [key: string]: string } = { ONE_RK: 'OneRK', ONE_BHK: 'OneBHK', TWO_BHK: 'TwoBHK', THREE_BHK: 'ThreeBHK', FOUR_BHK: 'FourBHK' };
    const furnishingDisplayLabels: { [key: string]: string } = { UNFURNISHED: 'Unfurnished', SEMI_FURNISHED: 'Semi-Furnished', FULLY_FURNISHED: 'Full-Furnished' };
    const furnishingBackendLabels: { [key: string]: string } = { UNFURNISHED: 'Unfurnished', SEMI_FURNISHED: 'SemiFurnished', FULLY_FURNISHED: 'FullFurnished' };
    const tenantLabels: { [key: string]: string } = { ANY: 'Any', FAMILY: 'Family', BACHELOR: 'Bachelor' };
    const ownerTypeLabels: { [key: string]: string } = { landlord: 'Landlord', other: 'Other' };

    type BHKType = 'ONE_RK' | 'ONE_BHK' | 'TWO_BHK' | 'THREE_BHK' | 'FOUR_BHK';
    type FurnishedInfo = 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED';
    type PropertyType = 'INDIVIDUAL' | 'APARTMENT' | 'VILLA';
    type TenantType = 'ANY' | 'FAMILY' | 'BACHELOR';
    type OwnerType = 'landlord' | 'other'

    const bhkTypeOptions: BHKType[] = ['ONE_RK', 'ONE_BHK', 'TWO_BHK', 'THREE_BHK', 'FOUR_BHK'];
    const furnishedInfoOptions: FurnishedInfo[] = ['UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED'];
    const propertyTypeOptions: PropertyType[] = ['INDIVIDUAL', 'APARTMENT', 'VILLA'];
    const tenantTypeOptions: TenantType[] = ['ANY', 'FAMILY', 'BACHELOR'];
    const ownerTypeOptions: OwnerType[] = ['landlord', 'other'];


    const handleDateOptionSelect = (field: string, value: string) => {
        if (field === 'availableFrom') {
            if (value === 'Now') {
                // Use today's date in local time, not UTC
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                setFormData({
                    ...formData,
                    availableFrom: `${yyyy}-${mm}-${dd}`
                });
            } else {
                setFormData({
                    ...formData,
                    [field]: value
                });
            }
        } else {
            setFormData({
                ...formData,
                [field]: value
            });
        }
    };

    // Update handleOptionSelect type annotation
    const handleOptionSelect = (field: keyof typeof formData, value: string) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [field]: value
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Image input handler
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        // Add new files to existing ones instead of replacing
        setImageFiles(prevFiles => [...prevFiles, ...files]);
        // Add new previews to existing ones
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
        // Clear the input value to allow selecting the same file again
        e.target.value = '';
    };

    // Remove image handler
    const removeImage = (index: number) => {
        setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
        setImagePreviews(prevPreviews => {
            // Revoke the object URL to prevent memory leaks
            URL.revokeObjectURL(prevPreviews[index]);
            return prevPreviews.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        const requiredFields = {
            propertyName: formData.propertyName,
            propertyRent: formData.propertyRent,
            securityDeposit: formData.securityDeposit,
            propertyLocation: formData.propertyLocation,
            propertyType: formData.propertyType,
            bhkType: formData.bhkType,
            furnishedInfo: formData.furnishedInfo,
            tenantType: formData.tenantType,
            ownerType: formData.ownerType,
            ownerName: formData.ownerName,
            contactNumber: formData.contactNumber,
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => !value || value.trim() === '')
            .map(([key]) => key);

        if (missingFields.length > 0) {
            setErrorMessage(`Please fill in all required fields: ${missingFields.join(', ')}`);
            setTimeout(() => {
                setErrorMessage('');
            }, 5000);
            return;
        }

        let imageUrls: string[] = [];
        if (imageFiles.length > 0) {
            setUploading(true);
            try {
                imageUrls = await Promise.all(imageFiles.map(async (file) => {
                    // 1. Get SAS URL from backend
                    const { uploadUrl, blobUrl } = await getAzureSasUrl(file.name, file.type);
                    // 2. Upload to Azure Blob Storage
                    const uploadRes = await fetch(uploadUrl, {
                        method: 'PUT',
                        headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': file.type },
                        body: file,
                    });
                    if (!uploadRes.ok) throw new Error('Failed to upload image to Azure');
                    return blobUrl;
                }));
            } catch (err) {
                setUploading(false);
                setErrorMessage('Image upload failed: ' + (err instanceof Error ? err.message : err));
                setTimeout(() => setErrorMessage(''), 10000);
                return;
            }
            setUploading(false);
        }

        const property = {
            propertyName: formData.propertyName,
            rent: Number(formData.propertyRent),
            securityDeposit: Number(formData.securityDeposit),
            maintenance: Number(formData.maintenance),
            location: formData.propertyLocation,
            availableFrom: formData.availableFrom ? new Date(formData.availableFrom + 'T00:00:00').toISOString() : new Date().toISOString(),
            propertyType: propertyTypeLabels[formData.propertyType],
            bhkType: bhkTypeBackendLabels[formData.bhkType],
            furnishing: furnishingBackendLabels[formData.furnishedInfo],
            preferredTenant: tenantLabels[formData.tenantType],
            ownerType: ownerTypeLabels[formData.ownerType],
            ownerName: formData.ownerName,
            contactNumber: formData.contactNumber,
            imageUrls, // <-- Azure Blob URLs
        };

        console.log('Sending property data:', property);

        try {
            setErrorMessage(''); // Clear any previous errors
            await createProperty(property);
            setSuccessMessage('Property posted successfully!');
            setTimeout(() => {
                setSuccessMessage('');
            }, 5000);

            // Clear form data
            setFormData({
                propertyName: '',
                propertyRent: '',
                securityDeposit: '',
                maintenance: '',
                propertyLocation: '',
                availableFrom: '',
                propertyType: '',
                bhkType: '',
                furnishedInfo: '',
                tenantType: '',
                ownerName: '',
                contactNumber: '',
                ownerType: '',
            });

            // Clear images and previews
            setImageFiles([]);
            setImagePreviews(prevPreviews => {
                // Revoke all object URLs to prevent memory leaks
                prevPreviews.forEach(url => URL.revokeObjectURL(url));
                return [];
            });
        } catch (error) {
            console.error('Failed to save property:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Failed to save property');
            setTimeout(() => {
                setErrorMessage('');
            }, 10000);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className='mx-6 md:flex flex-col items-center'>
                <div className='mb-4 md:w-1/2'>
                    <div className='font-medium text-2xl flex justify-center mb-6'><h3>Property Details</h3></div>

                    {/* Image Upload */}
                    <div className="mb-6">
                        <label className="block mb-2 font-medium">Property Images</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none py-8 px-4"
                        />
                        <div className="flex flex-wrap gap-4 mt-4">
                            {imagePreviews.map((src, idx) => (
                                <div key={idx} className="relative">
                                    <img 
                                        src={src} 
                                        alt="Preview" 
                                        className="w-24 h-24 object-cover rounded-lg border" 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                                        title="Remove image"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        {uploading && <div className="text-blue-600 mt-2">Uploading images...</div>}
                    </div>

                    {/* Property Name Input */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            name="propertyName"
                            value={formData.propertyName}
                            onChange={handleChange}
                            id="propertyName"
                            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-[#838383] appearance-none focus:outline-none focus:ring-0 focus:border-[#d1c796] peer"
                            placeholder=" "
                            required
                        />
                        <label htmlFor="propertyName" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-[#d1c796] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-4">
                            Property Name
                        </label>
                    </div>

                    {/* Rent Input */}
                    <div className="relative mb-4">
                        <input
                            type="number"
                            name="propertyRent"
                            value={formData.propertyRent}
                            onChange={handleChange}
                            id="rent"
                            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-[#838383] appearance-none focus:outline-none focus:ring-0 focus:border-[#d1c796] peer"
                            placeholder=" "
                            required
                        />
                        <label htmlFor="rent" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-[#d1c796] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-4">
                            Rent
                        </label>
                    </div>

                    <div className="relative mb-4">
                        <input
                            type="number"
                            name="securityDeposit"
                            value={formData.securityDeposit}
                            onChange={handleChange}
                            id="security_deposit"
                            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-[#838383] appearance-none focus:outline-none focus:ring-0 focus:border-[#d1c796] peer"
                            placeholder=" "
                            required
                        />
                        <label htmlFor="security_deposit" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-[#d1c796] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-4">
                            Security Deposit
                        </label>
                    </div>

                    <div className="relative mb-4">
                        <input
                            type="number"
                            name="maintenance"
                            value={formData.maintenance}
                            onChange={handleChange}
                            id="maintenance"
                            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-[#838383] appearance-none focus:outline-none focus:ring-0 focus:border-[#d1c796] peer"
                            placeholder=" "
                        />
                        <label htmlFor="maintenance" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-[#d1c796] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-4">
                            Maintenance
                        </label>
                    </div>

                    <div className="relative mb-4">
                        <input
                            type="text"
                            name="propertyLocation"
                            value={formData.propertyLocation}
                            onChange={handleChange}
                            id="location"
                            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-[#838383] appearance-none focus:outline-none focus:ring-0 focus:border-[#d1c796] peer"
                            placeholder=" "
                            required
                        />
                        <label htmlFor="location" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-[#d1c796] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-4    ">
                            Location
                        </label>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Available From</label>
                        <div className='flex'>
                            <div className="flex items-center font-normal">
                                <button
                                    type="button"
                                    className={`px-4 py-2 rounded-lg ${formData.availableFrom === new Date().toISOString().split('T')[0] ? 'bg-[#d1c796] text-white' : 'bg-white text-[#696C78]'}`}
                                    onClick={() => handleDateOptionSelect('availableFrom', 'Now')}
                                >
                                    Available Now
                                </button>
                                <p className='mx-4'>or</p>
                                <div className="">
                                    <input
                                        placeholder='Choose date'
                                        type="date"
                                        name="availableFrom"
                                        value={formData.availableFrom}
                                        onChange={handleChange}
                                        className="block px-4 py-1.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-[#838383] focus:outline-none focus:ring-0 focus:border-[#d1c796]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Property Type</label>
                        <div className="flex flex-wrap font-normal">
                            {propertyTypeOptions.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    className={`px-4 py-2 rounded-lg ${formData.propertyType === option ? 'bg-[#d1c796] text-white' : 'bg-white text-[#696C78]'}`}
                                    onClick={() => handleOptionSelect('propertyType', option)}
                                >
                                    {propertyTypeLabels[option]} {/* Use label here */}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">BHK Type</label>
                        <div className="flex flex-wrap font-normal">
                        {bhkTypeOptions.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    className={`px-4 py-2 rounded-lg ${formData.bhkType === option ? 'bg-[#d1c796] text-white' : 'bg-white text-[#696C78]'}`}
                                    onClick={() => handleOptionSelect('bhkType', option)}
                                >
                                    {bhkTypeDisplayLabels[option]} {/* Use display label here */}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Furnishing</label>
                        <div className="flex flex-wrap font-normal">
                        {furnishedInfoOptions.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    className={`px-4 py-2 rounded-lg ${formData.furnishedInfo === option ? 'bg-[#d1c796] text-white' : 'bg-white text-[#696C78]'}`}
                                    onClick={() => handleOptionSelect('furnishedInfo', option)}
                                >
                                    {furnishingDisplayLabels[option]} {/* Use display label here */}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Preferred Tenant</label>
                        <div className="flex flex-wrap font-normal">
                        {tenantTypeOptions.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    className={`px-4 py-2 rounded-lg ${formData.tenantType === option ? 'bg-[#d1c796] text-white' : 'bg-white text-[#696C78]'}`}
                                    onClick={() => handleOptionSelect('tenantType', option)}
                                >
                                    {tenantLabels[option]} {/* Use label here */}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Upload Property Images</label>
                        <input
                            required
                            placeholder='images'
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleImageChange}
                            multiple
                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none py-4 px-4"
                        />
                    </div> */}

                    <div>
                        <div className="font-medium text-2xl flex justify-center mt-16 mb-6"><h3>Contact details</h3></div>

                        {/* Owner Type Section */}
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">You are a</label>
                            <div className="flex flex-wrap font-normal">
                                {ownerTypeOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        className={`px-4 py-2 rounded-lg ${formData.ownerType === option ? 'bg-[#d1c796] text-white' : 'bg-white text-[#696C78]'}`}
                                        onClick={() => handleOptionSelect('ownerType', option)}
                                    >
                                        {ownerTypeLabels[option]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Contact Name */}
                        <div className="relative mb-4">
                            <input
                                type="text"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleChange}
                                id="ownerName"
                                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-[#838383] appearance-none focus:outline-none focus:ring-0 focus:border-[#d1c796] peer"
                                placeholder=" "
                                required
                            />
                            <label htmlFor="ownerName" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-[#d1c796] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-4">
                                Name
                            </label>
                        </div>

                        <div className="relative mb-4">
                            <input
                                type="text"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                id="contactNumber"
                                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-[#838383] appearance-none focus:outline-none focus:ring-0 focus:border-[#d1c796] peer"
                                placeholder=" "
                                required
                            />
                            <label htmlFor="contactNumber" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-[#d1c796] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-4">
                                Contact
                            </label>
                        </div>


                        {/* Submit Button */}
                        <button type="submit" className="mt-4 w-full bg-[#d0ff38] text-[#24272C] font-semibold py-2 rounded-lg">
                            Post Property
                        </button>

                        {/* Success Message Popup */}
                        {successMessage && (
                            <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg text-center">
                                {successMessage}
                            </div>
                        )}

                        {/* Error Message Popup */}
                        {errorMessage && (
                            <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg text-center">
                                {errorMessage}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
};

export default PostProperty; 