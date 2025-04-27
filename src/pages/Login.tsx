import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import taskEvaderImage from '../../public/runningman.png'
import logo from '../../public/logo.png'
import { login } from '../services/auth' 

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const data = await login(username, password)
      // store token somewhere simple
      localStorage.setItem('authToken', data.token)

      // redirect to your protected route
      navigate('/home')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-col min-h-screen px-4">

      {/* logo area */}
      <div className="flex my-10 mx-10">
        <img 
          src={logo} 
          alt="Task Evader Interface" 
          className="max-h-[50px] object-contain"
        />
      </div>

      <div className="w-full flex flex-row justify-center gap-[10vw] mt-10">

        <div className="flex flex-col gap-2 mb-6 w-full max-w-2xl px-4 h-full">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">Don't pay for stress.</h1>
            <h1 className="text-3xl font-bold">Evade!</h1>
            <p className="text-sm text-gray-600 text-justify mt-2">
              Task Evader transforms your to-do list into a dynamic, multi-layered roadmap—nest unlimited subtasks within tasks, collapse branches to focus on what's important, and collaborate with teams—so you always see both the big picture and the tiniest action item at a glance.
            </p>
          </div>

          <div className="mt-10 w-full flex justify-end">
            <img 
              src={taskEvaderImage} 
              alt="Task Evader Interface" 
              className="max-h-[250px] object-contain"
            />
          </div>
        </div>

        <div className="w-full max-w-md p-6 rounded-lg border border-black flex flex-col justify-between">
          <h2 className="text-2xl mb-4 font-bold">Log In</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-2">
                {error}
              </div>
            )}
            
            <input
              type="username"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="p-2 border rounded bg-white text-black"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="p-2 border rounded bg-white text-black"
            />

            <div className="flex flex-row justify-end gap-1">
              <Link to="/signup" className="text-custom-red underline">
                Forgot your Password?
              </Link>
            </div>

            <button
              type="submit"
              className="p-2 bg-custom-red text-white rounded"
            >
              Log In
            </button>
          </form>

          <div className="flex flex-row items-center justify-center mt-10 gap-1">
            <span>Don't have an account?</span>
            <Link to="/signup" className="text-green-500 underline ml-1">
              Sign Up
            </Link>
          </div>
                    
        </div>
      </div>

      
    </div>
  )
}

export default LoginPage
