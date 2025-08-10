import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { IoMdArrowBack } from "react-icons/io"
import { FaRegUser, FaRegEye, FaRegEyeSlash } from "react-icons/fa"
import { CiMail } from "react-icons/ci"
import { MdLockOutline } from "react-icons/md"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useAuth } from "../contexts/AuthContext"
import { API_BASE } from "@/lib/api"

function getRoleBasedRedirect(role: string) {
  switch (role) {
    case 'STUDENT': return '/dashboard'
    case 'MENTOR': return '/dashboard/mentor'
    case 'ADMIN': return '/dashboard/admin'
    default: return '/dashboard'
  }
}

export default function SignupPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'STUDENT' as 'STUDENT' | 'MENTOR'
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRoleChange = (role: 'STUDENT' | 'MENTOR') => {
    setFormData(prev => ({ ...prev, role }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("Please fill in all fields")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      login(data.token, data.user)
      toast.success("Account created successfully!")

      const redirectPath = getRoleBasedRedirect(data.user.role)
      navigate(redirectPath, { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed')
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
          
          <h2 className="text-2xl font-bold mb-2 flex justify-center items-center text-white">Create Account</h2>
          <p className="text-sm text-gray-400 mb-6 flex justify-center items-center">Join Acadly and start your learning journey</p>

          {/* Role Selector */}
          <div className="mb-6">
            <label className="flex text-sm mb-3 text-white">I am a</label>
            <div className="bg-[#292929] rounded-md p-1 flex">
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  formData.role === "STUDENT"
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => handleRoleChange("STUDENT")}
              >
                Student
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  formData.role === "MENTOR"
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => handleRoleChange("MENTOR")}
              >
                Mentor
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {formData.role === "STUDENT" 
                ? "Join as a student to get help from mentors" 
                : "Join as a mentor to help students learn"
              }
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="flex text-sm mb-1 text-white">Full Name</label>
              <div className="relative">
                <FaRegUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-md" />
                <input
                  className="w-full px-3 py-2 pl-10 placeholder-gray-400 bg-[#292929] rounded-sm placeholder:text-sm text-white border-none focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="flex text-sm mb-1 text-white">Email Address</label>
              <div className="relative">
                <CiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  className="w-full px-3 py-2 pl-10 placeholder-gray-400 bg-[#292929] rounded-md placeholder:text-sm text-white border-none focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="your.email@example.com"
                  type="email"
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
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  minLength={8}
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
              <span className="text-xs text-gray-400">Must be at least 8 characters long</span>
            </div>

            <button 
              className="bg-blue-500 hover:bg-blue-600 hover:scale-105 hover:shadow-2xl transition duration-200 text-white rounded-md py-3 font-semibold w-full mt-2" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
