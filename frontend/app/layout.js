import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Invoice AI | Intelligent Document Processing',
  description: 'AI-powered invoice extraction with OCR and machine learning',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📄</text></svg>" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30`}>
        {/* Decorative background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300/20 rounded-full mix-blend-multiply blur-3xl"></div>
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-300/20 rounded-full mix-blend-multiply blur-3xl"></div>
          <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-sky-300/20 rounded-full mix-blend-multiply blur-3xl"></div>
        </div>

        {/* Centering wrapper: ensures app content is centered on wide viewports */}
        <div className="app-root w-full flex justify-center">
          <div className="min-h-screen flex flex-col">
          {/* Modern Header */}
          <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur opacity-30"></div>
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="mt-auto border-t border-gray-200/50 bg-white/50 py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                  <div className="h-5 w-5 rounded-md bg-gradient-to-br from-blue-500 to-purple-600"></div>
                  <span className="font-semibold text-gray-800">Invoice AI</span>
                  <span className="text-xs text-gray-500">• AI-powered document processing</span>
                </div>
                <div className="text-sm text-gray-500">
                  © {new Date().getFullYear()} Invoice AI. All rights reserved.
                </div>
              </div>
            </div>
          </footer>
          </div>
        </div>
      </body>
    </html>
  )
}