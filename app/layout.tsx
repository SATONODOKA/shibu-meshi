import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '渋メシ | 気分でみつける、あなたのお店',
  description: '今の気分を教えるだけで、あなたにぴったりの飲食店をAIが推薦します。検索ではなく、対話から始まる新しいグルメ体験。',
  keywords: ['グルメ', 'レストラン', '気分', 'AI', '推薦', '渋メシ'],
  authors: [{ name: '渋メシチーム' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#f06c0a',
  openGraph: {
    title: '渋メシ | 気分でみつける、あなたのお店',
    description: '今の気分を教えるだけで、あなたにぴったりの飲食店をAIが推薦します。',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: '渋メシ | 気分でみつける、あなたのお店',
    description: '今の気分を教えるだけで、あなたにぴったりの飲食店をAIが推薦します。',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="font-japanese antialiased min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="min-h-screen flex flex-col">
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">渋</span>
                  </div>
                  <h1 className="text-xl font-bold text-gray-800">渋メシ</h1>
                </div>
                <div className="text-sm text-gray-600">
                  気分でみつける、あなたのお店
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className="bg-gray-800 text-white py-8 mt-auto">
            <div className="container mx-auto px-4 text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm">渋</span>
                </div>
                <span className="font-semibold">渋メシ</span>
              </div>
              <p className="text-gray-400 text-sm mb-2">
                気分でみつける、あなたのお店
              </p>
              <p className="text-gray-500 text-xs">
                © 2024 渋メシ. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
} 