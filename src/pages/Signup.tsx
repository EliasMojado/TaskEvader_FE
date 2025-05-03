// src/pages/SignupPage.tsx

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../services/auth'
import taskEvaderImage from '../../public/runningman.png'
import logo from '../../public/logo.png'

const SignupPage: React.FC = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const data = await signup(
        username,
        email,
        firstName,
        lastName,
        password
      )

        // store token somewhere simple
      localStorage.setItem('authToken', data.access)

      navigate('/home')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-col min-h-screen px-4">
      {/* logo */}
      <div className="flex my-10 mx-10">
        <img src={logo} alt="Task Evader Logo" className="max-h-[50px]" />
      </div>

      <div className="w-full flex flex-row justify-center my-10">
        {/* left promo */}
        <div className="flex flex-col gap-2 w-full max-w-2xl px-4">
          <h1 className="text-3xl font-bold">Don't pay for stress.</h1>
          <h1 className="text-3xl font-bold">Evade!</h1>
          <p className="text-sm text-gray-600 mt-2 w-[75%]">
            Task Evader transforms your to-do list into a dynamic, multi-layered
            roadmap—nest unlimited subtasks, collapse branches, and collaborate
            seamlessly.
          </p>
          <div className="mt-10 w-full flex justify-end">
            <img
              src={taskEvaderImage}
              alt="Task Evader UI"
              className="max-h-[250px]"
            />
          </div>
        </div>

        {/* form */}
        <div className="w-full max-w-md p-6 rounded-lg border flex flex-col">
          <h2 className="text-2xl mb-4 font-bold text-center">Sign Up</h2>

          {error && (
            <div className="mb-4 text-red-600 text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="p-2 border rounded bg-white"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="p-2 border rounded bg-white"
            />
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
              className="p-2 border rounded bg-white"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
              className="p-2 border rounded bg-white"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="p-2 border rounded bg-white"
            />

            <button
              type="submit"
              className="p-2 mt-5 text-xl bg-custom-red text-white rounded"
            >
              Sign up
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-green-500 underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
