import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import LoggingIn from '../components/LoggingIn';

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login') // 'login' hoặc 'signup'

  const handleLogin = async () => {
    setLoading(true)
    setMode('login')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    await new Promise(resolve => setTimeout(resolve, 3000))

    if (error) setError(error.message)
    setLoading(false)
  }

  const handleSignup = async () => {
    setLoading(true)
    setMode('signup')
    const { error } = await supabase.auth.signUp({ email, password })
    await new Promise(resolve => setTimeout(resolve, 3000))
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {loading ? (
        <LoggingIn message={mode === 'login' ? 'Đang đăng nhập' : 'Đang đăng ký'} />
      ) : (
        <div className="bg-white p-6 rounded shadow max-w-sm w-full">
          <h2 className="text-xl font-bold mb-4 text-center">Đăng nhập / Đăng ký</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border p-2 rounded w-full mb-3"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border p-2 rounded w-full mb-3"
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Đăng nhập
            </button>
            <button
              onClick={handleSignup}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 w-full"
            >
              Đăng ký
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
