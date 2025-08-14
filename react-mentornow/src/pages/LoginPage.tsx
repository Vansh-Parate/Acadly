import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { IoMdArrowBack } from "react-icons/io"
import { CiMail } from "react-icons/ci"
import { MdLockOutline } from "react-icons/md"
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useAuth } from "../contexts/AuthContext"
import { API_BASE } from "@/lib/api"

function getRoleBasedRedirect(role: string) {
  switch (role) {
    case "STUDENT":
      return "/dashboard"
    case "MENTOR":
      return "/mentor-dashboard"
    case "ADMIN":
      return "/admin"
    default:
      return "/dashboard"
  }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields")
      return
    }

    await performLogin(formData.email, formData.password)
  }

  const performLogin = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      login(data.token, data.user)
      toast.success("Login successful!")
      
      const redirectPath = getRoleBasedRedirect(data.user.role)
      navigate(redirectPath, { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="w-full max-w-md bg-[#252525]/80 rounded-2xl shadow-xl p-8 backdrop-blur-sm">
          <Link to="/" className="text-md text-gray-400 hover:text-white mb-5 flex justify-center items-center gap-1 cursor-pointer">
            <IoMdArrowBack className="text-md" />
            Back to home
          </Link>
          
          <h2 className="text-2xl font-bold mb-2 flex justify-center items-center text-white">Sign in</h2>
          <p className="text-sm text-gray-400 mb-6 flex justify-center items-center">Welcome back to Acadly!</p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="flex text-sm mb-1 text-white">Email Address</label>
              <div className="relative">
                <CiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  className="w-full px-3 py-2 pl-10 placeholder-gray-400 bg-[#292929] rounded-md placeholder:text-sm text-white border-none focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="your.email@example.com"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="flex text-sm mb-1 text-white">Password</label>
              <div className="relative">
                <MdLockOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  className="w-full px-3 py-2 pl-10 placeholder-gray-400 bg-[#292929] rounded-md placeholder:text-sm text-white border-none focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <FaRegEyeSlash className="text-lg" /> : <FaRegEye className="text-lg" />}
                </button>
              </div>
            </div>

            <button 
              className="bg-blue-500 hover:bg-blue-600 hover:scale-105 hover:shadow-2xl transition duration-200 text-white rounded-md py-3 font-semibold w-full mt-2" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-8">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-blue-400 hover:underline font-medium">
              Sign up
            </Link>
          </p>

          {/* Minimal Test User Section */}
          <div className="mt-6 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 text-center mb-2">Try demo accounts</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => performLogin('alice@example.com', 'seeded')}
                className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 cursor-pointer rounded border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                disabled={isLoading}
              >
                Student
              </button>
              <button
                onClick={() => performLogin('mentor.alex@example.com', 'seeded')}
                className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded cursor-pointer border border-green-500/30 hover:bg-green-500/30 transition-colors"
                disabled={isLoading}
              >
                Mentor
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
