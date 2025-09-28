import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/hooks/useAuth';
import { ApolloWrapper } from '@/lib/apollo-wrapper';
import { MockDataProvider } from '@/lib/mock-provider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ThreadSpace - Long-Form Discussion Platform",
  description: "A modern discussion platform for long-form conversations. Share ideas, engage in meaningful discussions, and connect with like-minded people.",
  keywords: ["discussion", "forum", "community", "threads", "conversation"],
  authors: [{ name: "ThreadSpace Team" }],
  creator: "ThreadSpace",
  publisher: "ThreadSpace",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: "ThreadSpace - Long-Form Discussion Platform",
    description: "A modern discussion platform for long-form conversations. Share ideas, engage in meaningful discussions, and connect with like-minded people.",
    siteName: "ThreadSpace",
  },
  twitter: {
    card: "summary_large_image",
    title: "ThreadSpace - Long-Form Discussion Platform",
    description: "A modern discussion platform for long-form conversations. Share ideas, engage in meaningful discussions, and connect with like-minded people.",
    creator: "@threadspace",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-gray-50 dark:bg-gray-900`}
      >
        <ApolloWrapper>
          <MockDataProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </MockDataProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}