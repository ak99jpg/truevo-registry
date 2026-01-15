// app/debug/page.js
export default function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
      <div className="space-y-4">
        <div>
          <strong>Node Environment:</strong> {process.env.NODE_ENV}
        </div>
        <div>
          <strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}
        </div>
        <div>
          <strong>Supabase Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'}
        </div>
        <div>
          <strong>Build Time:</strong> {new Date().toISOString()}
        </div>
      </div>
    </div>
  )
}
