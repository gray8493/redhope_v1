import type { Metadata } from "next";
import { Inter, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://redhope.io.vn'),
  title: {
    default: "RedHope - Hệ thống Hiến máu Thông minh & Kết nối Bệnh viện",
    template: "%s | RedHope"
  },
  description: "RedHope kết nối người hiến máu và bệnh viện trong thời gian thực. Theo dõi chiến dịch hiến máu, quản lý hồ sơ và nhận thông báo khẩn cấp để cứu sống nhiều người hơn.",
  keywords: ["hiến máu", "tình nguyện", "redhope", "kết nối bệnh viện", "hiến máu nhân đạo", "huyết học truyền máu", "đặt lịch hiến máu"],
  authors: [{ name: "RedHope Team" }],
  creator: "RedHope",
  openGraph: {
    title: "RedHope - Hệ thống Hiến máu Thông minh & Kết nối Bệnh viện",
    description: "Nền tảng công nghệ kết nối mạng lưới người hiến máu và cơ sở y tế trong thời gian thực, vì một cộng đồng khỏe mạnh và bình an.",
    url: 'https://redhope.io.vn',
    siteName: 'RedHope',
    images: [
      {
        url: '/homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'RedHope - Mạng lưới Hiến máu Thông minh',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "RedHope - Hệ thống Hiến máu Thông minh",
    description: "Kết nối mạng lưới người hiến máu và bệnh viện trong thời gian thực.",
    images: ['/homepage.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://redhope.io.vn',
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RedHope",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png" },
    ],
  },
};

// JSON-LD Schema
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "RedHope",
  "url": "https://redhope.io.vn",
  "logo": "https://redhope.io.vn/icons/icon-192x192.png",
  "description": "Hệ thống kết nối người hiến máu và bệnh viện thông minh, hoạt động theo thời gian thực tại Việt Nam.",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "",
    "contactType": "customer service",
    "areaServed": "VN",
    "availableLanguage": "Vietnamese"
  },
  "sameAs": [
    "https://facebook.com/redhope",
    "https://twitter.com/redhope"
  ]
};

import { AuthProvider } from "@/context/AuthContext";
import { MobileSidebar } from "@/components/shared/MobileSidebar";
import { BottomNav } from "@/components/shared/BottomNav";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} ${outfit.variable} antialiased`}
      >
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <AuthProvider>
          {children}
          <MobileSidebar />
          <BottomNav />
          <Toaster position="top-center" richColors />
          <Analytics />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
