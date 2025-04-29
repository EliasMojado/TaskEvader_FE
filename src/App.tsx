import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/Login'
import SignupPage from './pages/Signup'
import Home from './pages/Home'
import Profile from './pages/Profile'
import ChangePassword from './pages/ChangePassword'
import Main from './pages/Main'
import ProjectPage from './pages/ProjectPage'

function App() {
  return (
    <div className='h-screen w-screen'>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<Home/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/change-password" element={<ChangePassword/>} />
        <Route path="/main/:id" element ={<Main/>} />
        <Route path="/project" element={<ProjectPage />} />
      </Routes>
    </div>
  )
}

export default App
