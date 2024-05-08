import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

import { Lexend } from "next/font/google";
import Navbar from "@/components/Navbar";
import { Provider } from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";

const lexend = Lexend({ subsets: ["latin"] });

import localFont from 'next/font/local';

const inter = Inter({ subsets: ["latin"] });

const gilroy = localFont({src: '../../public/Gilroy-Regular.ttf'});

export const metadata: Metadata = {
  title: "AIcademiX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(gilroy.className, 'antialiased min-h-screen pt-16')}>
        <Provider>
          <Navbar />
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
