import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../stores/authStore'
import { usePWA } from '../hooks/usePWA'
import toast from 'react-hot-toast'
import Lottie from 'lottie-react'
import welcomeAnimation from '../assets/animations/welcome.json'

interface LoginForm {
  email: string
  password: string
}

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuthStore()
  const { canInstall, installApp } = usePWA()
  const [showWelcome, setShowWelcome] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password)
      toast.success('Welcome to StudySpot!')
    } catch (error) {
      toast.error('Login failed. Please try again.')
    }
  }

  if (showWelcome) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
        onClick={() => setShowWelcome(false)}
      >
        <div className="text-center">
          <Lottie
            animationData={welcomeAnimation}
            loop={false}
            style={{ width: 300, height: 300 }}
            onComplete={() => setShowWelcome(false)}
          />
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Welcome to StudySpot!
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl text-blue-100"
          >
            Tap anywhere to continue
          </motion.p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Install PWA Button */}
        {canInstall && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={installApp}
            className="w-full mb-6 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg px-4 py-2 text-sm font-medium hover:bg-white/30 transition-colors"
          >
            📱 Install StudySpot App
          </motion.button>
        )}

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">StudySpot</h1>
            <p className="text-blue-100">Enterprise-Grade Library Management</p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email',
                  },
                })}
                type="email"
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-300">{errors.email.message}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                type="password"
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-300">{errors.password.message}</p>
              )}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-blue-600 font-semibold py-3 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-center"
          >
            <p className="text-blue-200 text-sm">
              Demo: Use any email and password to login
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage












