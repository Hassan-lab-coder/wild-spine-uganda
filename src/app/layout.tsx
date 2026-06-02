import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { defaultOgImage, siteUrl } from "@/lib/seo";
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

const bingSiteVerification = process.env.BING_SITE_VERIFICATION || "B6F67952A3E077FEBDC71BA4013ED7B5";
const otherVerification: Record<string, string> = {};

if (bingSiteVerification) {
  otherVerification["msvalidate.01"] = bingSiteVerification;
}

const verification: Metadata["verification"] = {
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
  ...(process.env.YANDEX_SITE_VERIFICATION ? { yandex: process.env.YANDEX_SITE_VERIFICATION } : {}),
  ...(Object.keys(otherVerification).length ? { other: otherVerification } : {}),
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Wild Spine Uganda | Gorilla Trekking Uganda & Rwenzori Expeditions",
    template: "%s | Wild Spine Uganda",
  },
  description:
    "Private gorilla trekking Uganda, Bwindi forest experiences, Rwenzori mountains hiking, luxury Uganda safari planning, and premium expedition support.",
  keywords: [
    "Uganda safaris",
    "gorilla trekking Uganda",
    "Rwenzori mountains",
    "luxury Africa travel",
    "Uganda tours",
    "corporate retreats Uganda",
    "conservation travel Uganda",
  ],
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
    title: "Wild Spine Uganda | Gorilla Trekking Uganda & Rwenzori Expeditions",
    description:
      "Private gorilla trekking, Bwindi permit help, Rwenzori hiking, and luxury Uganda safari planning.",
    url: siteUrl,
    siteName: "Wild Spine Uganda",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: "Mountain gorilla in Uganda",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wild Spine Uganda | Gorilla Trekking Uganda & Rwenzori Expeditions",
    description:
      "Private Uganda journeys for gorilla trekking, Rwenzori hiking, Bwindi permit help, and luxury safari planning.",
    images: [defaultOgImage],
  },
  verification: {
    ...verification,
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
            "@id": `${siteUrl}/#organization`,
            name: "Wild Spine Uganda",
            url: siteUrl,
            logo: `${siteUrl}/images/gorilla.jpg`,
            image: `${siteUrl}/images/gorilla.jpg`,
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
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "Executive Wilderness Retreats" } },
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "Conservation Membership" } },
            ],
            sameAs: [
              "https://www.wildspineuganda.com",
            ],
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": `${siteUrl}/#website`,
            name: "Wild Spine Uganda",
            url: siteUrl,
            publisher: {
              "@id": `${siteUrl}/#organization`,
            },
            inLanguage: "en",
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
