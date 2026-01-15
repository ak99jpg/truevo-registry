// app/blog/[id]/page.js
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

// This function runs on the server for each request
export default async function BlogPost({ params }) {
  const { id } = params
  
  // Fetch blog post from Supabase
  const { data: post, error } = await supabase
    .from('blog_posts') // Change to your actual table name
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !post) {
    notFound()
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="text-gray-600 mb-6">
          Published on {new Date(post.created_at).toLocaleDateString()}
        </div>
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  )
}

// Optional: Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { id } = params
  
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt')
    .eq('id', id)
    .single()
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }
  
  return {
    title: post.title,
    description: post.excerpt || post.title,
  }
}
