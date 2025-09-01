import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Trophy, UserPlus, Store as StoreIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Store } from '../../types';

export function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    bandaiMembershipId: '',
    userType: 'player' as 'player' | 'store',
  });
  
  const [storeInfo, setStoreInfo] = useState({
    storeName: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    phone: '',
    website: '',
    description: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setStoreInfo(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else if (name in storeInfo) {
      setStoreInfo(prev => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.userType === 'store' && !storeInfo.storeName) {
      setError('Store name is required for store registration');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      await register(
        formData.email,
        formData.password,
        formData.username,
        formData.userType,
        formData.bandaiMembershipId || undefined,
        formData.userType === 'store' ? storeInfo as Partial<Store> : undefined
      );
      
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please use a different email or try logging in.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)'}}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto h-12 w-12 text-yellow-400 flex items-center justify-center"
          >
            <Trophy className="h-12 w-12" />
          </motion.div>
          <h2 className="mt-6 text-3xl font-bold gradient-text">
            Join TCG League
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Create your account and start competing
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="card p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6"
              >
                {error}
              </motion.div>
            )}

            {/* User Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="userType"
                    value="player"
                    checked={formData.userType === 'player'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    formData.userType === 'player'
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/20 bg-white/5'
                  }`}>
                    <UserPlus className="h-6 w-6 mx-auto mb-2" />
                    <span className="block text-center font-medium">Player</span>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="userType"
                    value="store"
                    checked={formData.userType === 'store'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    formData.userType === 'store'
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/20 bg-white/5'
                  }`}>
                    <StoreIcon className="h-6 w-6 mx-auto mb-2" />
                    <span className="block text-center font-medium">Store</span>
                  </div>
                </label>
              </div>
              {formData.userType === 'store' && (
                <p className="text-sm text-white/60 mt-2">
                  Are you a store? Register with store information to organize events.
                </p>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-field w-full"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-white/80 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="input-field w-full"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input-field w-full pr-10"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="input-field w-full pr-10"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-white/60" />
                    ) : (
                      <Eye className="h-4 w-4 text-white/60" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="bandaiMembershipId" className="block text-sm font-medium text-white/80 mb-2">
                Bandai Membership ID (Optional)
              </label>
              <input
                id="bandaiMembershipId"
                name="bandaiMembershipId"
                type="text"
                className="input-field w-full"
                placeholder="Enter your Bandai Membership ID"
                value={formData.bandaiMembershipId}
                onChange={handleInputChange}
              />
            </div>

            {/* Store Information */}
            {formData.userType === 'store' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 border-t border-white/20 pt-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Store Information</h3>
                
                <div>
                  <label htmlFor="storeName" className="block text-sm font-medium text-white/80 mb-2">
                    Store Name *
                  </label>
                  <input
                    id="storeName"
                    name="storeName"
                    type="text"
                    required
                    className="input-field w-full"
                    placeholder="Enter your store name"
                    value={storeInfo.storeName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="address.street" className="block text-sm font-medium text-white/80 mb-2">
                      Street Address
                    </label>
                    <input
                      id="address.street"
                      name="address.street"
                      type="text"
                      className="input-field w-full"
                      placeholder="Street address"
                      value={storeInfo.address.street}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="address.city" className="block text-sm font-medium text-white/80 mb-2">
                      City
                    </label>
                    <input
                      id="address.city"
                      name="address.city"
                      type="text"
                      className="input-field w-full"
                      placeholder="City"
                      value={storeInfo.address.city}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="address.state" className="block text-sm font-medium text-white/80 mb-2">
                      State/Province
                    </label>
                    <input
                      id="address.state"
                      name="address.state"
                      type="text"
                      className="input-field w-full"
                      placeholder="State"
                      value={storeInfo.address.state}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="address.zipCode" className="block text-sm font-medium text-white/80 mb-2">
                      ZIP Code
                    </label>
                    <input
                      id="address.zipCode"
                      name="address.zipCode"
                      type="text"
                      className="input-field w-full"
                      placeholder="ZIP Code"
                      value={storeInfo.address.zipCode}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="address.country" className="block text-sm font-medium text-white/80 mb-2">
                      Country
                    </label>
                    <input
                      id="address.country"
                      name="address.country"
                      type="text"
                      className="input-field w-full"
                      placeholder="Country"
                      value={storeInfo.address.country}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-2">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="input-field w-full"
                      placeholder="Phone number"
                      value={storeInfo.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-white/80 mb-2">
                      Website
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      className="input-field w-full"
                      placeholder="https://yourstore.com"
                      value={storeInfo.website}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-white/80 mb-2">
                    Store Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="input-field w-full resize-none"
                    placeholder="Brief description of your store"
                    value={storeInfo.description}
                    onChange={handleInputChange}
                  />
                </div>
              </motion.div>
            )}

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2 py-3"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-white/70">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}
