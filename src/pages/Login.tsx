import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // call your backend login endpoint
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 shadow-lg rounded">
      <nav className="p-4 flex gap-4">
        <Link to="/signup" className="text-green-500">Sign Up</Link>
      </nav>

      <h2 className="text-2xl mb-4">Log In</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="p-2 border rounded"
        />
        <button type="submit" className="p-2 bg-blue-600 text-white rounded">
          Log In
        </button>
      </form>
    </div>
  )
}

export default LoginPage
