import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import Script from "next/script";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});


export const metadata: Metadata = {
  metadataBase: new URL("https://priyanshumahey.github.io"),
  title: {
    default: "Priyanshu Mahey - AI & Software Engineer",
    template: "%s | Priyanshu Mahey",
  },
  description: "Priyanshu Mahey's personal website — AI & Software Engineer sharing thoughts on engineering, projects, and system design.",
  keywords: [
    "Priyanshu Mahey",
    "Priyanshu",
    "Mahey",
    "AI Engineer",
    "Software Engineer",
    "Machine Learning",
    "System Design",
    "Blog",
    "Microsoft",
  ],
  authors: [{ name: "Priyanshu Mahey", url: "https://priyanshumahey.github.io" }],
  creator: "Priyanshu Mahey",
  publisher: "Priyanshu Mahey",
  alternates: {
    canonical: "https://priyanshumahey.github.io",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://priyanshumahey.github.io",
    siteName: "Priyanshu Mahey",
    title: "Priyanshu Mahey - AI & Software Engineer",
    description: "Priyanshu Mahey's personal website — AI & Software Engineer sharing thoughts on engineering, projects, and system design.",
    images: [
      {
        url: "/hero2.png",
        width: 1200,
        height: 630,
        alt: "Priyanshu Mahey",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Priyanshu Mahey - AI & Software Engineer",
    description: "Priyanshu Mahey's personal website — AI & Software Engineer sharing thoughts on engineering, projects, and system design.",
    creator: "@PriyanshuMahey",
    images: ["/hero2.png"],
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
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Priyanshu Mahey",
    alternateName: ["Priyanshu", "Priyanshu M."],
    url: "https://priyanshumahey.github.io",
    image: "https://priyanshumahey.github.io/hero2.png",
    jobTitle: "AI & Software Engineer",
    worksFor: {
      "@type": "Organization",
      name: "Microsoft",
    },
    sameAs: [
      "https://www.linkedin.com/in/priyanshu-mahey/",
      "https://github.com/priyanshumahey",
      "https://x.com/PriyanshuMahey",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Priyanshu Mahey",
    url: "https://priyanshumahey.github.io",
    author: {
      "@type": "Person",
      name: "Priyanshu Mahey",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/ico" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          fontSans.className
        )}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Script
          defer
          src="https://fabrical.priyanshu-mahey02.workers.dev/js/script.js"
          data-site="fkbmdyik8gt0dmj9"
        />
      </body>
    </html>
  );
}
