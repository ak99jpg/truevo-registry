// app/page.js
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">✅ Site is Working!</h1>
        <p className="text-gray-600 mb-8">
          Environment: {process.env.NODE_ENV}
        </p>
        <a 
          href="/blog" 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Go to Blog
        </a>
      </div>
    </div>
  )
}
