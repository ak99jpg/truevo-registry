import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function BlogPage() {
  // Fetch all published blogs from your existing table
  const { data: blogs, error } = await supabase
    .from('blogs') // Your existing table name
    .select('id, title, excerpt, created_at, slug')
    .eq('published', true) // Assuming you have a published column
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching blogs:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Blog</h1>
        <p className="text-red-600">Error loading blogs. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog Posts</h1>
      
      {!blogs || blogs.length === 0 ? (
        <p className="text-gray-600">No blog posts yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <article 
              key={blog.id} 
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <Link href={`/blog/${blog.slug || blog.id}`} className="block">
                <h2 className="text-2xl font-semibold mb-2 hover:text-blue-600">
                  {blog.title}
                </h2>
                {blog.excerpt && (
                  <p className="text-gray-600 mb-4">{blog.excerpt}</p>
                )}
                <div className="text-sm text-gray-500">
                  {new Date(blog.created_at).toLocaleDateString()}
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}