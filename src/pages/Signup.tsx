import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import taskEvaderImage from '../../public/runningman.png'
import logo from '../../public/logo.png'

const SignupPage: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [first_name, setFirstName] = useState('')
  const [last_name, setLastName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // call your backend login endpoint
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
          <h2 className="text-2xl mb-4 font-bold">Sign Up</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="username"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="p-2 border rounded bg-white text-black"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="p-2 border rounded bg-white text-black"
            />
            <input
              type="first_name"
              placeholder="First Name"
              value={first_name}
              onChange={e => setFirstName(e.target.value)}
              required
              className="p-2 border rounded bg-white text-black"
            />
            <input
              type="last_name"
              placeholder="Last Name"
              value={last_name}
              onChange={e => setLastName(e.target.value)}
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

            <button
              type="submit"
              className="p-2 mt-5 text-xl bg-custom-red text-white rounded"
            >
              Sign up
            </button>
          </form>

          <div className="flex flex-row items-center justify-center mt-10 gap-1">
            <span>Already signed up?</span>
            <Link to="/login" className="text-green-500 underline ml-1">
              Log In
            </Link>
          </div>
                    
        </div>
      </div>

      
    </div>
  )
}

export default SignupPage
