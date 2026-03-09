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
    default: "RedHope - Hệ thống Hiến máu Tình nguyện",
    template: "%s | RedHope"
  },
  description: "Nền tảng kết nối cộng đồng hiến máu tình nguyện. Đăng ký hiến máu, theo dõi chiến dịch và nhận thông báo mới nhất.",
  keywords: ["hiến máu", "tình nguyện", "redhope", "bệnh viện", "cứu người", "huyết học", "donate blood"],
  authors: [{ name: "RedHope Team" }],
  creator: "RedHope",
  openGraph: {
    title: "RedHope - Hệ thống Hiến máu Tình nguyện",
    description: "Kết nối mạng lưới người hiến máu và bệnh viện trong thời gian thực, vì một cộng đồng khỏe mạnh hơn.",
    url: 'https://redhope.io.vn',
    siteName: 'RedHope',
    images: [
      {
        url: '/homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'RedHope - Mạng lưới Hiến máu',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "RedHope - Hệ thống Hiến máu Tình nguyện",
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

import { AuthProvider } from "@/context/AuthContext";
import { MobileSidebar } from "@/components/shared/MobileSidebar";
import { BottomNav } from "@/components/shared/BottomNav";

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
        </AuthProvider>
      </body>
    </html>
  );
}
