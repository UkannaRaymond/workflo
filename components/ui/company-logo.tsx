import Image, { StaticImageData } from "next/image";

type CompanyLogoProps = {
  name: string;
  logo: StaticImageData;
  priority?: boolean;
};

export function CompanyLogo({
  name,
  logo,
  priority = false,
}: CompanyLogoProps) {
  return (
    <div className="flex items-center justify-center">
      <Image
        src={logo}
        alt={name}
        width={logo.width}
        height={logo.height}
        className="h-12 w-auto opacity-60 grayscale transition-all duration-500 hover:scale-105 hover:opacity-100 hover:grayscale-0 dark:invert"
        priority={priority}
      />
    </div>
  );
}
