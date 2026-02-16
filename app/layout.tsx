import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";

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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://priyanshumahey.github.io",
    siteName: "Priyanshu Mahey",
    title: "Priyanshu Mahey - AI & Software Engineer",
    description: "Priyanshu Mahey's personal website — AI & Software Engineer sharing thoughts on engineering, projects, and system design.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Priyanshu Mahey - AI & Software Engineer",
    description: "Priyanshu Mahey's personal website — AI & Software Engineer sharing thoughts on engineering, projects, and system design.",
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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/ico" href="/favicon.ico" />
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
      </body>
    </html>
  );
}
