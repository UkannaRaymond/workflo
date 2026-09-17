"use client";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import Logo from "@/public/logo.svg";
import {
  RegisterLink,
  LoginLink,
  LogoutLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

const menuItems = [
  { name: "Features", href: "#features" },
  { name: "Product", href: "#product" },
  { name: "How it works", href: "#how-it-works" },
];

export const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { getUser, isLoading } = useKindeBrowserClient();
  const user = getUser();

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="font-[Geist,ui-sans-serif]">
      <nav
        data-state={menuState && "active"}
        className="fixed z-50 w-full px-4 pt-4"
      >
        <div
          className={cn(
            "mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-full border px-4 py-2.5 transition-all duration-300",
            "border-[#e7e3da] bg-[#f8f7f4]/80 backdrop-blur-lg",
            isScrolled &&
              "shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(43,42,39,0.25)]",
          )}
        >
          <Link href="/" aria-label="home" className="flex items-center gap-2">
            <Image
              src={Logo}
              alt="Workflo logo"
              width={28}
              height={28}
              priority
            />
            <span className="text-lg font-semibold text-[#2b2a27]">
              workflo.
            </span>
          </Link>

          <ul className="hidden items-center gap-7 text-sm text-[#6b6a63] lg:flex">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="transition-colors hover:text-[#2b2a27]"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 lg:flex">
            {isLoading ? null : user ? (
              <>
                <Link
                  href="/workspace"
                  className="rounded-full bg-[#2b2a27] px-4 py-2 text-sm font-medium text-[#f8f7f4] transition-opacity hover:opacity-90"
                >
                  Dashboard
                </Link>
                <LogoutLink className="rounded-full border border-[#e7e3da] px-4 py-2 text-sm font-medium text-[#2b2a27] transition-colors hover:bg-[#efece3]">
                  Log out
                </LogoutLink>
              </>
            ) : (
              <>
                <LoginLink className="rounded-full px-4 py-2 text-sm font-medium text-[#2b2a27] transition-colors hover:bg-[#efece3]">
                  Log in
                </LoginLink>
                <RegisterLink
                  className="rounded-full bg-[#2b2a27] px-4 py-2 text-sm font-medium text-[#f8f7f4] transition-opacity hover:opacity-90"
                  authUrlParams={{
                    is_create_org: "true",
                    org_name: "New Workspace",
                    pricing_table_key: "organization_plans",
                  }}
                >
                  Join Workflo
                </RegisterLink>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuState(!menuState)}
            aria-label={menuState ? "Close Menu" : "Open Menu"}
            className="relative z-20 -m-2.5 block cursor-pointer p-2.5 text-[#2b2a27] lg:hidden"
          >
            <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-5 duration-200" />
            <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-5 -rotate-180 scale-0 opacity-0 duration-200" />
          </button>
        </div>

        {/* Mobile panel */}
        <div className="in-data-[state=active]:flex mx-auto mt-2 hidden max-w-5xl flex-col gap-4 rounded-3xl border border-[#e7e3da] bg-[#f8f7f4] p-6 shadow-lg lg:hidden">
          <ul className="flex flex-col gap-4 text-base text-[#6b6a63]">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link href={item.href} className="hover:text-[#2b2a27]">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          {isLoading ? null : user ? (
            <div className="flex flex-col gap-2">
              <Link
                href="/workspace"
                className="rounded-full bg-[#2b2a27] px-4 py-2 text-center text-sm font-medium text-[#f8f7f4]"
              >
                Dashboard
              </Link>
              <LogoutLink className="rounded-full border border-[#e7e3da] px-4 py-2 text-center text-sm font-medium text-[#2b2a27]">
                Log out
              </LogoutLink>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <LoginLink className="rounded-full border border-[#e7e3da] px-4 py-2 text-center text-sm font-medium text-[#2b2a27]">
                Log in
              </LoginLink>
              <RegisterLink
                className="rounded-full bg-[#2b2a27] px-4 py-2 text-center text-sm font-medium text-[#f8f7f4]"
                authUrlParams={{
                  is_create_org: "true",
                  org_name: "New Workspace",
                  pricing_table_key: "organization_plans",
                }}
              >
                Join Workflo
              </RegisterLink>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
