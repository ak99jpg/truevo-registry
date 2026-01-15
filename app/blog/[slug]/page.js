import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export default async function BlogPost({ params }) {
  const { slug } = params
  
  // Fetch specific blog post by slug or ID
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .or(`slug.eq.${slug},id.eq.${slug}`) // Try slug first, then ID
    .eq('published', true)
    .single()
  
  if (error || !blog) {
    notFound()
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
        
        {/* Blog metadata */}
        <div className="flex items-center gap-4 text-gray-600 mb-6">
          <span>
            Published on {new Date(blog.created_at).toLocaleDateString()}
          </span>
          {blog.updated_at && (
            <span className="text-sm">
              (Updated: {new Date(blog.updated_at).toLocaleDateString()})
            </span>
          )}
        </div>
        
        {/* Blog content */}
        {blog.content && (
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        )}
      </article>
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = params
  
  const { data: blog } = await supabase
    .from('blogs')
    .select('title, excerpt, meta_description')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .single()
  
  if (!blog) {
    return {
      title: 'Blog Post Not Found',
    }
  }
  
  return {
    title: blog.title,
    description: blog.meta_description || blog.excerpt || blog.title,
  }
}