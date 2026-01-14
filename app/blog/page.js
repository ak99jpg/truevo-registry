// app/blog/page.js - UPDATED WITH WORKING LIKE/DISLIKE
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function BlogPage() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [userReactions, setUserReactions] = useState({})
  const [userIp, setUserIp] = useState(null)

  useEffect(() => {
    fetchBlogs()
    getUserIp()
  }, [])

  const getUserIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      setUserIp(data.ip)
      fetchUserReactions(data.ip)
    } catch (error) {
      console.error('Error getting IP:', error)
    }
  }

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })

      if (error) throw error
      setBlogs(data || [])
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserReactions = async (ip) => {
    if (!ip) return
    
    try {
      const { data, error } = await supabase
        .from('blog_reactions')
        .select('blog_id, reaction')
        .eq('user_ip', ip)

      if (error) throw error
      
      const reactions = {}
      data?.forEach(item => {
        reactions[item.blog_id] = item.reaction
      })
      setUserReactions(reactions)
    } catch (error) {
      console.error('Error fetching user reactions:', error)
    }
  }

  const handleReaction = async (blogId, reaction) => {
    if (!userIp) {
      alert('Unable to track your vote. Please check your connection.')
      return
    }

    try {
      const existingReaction = userReactions[blogId]
      
      // Get current blog data
      const { data: currentBlog } = await supabase
        .from('blogs')
        .select('likes, dislikes')
        .eq('id', blogId)
        .single()

      let newLikes = currentBlog?.likes || 0
      let newDislikes = currentBlog?.dislikes || 0

      // If clicking the same reaction again, remove it
      if (existingReaction === reaction) {
        // Remove reaction from blog_reactions
        await supabase
          .from('blog_reactions')
          .delete()
          .eq('blog_id', blogId)
          .eq('user_ip', userIp)
        
        // Update counts (decrease)
        if (reaction === 1) {
          newLikes = Math.max(0, newLikes - 1)
        } else {
          newDislikes = Math.max(0, newDislikes - 1)
        }

        // Update local state
        setUserReactions(prev => {
          const newReactions = { ...prev }
          delete newReactions[blogId]
          return newReactions
        })

      } else {
        // If switching reaction
        if (existingReaction) {
          // Update existing reaction
          await supabase
            .from('blog_reactions')
            .update({ reaction: reaction })
            .eq('blog_id', blogId)
            .eq('user_ip', userIp)
          
          // Adjust counts: remove old, add new
          if (existingReaction === 1) {
            newLikes = Math.max(0, newLikes - 1)
          } else {
            newDislikes = Math.max(0, newDislikes - 1)
          }
        } else {
          // Add new reaction
          await supabase
            .from('blog_reactions')
            .insert({
              blog_id: blogId,
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

        // Update local state
        setUserReactions(prev => ({
          ...prev,
          [blogId]: reaction
        }))
      }

      // Update the blogs table with new counts
      await supabase
        .from('blogs')
        .update({ 
          likes: newLikes,
          dislikes: newDislikes 
        })
        .eq('id', blogId)

      // Update local blogs state
      setBlogs(prev => prev.map(blog => 
        blog.id === blogId 
          ? { ...blog, likes: newLikes, dislikes: newDislikes }
          : blog
      ))

    } catch (error) {
      console.error('Error updating reaction:', error)
      alert('Error recording your vote: ' + error.message)
    }
  }

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

      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Blog & Resources</h1>
          <p className="text-xl text-gray-600">
            Insights, analysis, and resources from TrueVo Registry
          </p>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading blog posts...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center text-gray-500">
            <p className="text-lg">No blog posts published yet.</p>
            <p className="mt-2">Check back soon for updates!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1 duration-300 flex flex-col h-full">
                <div className="p-6 flex-grow">
                  <div className="mb-4">
                    <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                      Blog Post
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-bold mb-3 text-gray-800">{blog.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        {blog.published_at ? new Date(blog.published_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'Not published'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        By: {blog.author_name || 'Anonymous'}
                      </p>
                    </div>
                    <Link 
                      href={`/blog/${blog.id}`} 
                      className="text-blue-600 font-semibold hover:text-blue-800 flex items-center"
                    >
                      Read Full 
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
                
                {/* Like/Dislike Section */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => handleReaction(blog.id, 1)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                          userReactions[blog.id] === 1 
                            ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title="Like this post"
                      >
                        <svg className={`w-5 h-5 ${userReactions[blog.id] === 1 ? 'text-blue-600' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span className="font-medium">{blog.likes || 0}</span>
                      </button>
                      
                      <button 
                        onClick={() => handleReaction(blog.id, -1)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                          userReactions[blog.id] === -1 
                            ? 'bg-red-50 text-red-600 border border-red-200' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title="Dislike this post"
                      >
                        <svg className={`w-5 h-5 ${userReactions[blog.id] === -1 ? 'text-red-600' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                        </svg>
                        <span className="font-medium">{blog.dislikes || 0}</span>
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {blog.views || 0} views
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}