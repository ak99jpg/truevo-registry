// app/blog/[id]/page.js
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

export async function generateStaticParams() {
  // Fetch all blog IDs for static generation
  const { data: blogs } = await supabase
    .from('blogs')
    .select('id')
    .eq('is_published', true)
  
  return blogs?.map(blog => ({ id: blog.id.toString() })) || []
}

export default async function BlogPostPage({ params }) {
  const { id } = params
  
  // Fetch blog data on server
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (error || !blog) {
    notFound()
  }

  // Increment view count
  await supabase
    .from('blogs')
    .update({ views: (blog.views || 0) + 1 })
    .eq('id', id)

  // Format date
  const formattedDate = new Date(blog.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors">
            TrueVo Registry
          </Link>
          <Link 
            href="/blog" 
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog
          </Link>
        </div>
      </nav>

      {/* Main Article */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <header className="mb-12">
          <div className="mb-6">
            <Link 
              href="/blog" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              All Articles
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {blog.title}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {blog.excerpt || blog.description}
            </p>
          </div>

          {/* Author & Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-800 rounded-full font-semibold">
                {blog.author?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {blog.author || 'Anonymous'}
                </p>
                <p className="text-gray-500">
                  {blog.author_title || 'Contributor'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <time dateTime={blog.created_at}>{formattedDate}</time>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{blog.views || 0} views</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{blog.likes || 0} likes</span>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {blog.featured_image && (
          <div className="relative w-full h-64 md:h-96 mb-12 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={blog.featured_image}
              alt={blog.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
          </div>
        )}

        {/* Blog Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div 
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: blog.content || '' }}
          />
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mb-12 p-6 bg-gray-100 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-white text-blue-700 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Like ({blog.likes || 0})
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
          
          <Link 
            href="/blog" 
            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            Back to all posts
          </Link>
        </div>

        {/* Related Posts (Optional) */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Read Next</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Getting Started with Next.js 14</h4>
              <p className="text-gray-600 mb-4">Learn how to build modern web applications with the latest features of Next.js 14.</p>
              <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                Read Article →
              </Link>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Supabase Authentication Guide</h4>
              <p className="text-gray-600 mb-4">Implement secure user authentication in your Next.js applications using Supabase.</p>
              <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                Read Article →
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} TrueVo Registry. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Built with Next.js & Supabase
          </p>
        </div>
      </footer>
    </div>
  )
}
