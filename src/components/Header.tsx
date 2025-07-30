import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/50 backdrop-blur-md border-b border-white/10 px-10 py-4">
      <Link href="/">
        <Image
          src="/logo.png"
          alt="Novizit Logo"
          width={200}
          height={100}
          className="rounded-lg"
        />
      </Link>
    </header>
  );
};

export default Header;
