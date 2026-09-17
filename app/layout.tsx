import "@/lib/orpc.server"; // for pre-rendering for SSR
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "./(marketing)/AuthProvider";
import { Providers } from "@/lib/providers";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Workflo — Team chat that keeps context",
    template: "%s | Workflo",
  },
  description:
    "Workflo is a fast, focused workspace chat app — channels, threads, and AI-assisted messaging for teams that want less noise and more context.",
  keywords: [
    "team chat",
    "workspace chat",
    "channels",
    "threads",
    "Slack alternative",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Workflo",
    title: "Workflo — Team chat that keeps context",
    description:
      "Channels, threads, and AI-assisted messaging for teams that want less noise and more context.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Workflo — Team chat that keeps context",
    description:
      "Channels, threads, and AI-assisted messaging for teams that want less noise and more context.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <head />
        <body className="min-h-full flex flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Providers>{children}</Providers>
            <Toaster closeButton position="top-center" />
          </ThemeProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
