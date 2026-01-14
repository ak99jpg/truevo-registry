// app/submit-story/page.js - COMPLETE WORKING VERSION
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SubmitStoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    country: '',
    year_of_incident: new Date().getFullYear(),
    is_anonymous: false
  })

  // Check if user is logged in via Supabase Auth
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // 🔐 Check Supabase Auth session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // Get user profile from your users table
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (userProfile) {
        setUser({
          id: userProfile.id,
          email: userProfile.email,
          name: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || userProfile.email.split('@')[0],
          first_name: userProfile.first_name,
          last_name: userProfile.last_name,
          country: userProfile.country
        })
      } else {
        // If no profile exists, create one
        const { data: newProfile } = await supabase
          .from('users')
          .insert([{
            id: session.user.id,
            email: session.user.email,
            first_name: session.user.user_metadata?.first_name || '',
            last_name: session.user.user_metadata?.last_name || '',
            country: session.user.user_metadata?.country || 'Unknown',
            user_type: 'author',
            created_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (newProfile) {
          setUser({
            id: newProfile.id,
            email: newProfile.email,
            name: `${newProfile.first_name || ''} ${newProfile.last_name || ''}`.trim() || newProfile.email.split('@')[0],
            first_name: newProfile.first_name,
            last_name: newProfile.last_name,
            country: newProfile.country
          })
        }
      }

    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Please enter a title')
      }
      if (!formData.content.trim()) {
        throw new Error('Please enter your story content')
      }

      // Insert into stories table
      const storyData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        country: formData.country,
        year_of_incident: formData.year_of_incident,
        is_anonymous: formData.is_anonymous,
        user_id: user?.id,
        status: 'pending', // pending, approved, rejected
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('stories')
        .insert([storyData])
        .select()
        .single()

      if (error) throw error

      setSuccess('✅ Story submitted successfully! It will be reviewed by admin before publishing.')
      setFormData({
        title: '',
        content: '',
        category: 'general',
        country: '',
        year_of_incident: new Date().getFullYear(),
        is_anonymous: false
      })

    } catch (error) {
      alert('❌ Error submitting story: ' + error.message)
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('user')
    router.push('/login')
  }

  // Generate years for dropdown (last 50 years)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">TrueVo Registry</Link>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user.name || user.email.split('@')[0]}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Submit Your Story</h1>
            <p className="text-gray-600">
              Share your story with the TrueVo Registry community.
              Your submission will be reviewed before publication.
            </p>
            <div className="mt-2 text-sm text-gray-500">
              Logged in as: <strong>{user.email}</strong>
            </div>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your story title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="general">General</option>
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="health">Health & Wellness</option>
                  <option value="education">Education</option>
                  <option value="personal">Personal Experience</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country (Optional)
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Country where story occurred"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year of Incident/Event
              </label>
              <select
                name="year_of_incident"
                value={formData.year_of_incident}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_anonymous"
                name="is_anonymous"
                checked={formData.is_anonymous}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="is_anonymous" className="ml-2 text-sm text-gray-700">
                Submit anonymously (your name will not be displayed)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Story *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows="12"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell your story here... Be as detailed as you feel comfortable."
              />
              <p className="text-sm text-gray-500 mt-1">
                Share your experience, insights, or analysis. All stories are reviewed for appropriateness.
              </p>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Link 
                href="/blog"
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Back to Blog
              </Link>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData({
                    title: '',
                    content: '',
                    category: 'general',
                    country: '',
                    year_of_incident: new Date().getFullYear(),
                    is_anonymous: false
                  })}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : 'Submit Story'}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Important Notes:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• All stories are reviewed by moderators before approval</li>
              <li>• Choose "Submit anonymously" if you don't want your name displayed</li>
              <li>• Please be respectful and truthful in your submissions</li>
              <li>• You can track the status of your submission in your profile</li>
              <li>• Submitted stories go to: <code className="bg-blue-100 px-1">stories</code> table in Supabase</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}