// app/blog/[id]/page.js - UPDATED WITH WORKING LIKE/DISLIKE
'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function BlogPostPage() {
  const { id } = useParams()
  const router = useRouter()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userReaction, setUserReaction] = useState(null)
  const [userIp, setUserIp] = useState(null)

  useEffect(() => {
    if (id) {
      fetchBlogPost()
      getUserIp()
    }
  }, [id])

  const getUserIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      setUserIp(data.ip)
      fetchUserReaction(data.ip)
    } catch (error) {
      console.error('Error getting IP:', error)
    }
  }

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
        router.push('/blog')
        return
      }
      
      setBlog(data)
      
      // Increment view count
      await supabase
        .from('blogs')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', id)
        
    } catch (error) {
      console.error('Error fetching blog post:', error)
      router.push('/blog')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserReaction = async (ip) => {
    if (!ip || !id) return
    
    try {
      const { data, error } = await supabase
        .from('blog_reactions')
        .select('reaction')
        .eq('blog_id', id)
        .eq('user_ip', ip)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setUserReaction(data?.reaction || null)
    } catch (error) {
      console.error('Error fetching user reaction:', error)
    }
  }

  const handleReaction = async (reaction) => {
    if (!userIp || !blog) {
      alert('Unable to record your vote. Please check your connection.')
      return
    }

    try {
      // Get current blog data
      const { data: currentBlog } = await supabase
        .from('blogs')
        .select('likes, dislikes')
        .eq('id', blog.id)
        .single()

      let newLikes = currentBlog?.likes || 0
      let newDislikes = currentBlog?.dislikes || 0

      // If clicking the same reaction again, remove it
      if (userReaction === reaction) {
        // Remove reaction
        await supabase
          .from('blog_reactions')
          .delete()
          .eq('blog_id', blog.id)
          .eq('user_ip', userIp)
        
        // Update counts (decrease)
        if (reaction === 1) {
          newLikes = Math.max(0, newLikes - 1)
        } else {
          newDislikes = Math.max(0, newDislikes - 1)
        }

        setUserReaction(null)
      } else {
        // If switching reaction
        if (userReaction) {
          // Update existing reaction
          await supabase
            .from('blog_reactions')
            .update({ reaction: reaction })
            .eq('blog_id', blog.id)
            .eq('user_ip', userIp)
          
          // Adjust counts: remove old, add new
          if (userReaction === 1) {
            newLikes = Math.max(0, newLikes - 1)
          } else {
            newDislikes = Math.max(0, newDislikes - 1)
          }
        } else {
          // Add new reaction
          await supabase
            .from('blog_reactions')
            .insert({
              blog_id: blog.id,
              user_ip: userIp,
              reaction: reaction
            })
        }

        // Add new reaction count
        if (reaction === 1) {
          newLikes = newLikes + 1
        } else {
          newDislikes = newDislikes + 1
        }

        setUserReaction(reaction)
      }

      // Update the blog with new counts
      await supabase
        .from('blogs')
        .update({ 
          likes: newLikes,
          dislikes: newDislikes 
        })
        .eq('id', blog.id)

      // Update local state
      setBlog(prev => ({
        ...prev,
        likes: newLikes,
        dislikes: newDislikes
      }))
      
    } catch (error) {
      console.error('Error updating reaction:', error)
      alert('Error recording your vote. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading blog post...</p>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Blog post not found</h2>
          <Link href="/blog" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to all posts
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">TrueVo Registry</Link>
          <Link href="/blog" className="text-blue-600 hover:text-blue-800 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog
          </Link>
        </div>
      </nav>

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">{blog.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-full">
              Blog Post
            </span>
            
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time>{new Date(blog.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</time>
            </div>
            
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{blog.views || 0} views</span>
            </div>

            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>By: {blog.author_name || 'Anonymous'}</span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <p className="text-xl text-gray-700 italic">{blog.excerpt}</p>
          </div>
        </header>

        <div className="prose prose-lg max-w-none mb-12">
          <div className="blog-content text-gray-800 leading-relaxed">
            {blog.content ? (
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            ) : (
              <div className="text-gray-500 text-center py-12">
                <p>No content available for this blog post.</p>
              </div>
            )}
          </div>
        </div>

        {/* Reaction buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Was this helpful?</h3>
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => handleReaction(1)}
              className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-200 ${
                userReaction === 1 
                  ? 'bg-blue-50 text-blue-600 border-2 border-blue-200' 
                  : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
              }`}
            >
              <svg className={`w-6 h-6 ${userReaction === 1 ? 'text-blue-600' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span className="font-medium">
                Like ({blog.likes || 0})
              </span>
            </button>
            
            <button 
              onClick={() => handleReaction(-1)}
              className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-200 ${
                userReaction === -1 
                  ? 'bg-red-50 text-red-600 border-2 border-red-200' 
                  : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
              }`}
            >
              <svg className={`w-6 h-6 ${userReaction === -1 ? 'text-red-600' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
              </svg>
              <span className="font-medium">
                Dislike ({blog.dislikes || 0})
              </span>
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Your reaction helps us improve our content. One vote per post.
          </p>
        </div>

        <div className="flex justify-center">
          <Link 
            href="/blog" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            Back to all posts
          </Link>
        </div>
      </article>

      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} TrueVo Registry. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}