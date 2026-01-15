// app/blog/[id]/page.js - CLIENT COMPONENT VERSION
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

export default function BlogPostPage() {
  const { id } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id) {
      fetchBlogPost()
    }
  }, [id])

  const fetchBlogPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single()

      if (error) throw error
      
      if (!data) {
        setError('Blog post not found')
        return
      }

      setBlog(data)

      // Increment view count
      await supabase
        .from('blogs')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', id)

    } catch (err) {
      console.error('Error fetching blog:', err)
      setError('Failed to load blog post')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading blog post...</p>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Blog Not Found</h2>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/blog" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to All Blogs
          </Link>
        </div>
      </div>
    )
  }

  const formattedDate = new Date(blog.published_at || blog.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-800">
            TrueVo Registry
          </Link>
          <Link 
            href="/blog" 
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Blog
          </Link>
        </div>
      </nav>

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {blog.title}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {blog.excerpt}
          </p>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold">
                {blog.author_name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {blog.author_name || 'Anonymous'}
                </p>
                <p className="text-sm text-gray-500">{formattedDate}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <span>👁️</span>
                <span>{blog.views || 0} views</span>
              </div>
              <div className="flex items-center gap-2">
                <span>❤️</span>
                <span>{blog.likes || 0} likes</span>
              </div>
            </div>
          </div>
        </header>

        {blog.featured_image && (
          <div className="relative w-full h-64 md:h-96 mb-12 rounded-2xl overflow-hidden">
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: blog.content || '' }} />
        </div>

        {blog.tags && blog.tags.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-4">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <Link 
            href="/blog" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Back to all posts
          </Link>
        </div>
      </article>
    </div>
  )
}
