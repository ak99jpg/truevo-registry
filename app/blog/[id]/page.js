import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export default async function BlogPost({ params }) {
  const { id } = params
  
  // Fetch blog post
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !blog) {
    notFound()
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
        <div className="text-gray-600 mb-6">
          {new Date(blog.created_at).toLocaleDateString()}
        </div>
        
        {/* Render content safely */}
        <div className="prose prose-lg max-w-none">
          {blog.content && (
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          )}
        </div>
      </article>
    </div>
  )
}
