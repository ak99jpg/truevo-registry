// app/blog/[id]/page.js - SERVER COMPONENT VERSION
import { notFound, redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import BlogContent from '@/components/BlogContent' // Move client logic here

export async function generateStaticParams() {
  // Fetch all blog IDs for static generation
  const { data: blogs } = await supabase
    .from('blogs')
    .select('id')
    .eq('is_published', true)
  
  return blogs?.map(blog => ({ id: blog.id })) || []
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation and header (server-rendered) */}
      <nav className="bg-white shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">TrueVo Registry</Link>
          <Link href="/blog" className="text-blue-600 hover:text-blue-800 flex items-center">
            ← Back to Blog
          </Link>
        </div>
      </nav>

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">{blog.title}</h1>
          {/* ... rest of static content */}
        </header>

        {/* Client component for interactive parts */}
        <BlogContent blog={blog} />
        
        <div className="flex justify-center">
          <Link href="/blog" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            ← Back to all posts
          </Link>
        </div>
      </article>
    </div>
  )
}
