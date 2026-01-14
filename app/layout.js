// app/layout.js - SIMPLE VERSION (NO CONTEXT)
import './globals.css'

export const metadata = {
  title: 'TrueVo Registry',
  description: 'Submit and read stories',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}