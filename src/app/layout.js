import { Geist, Geist_Mono, Playfair_Display, Barlow_Condensed, Abril_Fatface, Bebas_Neue } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

const abrilFatface = Abril_Fatface({
  variable: "--font-abril",
  subsets: ["latin"],
  weight: ["400"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: ["400"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "TripCraft — Plan Your Adventures",
  description: "A travel planning app to organize itineraries, flights, budgets, maps, and more.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${abrilFatface.variable} ${bebasNeue.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <head>
        <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" as="script" />
        <link rel="preload" href="https://unpkg.com/three-globe@2.24.4/example/img/earth-blue-marble.jpg" as="image" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
