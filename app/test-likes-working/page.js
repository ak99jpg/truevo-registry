// app/test-likes-working/page.js
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestLikesWorkingPage() {
  const [blogs, setBlogs] = useState([])
  const [testResults, setTestResults] = useState([])
  const [userIp, setUserIp] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runAllTests()
  }, [])

  const getUserIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      setUserIp(data.ip)
      addTestResult('IP Detection', 'SUCCESS', `Your IP: ${data.ip}`)
      return data.ip
    } catch (error) {
      addTestResult('IP Detection', 'FAILED', error.message)
      return null
    }
  }

  const addTestResult = (testName, status, message) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      name: testName,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const runAllTests = async () => {
    setLoading(true)
    setTestResults([])
    
    // Test 1: Get User IP
    const ip = await getUserIp()
    
    // Test 2: Check blogs table
    try {
      const { data: blogsData, error } = await supabase
        .from('blogs')
        .select('id, title, likes, dislikes, views, is_published')
        .limit(3)

      if (error) throw error

      if (!blogsData || blogsData.length === 0) {
        addTestResult('Blogs Data', 'WARNING', 'No blogs found in database')
      } else {
        const publishedBlogs = blogsData.filter(b => b.is_published)
        setBlogs(publishedBlogs)
        addTestResult('Blogs Data', 'SUCCESS', 
          `Found ${blogsData.length} blogs (${publishedBlogs.length} published)`
        )
      }
    } catch (error) {
      addTestResult('Blogs Data', 'FAILED', error.message)
    }

    // Test 3: Check blog_reactions table
    try {
      const { data: reactions, error } = await supabase
        .from('blog_reactions')
        .select('count')

      if (error) throw error
      addTestResult('Reactions Table', 'SUCCESS', 
        `Found ${reactions?.[0]?.count || 0} total reactions`
      )
    } catch (error) {
      addTestResult('Reactions Table', 'FAILED', error.message)
    }

    // Test 4: Test like functionality
    if (ip && blogs.length > 0) {
      await testLikeFunctionality(ip, blogs[0].id)
    }

    setLoading(false)
  }

  const testLikeFunctionality = async (ip, blogId) => {
    try {
      // First, get current state
      const { data: blog } = await supabase
        .from('blogs')
        .select('likes, dislikes')
        .eq('id', blogId)
        .single()

      const originalLikes = blog?.likes || 0
      
      // Check if user already reacted
      const { data: existingReaction } = await supabase
        .from('blog_reactions')
        .select('reaction')
        .eq('blog_id', blogId)
        .eq('user_ip', ip)
        .single()

      if (existingReaction) {
        addTestResult('Existing Reaction Check', 'INFO', 
          `Already have reaction: ${existingReaction.reaction === 1 ? 'Like' : 'Dislike'}`
        )
      } else {
        addTestResult('Existing Reaction Check', 'INFO', 'No previous reaction found')
      }

      // Test adding a like
      const { error: likeError } = await supabase
        .from('blog_reactions')
        .insert({
          blog_id: blogId,
          user_ip: ip,
          reaction: 1
        })

      if (likeError && likeError.code === '23505') {
        // Unique violation - already reacted
        addTestResult('Add Like', 'INFO', 'Already reacted to this blog')
      } else if (likeError) {
        addTestResult('Add Like', 'FAILED', likeError.message)
      } else {
        addTestResult('Add Like', 'SUCCESS', 'Like added successfully')
        
        // Update blog likes count
        await supabase
          .from('blogs')
          .update({ likes: originalLikes + 1 })
          .eq('id', blogId)

        addTestResult('Update Likes Count', 'SUCCESS', 
          `Updated likes from ${originalLikes} to ${originalLikes + 1}`
        )
      }

    } catch (error) {
      addTestResult('Like Functionality Test', 'FAILED', error.message)
    }
  }

  const simulateLikeClick = async (blogId) => {
    if (!userIp) {
      alert('No IP address detected')
      return
    }

    try {
      // Get current reaction
      const { data: existingReaction } = await supabase
        .from('blog_reactions')
        .select('reaction')
        .eq('blog_id', blogId)
        .eq('user_ip', userIp)
        .single()

      const { data: blog } = await supabase
        .from('blogs')
        .select('likes, dislikes')
        .eq('id', blogId)
        .single()

      if (existingReaction?.reaction === 1) {
        // Remove like
        await supabase
          .from('blog_reactions')
          .delete()
          .eq('blog_id', blogId)
          .eq('user_ip', userIp)

        await supabase
          .from('blogs')
          .update({ likes: (blog?.likes || 0) - 1 })
          .eq('id', blogId)

        alert('Like removed!')
      } else {
        // Add like
        if (existingReaction?.reaction === -1) {
          // Remove dislike first
          await supabase
            .from('blog_reactions')
            .delete()
            .eq('blog_id', blogId)
            .eq('user_ip', userIp)

          await supabase
            .from('blogs')
            .update({ dislikes: (blog?.dislikes || 0) - 1 })
            .eq('id', blogId)
        }

        // Add like
        await supabase
          .from('blog_reactions')
          .insert({
            blog_id: blogId,
            user_ip: userIp,
            reaction: 1
          })

        await supabase
          .from('blogs')
          .update({ likes: (blog?.likes || 0) + 1 })
          .eq('id', blogId)

        alert('Like added!')
      }

      // Refresh data
      runAllTests()

    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const resetTestData = async () => {
    if (!userIp) return

    try {
      // Remove all reactions from this IP
      await supabase
        .from('blog_reactions')
        .delete()
        .eq('user_ip', userIp)

      // Reset counts for test blogs
      if (blogs.length > 0) {
        for (const blog of blogs) {
          await supabase
            .from('blogs')
            .update({ likes: 0, dislikes: 0 })
            .eq('id', blog.id)
        }
      }

      alert('Test data reset!')
      runAllTests()
    } catch (error) {
      alert('Error resetting: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Like/Dislike System Test</h1>
        
        <div className="mb-8">
          <div className="flex space-x-4 mb-4">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Run All Tests'}
            </button>
            <button
              onClick={resetTestData}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Reset Test Data
            </button>
          </div>
          
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Your IP Address:</h2>
            <code className="bg-gray-100 p-2 rounded">{userIp || 'Detecting...'}</code>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Results */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Test Results</h2>
            <div className="space-y-3">
              {testResults.map((test) => (
                <div 
                  key={test.id} 
                  className={`p-4 rounded-lg border ${
                    test.status === 'SUCCESS' ? 'bg-green-50 border-green-200' :
                    test.status === 'FAILED' ? 'bg-red-50 border-red-200' :
                    test.status === 'WARNING' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`font-semibold ${
                        test.status === 'SUCCESS' ? 'text-green-700' :
                        test.status === 'FAILED' ? 'text-red-700' :
                        test.status === 'WARNING' ? 'text-yellow-700' :
                        'text-blue-700'
                      }`}>
                        {test.name}
                      </span>
                      <div className="text-sm text-gray-600 mt-1">{test.message}</div>
                    </div>
                    <span className="text-xs text-gray-500">{test.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blog List */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Available Blogs</h2>
            {blogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No published blogs found
              </div>
            ) : (
              <div className="space-y-4">
                {blogs.map((blog) => (
                  <div key={blog.id} className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="font-bold text-lg mb-2">{blog.title || 'Untitled Blog'}</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{blog.likes || 0}</div>
                        <div className="text-sm text-gray-500">Likes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{blog.dislikes || 0}</div>
                        <div className="text-sm text-gray-500">Dislikes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{blog.views || 0}</div>
                        <div className="text-sm text-gray-500">Views</div>
                      </div>
                    </div>
                    <button
                      onClick={() => simulateLikeClick(blog.id)}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                    >
                      Test Like Click
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Troubleshooting Guide */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow border">
          <h2 className="text-2xl font-bold mb-4">Troubleshooting Guide</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Common Issues:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>No blogs showing?</strong> Make sure blogs have <code>is_published = true</code> in Supabase</li>
                <li><strong>IP detection failing?</strong> Check your internet connection or firewall settings</li>
                <li><strong>Like count not updating?</strong> Check browser console (F12) for errors</li>
                <li><strong>Getting unique constraint errors?</strong> You've already reacted to that blog</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Manual SQL Tests:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`-- Check blogs with counts
SELECT id, title, likes, dislikes, views 
FROM blogs 
WHERE is_published = true;

-- Check your reactions
SELECT * FROM blog_reactions 
WHERE user_ip = '${userIp || 'YOUR_IP'}';

-- Manually add a like (replace blog_id)
INSERT INTO blog_reactions (blog_id, user_ip, reaction)
VALUES ('blog_id_here', '${userIp || 'YOUR_IP'}', 1);`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}