import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo.svg";

const links = [
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#efece3] bg-[#f8f7f4] px-6 py-10 text-[#6b6a63]">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm sm:flex-row">
        <div className="flex items-center gap-2">
          <Image src={Logo} alt="Workflo logo" width={20} height={20} />
          <span className="font-medium text-[#2b2a27]">workflo.</span>
        </div>
        <div className="flex items-center gap-5">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-[#2b2a27]"
            >
              {link.name}
            </Link>
          ))}
        </div>
        <p>© {new Date().getFullYear()} Workflo</p>
      </div>
    </footer>
  );
}
