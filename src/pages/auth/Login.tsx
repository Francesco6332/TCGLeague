import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Trophy, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email. Please check your email or create a new account.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Failed to log in. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:py-8" style={{background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)'}}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-yellow-400 flex items-center justify-center"
          >
            <Trophy className="h-10 w-10 sm:h-12 sm:w-12" />
          </motion.div>
          <h2 id="login-title" className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold gradient-text">
            Welcome Back
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-white/70">
            Sign in to your TCG League account
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 sm:mt-8 space-y-4 sm:space-y-6"
          onSubmit={handleSubmit}
          aria-labelledby="login-title"
          noValidate
        >
          <div className="card p-6 sm:p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-xs sm:text-sm"
                role="alert"
                aria-live="polite"
                id="login-error"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-white/80 mb-1 sm:mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-field w-full text-sm sm:text-base"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-white/80 mb-1 sm:mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input-field w-full pr-10 text-sm sm:text-base"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center touch-manipulation"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-white/60" />
                    ) : (
                      <Eye className="h-4 w-4 text-white/60" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2 py-2.5 sm:py-3 text-sm sm:text-base touch-manipulation"
                aria-describedby={loading ? "login-loading" : undefined}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner h-4 w-4" aria-hidden="true"></div>
                    <span id="login-loading" className="sr-only">Signing in, please wait</span>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-xs sm:text-sm text-white/70">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}
