import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TripCraft — Plan Your Adventures",
  description: "A travel planning app to organize itineraries, flights, budgets, maps, and more.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" as="script" />
        <link rel="preload" href="https://unpkg.com/three-globe@2.24.4/example/img/earth-blue-marble.jpg" as="image" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
