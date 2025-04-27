import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/Login'
import SignupPage from './pages/Signup'

function App() {
  return (
    <div>

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </div>
  )
}

export default App
