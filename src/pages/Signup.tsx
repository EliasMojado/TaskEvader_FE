import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // call your backend signup endpoint
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 shadow-lg rounded">
      <nav className="p-4 flex gap-4">
        <Link to="/login" className="text-blue-500">Log In</Link>
      </nav>

      <h2 className="text-2xl mb-4">Sign Up</h2>
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
        <button type="submit" className="p-2 bg-green-600 text-white rounded">
          Create Account
        </button>
      </form>
    </div>
  )
}

export default SignupPage
