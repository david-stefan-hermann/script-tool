import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from 'next/font/local'
import "./globals.css";

const delaGothicOne = localFont({
  src: [
    {
      path: '../../public/fonts/DelaGothicOne-Regular.ttf',
      weight: '400'
    }
  ],
  variable: '--font-dela-gothic-one'
})

const bangers = localFont({
  src: [
    {
      path: '../../public/fonts/Bangers-Regular.ttf',
      weight: '400'
    }
  ],
  variable: '--font-bangers'
})

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${bangers.variable} ${delaGothicOne.variable}`}>
        {children}
      </body>
    </html>
  );
}
