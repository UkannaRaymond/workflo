import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Workflo",
    short_name: "Workflo",
    description: "Team chat that keeps context.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0546C3",
    icons: [
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
