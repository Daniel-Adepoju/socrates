import type { Metadata } from "next"
import { IBM_Plex_Serif, Mona_Sans } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/sonner"
// import {ui} from "@clerk/ui"
// ========CUSTOM Imports========
import "./globals.css"
import Navbar from "@/components/Navbar"

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  variable: "--font-ibm-plex-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const monaSans = Mona_Sans({
  subsets: ["latin"],
  variable: "--font-mona-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Socrates",
  description: "Make your book interactive with AI",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${ibmPlexSerif.variable} ${monaSans.variable} relative font-sans h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <Navbar />
        
          {children} 
           <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
