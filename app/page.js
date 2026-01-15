// app/page.js
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Truevo Registry
        </h1>
        <p className="text-gray-600 mb-8">
          Site is live on Cloudflare Pages!
        </p>
        <div className="space-x-4">
          <a 
            href="/blog" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Visit Blog
          </a>
          <a 
            href="/login" 
            className="inline-block px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  )
}
