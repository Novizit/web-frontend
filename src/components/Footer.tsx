import Image from 'next/image';

const Footer = () => {
  return (
    <div className="relative min-h-screen flex flex-col justify-end">
      {/* Footer content */}
      <div className="flex md:place-content-center md:space-x-32 max-md:flex-col max-md:ml-2 mb-16 mt-40">
        <div className="flex flex-col gap-5">
          <div className="max-md:flex justify-center">
            <div className="text-sm w-64">
              “Quality Homes, Quality Lives: Connecting Great Homes with Great Tenants”.
            </div>
          </div>
          <div className="text-sm text-center">
            © 2024 Novizit Services Pvt. Ltd. All Rights Reserved
          </div>
        </div>
        <div className="flex md:place-content-center md:space-x-32 max-md:justify-around max-md:m-5 max-md:mt-14">
          <div className="flex flex-col gap-4">
            <h1 className="text-base mb-2">Company</h1>
            <h1 className="text-sm">About us</h1>
            <h1 className="text-sm">Terms and conditions</h1>
            <h1 className="text-sm">Privacy policy</h1>
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-base mb-2">Social</h1>
            <h1 className="text-sm">Instagram</h1>
            <h1 className="text-sm">LinkedIn</h1>
          </div>
        </div>
      </div>

      {/* Bottom image */}
      <div className="relative w-full h-[370px]">
        <Image
          src="/novizit_bottom.svg"
          alt="Novizit Bottom"
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
};

export default Footer;
