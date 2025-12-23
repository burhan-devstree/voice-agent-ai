import { IMAGES } from "@/utils/Images";
import Image from "next/image";
import Link from "next/link";

const TopHeader = () => {
  return (
    <>
      <div className="absolute top-8 left-8 hidden md:block z-20">
        <Link
          href="https://www.devstree.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <div className="bg-white/95  p-3 rounded-2xl shadow-xl border border-white/20 transition-all group-hover:scale-105 group-hover:bg-white duration-300">
            <Image
              src={IMAGES.FullLogoBlack}
              alt="Devstree Full Logo"
              width={100}
              height={50}
              unoptimized
              className="h-8 w-auto object-contain"
            />
          </div>
        </Link>
      </div>

      {/* Mobile Logo */}
      <div className="md:hidden absolute top-8 left-1/2 -translate-x-1/2 z-20">
        <Link
          href="https://www.devstree.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <div className="bg-white/95 p-2.5 rounded-xl shadow-lg border border-white/20">
            <Image
              src={IMAGES.FullLogoBlack}
              alt="Devstree Full Logo"
              width={130}
              height={40}
              unoptimized
              className="h-7 w-auto object-contain"
            />
          </div>
        </Link>
      </div>
    </>
  );
};

export default TopHeader;
