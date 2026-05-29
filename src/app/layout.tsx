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
  metadataBase: new URL("https://www.wildspineuganda.com"),
  title: {
    default: "Wild Spine Uganda | Gorilla Trekking & Rwenzori Expeditions",
    template: "%s | Wild Spine Uganda",
  },
  description:
    "Premium Uganda expeditions, executive wilderness retreats, conservation membership, and private gorilla trekking journeys from Bwindi to the Rwenzori Mountains.",
  keywords: [
    "Uganda safaris",
    "gorilla trekking Uganda",
    "Rwenzori mountains",
    "luxury Africa travel",
    "Uganda tours",
    "corporate retreats Uganda",
    "conservation travel Uganda",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Wild Spine Uganda",
    description:
      "Premium Uganda expeditions, executive retreats, conservation membership, and private gorilla trekking journeys.",
    url: "https://www.wildspineuganda.com",
    siteName: "Wild Spine Uganda",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/gorilla.jpg",
        width: 1200,
        height: 630,
        alt: "Mountain gorilla in Uganda",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wild Spine Uganda",
    description:
      "Private Uganda journeys, executive wilderness retreats, conservation membership, and luxury safari planning.",
    images: ["/images/gorilla.jpg"],
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
            url: "https://www.wildspineuganda.com",
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
              { "@type": "Offer", itemOffered: { "@type": "Event", name: "Executive Wilderness Retreats" } },
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "Conservation Membership" } },
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
