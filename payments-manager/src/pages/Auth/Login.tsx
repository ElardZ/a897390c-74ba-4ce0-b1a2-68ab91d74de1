import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Sign in</h2>
        {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input 
              type="email" 
              required 
              className="mt-1 block w-full rounded-md border text-black border-slate-700 p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input 
              type="password" 
              required 
              className="mt-1 block w-full rounded-md border text-black border-slate-700 p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Loading...' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:text-blue-500">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
