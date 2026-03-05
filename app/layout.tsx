import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LearnMate — Learn. Battle. Win.',
  description: "India's AI-powered gamified learning platform. Real-time multiplayer battles, AI tutoring, courses, and roadmaps for every learner.",
  keywords: ['learning', 'AI', 'education', 'quiz', 'coding', 'India', 'students'],
  authors: [{ name: 'LearnMate' }],
  openGraph: {
    title: 'LearnMate',
    description: 'Learn smarter. Battle harder. Win together.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#07090F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
