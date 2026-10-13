import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./brand.css";
import "./workspace.css";

export const metadata: Metadata = {
  title: "Trippy Travel Planner",
  description: "Compare cash and points, shape multi-city routes, plan your days and track booking gaps with Trippy.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
