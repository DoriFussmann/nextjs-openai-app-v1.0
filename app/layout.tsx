import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/lib/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prompt Hub - AI-Powered Business Tools',
  description: 'Your all-in-one business command center with AI-driven toolkit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-black`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
