// app/blog/[id]/page.js
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export default async function BlogPost({ params }) {
  const { id } = params
  
  // Fetch blog post by ID
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .eq('published', true) // if you have a published column
    .single()
  
  if (error || !blog) {
    notFound()
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
        
        {/* Blog metadata */}
        <div className="text-gray-600 mb-6">
          Published on {new Date(blog.created_at).toLocaleDateString()}
        </div>
        
        {/* Blog content */}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>
    </div>
  )
}

// Optional: Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { id } = params
  
  const { data: blog } = await supabase
    .from('blogs')
    .select('title, excerpt')
    .eq('id', id)
    .single()
  
  if (!blog) {
    return {
      title: 'Blog Post Not Found',
    }
  }
  
  return {
    title: blog.title,
    description: blog.excerpt || blog.title,
  }
}
