// app/page.js (Home page)
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">TrueVo Registry</Link>
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Submit Story
            </Link>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 text-gray-900">Welcome to TrueVo Registry</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A comprehensive platform for insights, analysis, and resources.
        </p>
        <div className="flex justify-center space-x-4">
          <Link 
            href="/blog"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Read Stories
          </Link>
          <Link 
            href="/login"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Submit Story
          </Link>
        </div>
      </div>
    </div>
  )
}