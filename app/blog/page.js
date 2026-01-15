// app/blog/page.js
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function BlogPage() {
  // Fetch all blog posts
  const { data: posts, error } = await supabase
    .from('blog_posts') // Change to your actual table name
    .select('id, title, excerpt, created_at, slug')
    .order('created_at', { ascending: false })
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Blog</h1>
        <p className="text-red-600">Error loading blog posts: {error.message}</p>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog Posts</h1>
      
      {posts.length === 0 ? (
        <p className="text-gray-600">No blog posts yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article 
              key={post.id} 
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <Link href={`/blog/${post.id}`} className="block">
                <h2 className="text-2xl font-semibold mb-2 hover:text-blue-600">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
