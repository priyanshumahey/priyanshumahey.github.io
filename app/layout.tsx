import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import Head from "next/head";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Priyanshu Mahey",
  description: "Priyanshu Mahey's personal website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <title>Priyanshu Mahey Portfolio</title>
        <meta
          name="description"
          content="Priyanshu Mahey's personal website"
         />
        <meta charSet="UTF-8" />
        <meta name="author" content="Priyanshu Mahey" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <link rel="icon" type="image/ico" href="/favicon.ico" />
      </Head>
      <body
        className={cn(
          "min-h-screen bg-[#ededed] font-sans antialiased",
          fontSans.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
