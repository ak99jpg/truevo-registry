// app/test-auth/page.js - SIMPLE TEST
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestAuthPage() {
  const [result, setResult] = useState('')
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password123')

  const testSignUp = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      })

      if (error) {
        setResult(`❌ Sign Up Error: ${error.message}`)
      } else {
        setResult(`✅ Sign Up Success! Check email: ${data.user?.email}`)
      }
    } catch (error) {
      setResult(`❌ Exception: ${error.message}`)
    }
  }

  const testSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        setResult(`❌ Sign In Error: ${error.message}`)
      } else {
        setResult(`✅ Sign In Success! User: ${data.user.email}`)
        console.log('Session:', data.session)
      }
    } catch (error) {
      setResult(`❌ Exception: ${error.message}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
      
      <div className="mb-4 space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Password"
        />
      </div>

      <div className="space-x-4 mb-4">
        <button onClick={testSignUp} className="bg-green-600 text-white px-4 py-2 rounded">
          Test Sign Up
        </button>
        <button onClick={testSignIn} className="bg-blue-600 text-white px-4 py-2 rounded">
          Test Sign In
        </button>
      </div>

      <div className="p-4 bg-gray-100 rounded">
        <pre>{result || 'Click a button to test...'}</pre>
      </div>
    </div>
  )
}