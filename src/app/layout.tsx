import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { ClerkProvider } from '@clerk/nextjs' 


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VisaNavigator - Canadian Student Visa Assistant',
  description: 'Your comprehensive guide to Canadian student visa applications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider>
          <Providers>
            {children}
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  )
} 