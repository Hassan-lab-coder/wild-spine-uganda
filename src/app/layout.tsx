import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AnalyticsTracker from "./components/AnalyticsTracker";
import JsonLd from "./components/JsonLd";
import PublicSiteFooter from "./components/PublicSiteFooter";
import PublicSiteHeader from "./components/PublicSiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wild Spine Uganda | Gorilla Trekking & Rwenzori Expeditions",
  description:
    "Luxury Uganda expeditions from Bwindi gorilla forests to the Rwenzori Mountains. Private, premium, unforgettable journeys.",
  keywords: [
    "Uganda safaris",
    "gorilla trekking Uganda",
    "Rwenzori mountains",
    "luxury Africa travel",
    "Uganda tours",
  ],
  openGraph: {
    title: "Wild Spine Uganda",
    description:
      "Trek the Backbone of Africa - premium gorilla & mountain expeditions.",
    url: "https://wildspineuganda.com",
    siteName: "Wild Spine Uganda",
    locale: "en_US",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            name: "Wild Spine Uganda",
            url: "https://wildspineuganda.com",
            areaServed: "Uganda",
            description:
              "Private Uganda journeys for gorilla trekking, Rwenzori hiking, luxury safaris, and permit planning.",
            telephone: "+256751828241",
            email: "reservations@wildspineuganda.com",
            address: [
              {
                "@type": "PostalAddress",
                streetAddress: "Victoria Mall",
                addressLocality: "Entebbe",
                addressCountry: "UG",
              },
              {
                "@type": "PostalAddress",
                streetAddress: "Kingdom Kampala",
                addressLocality: "Kampala",
                addressCountry: "UG",
              },
            ],
            makesOffer: [
              { "@type": "Offer", itemOffered: { "@type": "TouristTrip", name: "The Spine Explorer" } },
              { "@type": "Offer", itemOffered: { "@type": "TouristTrip", name: "The Summit Trail" } },
              { "@type": "Offer", itemOffered: { "@type": "TouristTrip", name: "Margherita Expedition" } },
            ],
          }}
        />
        <AnalyticsTracker />
        <PublicSiteHeader />
        {children}
        <PublicSiteFooter />
      </body>
    </html>
  );
}
