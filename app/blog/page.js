// app/blog/page.js
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function BlogPage() {
  const { data: blogs } = await supabase
    .from('blogs')
    .select('id, title, excerpt, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog Posts</h1>
      
      <div className="grid gap-6">
        {blogs.map((blog) => (
          <article key={blog.id} className="border rounded-lg p-6">
            <Link href={`/blog/${blog.id}`} className="block">
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
    </div>
  )
}
