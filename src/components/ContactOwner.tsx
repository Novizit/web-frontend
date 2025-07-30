import Image from "next/image";

const ProfileIcon = "/profile_icon.svg";
const CallIcon = "/call_icon.svg";

type ContactOwnerProps = {
  owner: {
    name?: string;
    userType?: string;
    contact?: string;
    ownerName?: string;
    contactNumber?: string;
    ownerType?: string;
  };
};

const ContactOwner = ({ owner }: ContactOwnerProps) => {
  // Use the correct field names from the backend
  const ownerName = owner.name || owner.ownerName || 'Owner';
  const ownerType = owner.userType || owner.ownerType || 'Property Owner';
  const contactNumber = owner.contact || owner.contactNumber || 'Contact not available';

  return (
    <div className="md:w-full text-[#24272c]">
      <h3 className="text-xl font-medium mb-4">Contact</h3>
      <div className="bg-[#d2f26b] p-5 rounded-xl">
        <div className="flex items-center mb-6">
          <Image src={ProfileIcon} alt="Profile Icon" width={32} height={32} />
          <div className="ml-5">
            <h4 className="text-lg font-semibold">{ownerName}</h4>
            <p className="text-xs font-medium">{ownerType}</p>
          </div>
        </div>
        <div className="flex bg-white mx-10 px-2.5 py-2.5 rounded-full">
          <Image src={CallIcon} alt="Call icon" width={24} height={24} />
          <p className="text-lg font-semibold mx-4">{contactNumber}</p>
        </div>
      </div>
    </div>
  );
};

export default ContactOwner; 