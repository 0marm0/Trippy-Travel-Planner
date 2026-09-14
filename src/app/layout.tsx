import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./brand.css";
import "./workspace.css";

export const metadata: Metadata = {
  title: "TRIPPY — Travel Optimizer",
  description: "A premium, privacy-conscious workspace for planning better trips.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
