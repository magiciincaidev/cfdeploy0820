import ErrorBoundary from '@/src/presentation/components/ErrorBoundary'
import React from 'react'
import './globals.css'

export const metadata = { title: '受架電支援AI — α版検証サイト' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: 'Inter, sans-serif' }}>
        <ErrorBoundary>
          <div className="wrapper">{children}</div>
        </ErrorBoundary>
      </body>
    </html>
  )
}
