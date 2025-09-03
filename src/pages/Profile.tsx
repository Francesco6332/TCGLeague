import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  User, 
  Store, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Edit, 
  Save, 
  X, 
  LogOut,
  Trophy,
  Calendar,
  Users,
  Star,
  Settings,
  Shield,
  CreditCard
} from 'lucide-react';
import type { Store as StoreType } from '../types';

export function Profile() {
  const { userProfile, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bandaiMembershipId: '',
  });
  
  const [storeFormData, setStoreFormData] = useState({
    storeName: '',
    phone: '',
    website: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        username: userProfile.username || '',
        email: userProfile.email || '',
        bandaiMembershipId: userProfile.bandaiMembershipId || '',
      });
      
      if (userProfile.userType === 'store' && userProfile.store) {
        setStoreFormData({
          storeName: userProfile.store.storeName || '',
          phone: userProfile.store.phone || '',
          website: userProfile.store.website || '',
          description: userProfile.store.description || '',
          address: {
            street: userProfile.store.address?.street || '',
            city: userProfile.store.address?.city || '',
            state: userProfile.store.address?.state || '',
            zipCode: userProfile.store.address?.zipCode || '',
            country: userProfile.store.address?.country || '',
          },
        });
      }
    }
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (['username', 'email', 'bandaiMembershipId'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    } else if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setStoreFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else if (['storeName', 'phone', 'website', 'description'].includes(name)) {
      setStoreFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    if (!userProfile) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const updateData: any = {
        username: formData.username,
        bandaiMembershipId: formData.bandaiMembershipId,
      };
      
      if (userProfile.userType === 'store') {
        updateData.store = storeFormData;
      }
      
      await updateProfile(updateData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Update error:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (userProfile) {
      setFormData({
        username: userProfile.username || '',
        email: userProfile.email || '',
        bandaiMembershipId: userProfile.bandaiMembershipId || '',
      });
      
      if (userProfile.userType === 'store' && userProfile.store) {
        setStoreFormData({
          storeName: userProfile.store.storeName || '',
          phone: userProfile.store.phone || '',
          website: userProfile.store.website || '',
          description: userProfile.store.description || '',
          address: {
            street: userProfile.store.address?.street || '',
            city: userProfile.store.address?.city || '',
            state: userProfile.store.address?.state || '',
            zipCode: userProfile.store.address?.zipCode || '',
            country: userProfile.store.address?.country || '',
          },
        });
      }
    }
    setIsEditing(false);
    setError('');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8"> {/* Responsive padding */}
        {/* Header - Mobile responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8" // Responsive flex direction and margin
        >
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2 sm:mb-3"> {/* Responsive font size */}
              Profile
            </h1>
            <p className="text-white/70 text-sm sm:text-base"> {/* Responsive font size */}
              Manage your account and preferences
            </p>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3 mt-4 sm:mt-0"> {/* Responsive spacing and margin */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-sm sm:text-base touch-manipulation" // Responsive padding and font size
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="btn-secondary flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-sm sm:text-base touch-manipulation" // Responsive padding and font size
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn-primary flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-sm sm:text-base touch-manipulation" // Responsive padding and font size
                >
                  {loading ? (
                    <div className="loading-spinner h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                </button>
              </>
            )}
            
            <button
              onClick={handleLogout}
              className="btn-secondary flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-sm sm:text-base touch-manipulation text-red-400 hover:text-red-300" // Responsive padding and font size
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </motion.div>

        {/* Alerts - Mobile responsive */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-xs sm:text-sm" // Responsive padding and font size
            role="alert"
            aria-live="polite"
          >
            {error}
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/50 text-green-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-xs sm:text-sm" // Responsive padding and font size
            role="alert"
            aria-live="polite"
          >
            {success}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8"> {/* Responsive grid columns and gaps */}
          {/* Main Profile Info - Mobile responsive */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-4 sm:space-y-6" // Responsive spacing
          >
            {/* Basic Information - Mobile responsive */}
            <div className="card p-4 sm:p-6"> {/* Responsive padding */}
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4"> {/* Responsive spacing and margin */}
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" /> {/* Responsive icon size */}
                <h2 className="text-lg sm:text-xl font-semibold text-white">Basic Information</h2> {/* Responsive font size */}
              </div>
              
              <div className="space-y-3 sm:space-y-4"> {/* Responsive spacing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"> {/* Responsive grid columns and gaps */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white/80 mb-1 sm:mb-2"> {/* Responsive font size */}
                      Username
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="input-field w-full text-sm sm:text-base" // Responsive font size
                        placeholder="Enter username"
                      />
                    ) : (
                      <div className="text-white text-sm sm:text-base py-2 px-3 bg-white/5 rounded-lg"> {/* Responsive font size and padding */}
                        {userProfile.username || 'Not set'}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white/80 mb-1 sm:mb-2"> {/* Responsive font size */}
                      Email
                    </label>
                    <div className="flex items-center space-x-2 text-white text-sm sm:text-base py-2 px-3 bg-white/5 rounded-lg"> {/* Responsive font size and padding */}
                      <Mail className="h-4 w-4 text-white/60" />
                      <span>{userProfile.email}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white/80 mb-1 sm:mb-2"> {/* Responsive font size */}
                    Bandai Membership ID
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="bandaiMembershipId"
                      value={formData.bandaiMembershipId}
                      onChange={handleInputChange}
                      className="input-field w-full text-sm sm:text-base" // Responsive font size
                      placeholder="Enter Bandai Membership ID"
                    />
                  ) : (
                    <div className="text-white text-sm sm:text-base py-2 px-3 bg-white/5 rounded-lg"> {/* Responsive font size and padding */}
                      {userProfile.bandaiMembershipId || 'Not set'}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white/80 mb-1 sm:mb-2"> {/* Responsive font size */}
                    Account Type
                  </label>
                  <div className="flex items-center space-x-2 text-white text-sm sm:text-base py-2 px-3 bg-white/5 rounded-lg"> {/* Responsive font size and padding */}
                    {userProfile.userType === 'store' ? (
                      <Store className="h-4 w-4 text-purple-400" />
                    ) : (
                      <User className="h-4 w-4 text-blue-400" />
                    )}
                    <span className="capitalize">{userProfile.userType}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Information - Mobile responsive */}
            {userProfile.userType === 'store' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-4 sm:p-6" // Responsive padding
              >
                <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4"> {/* Responsive spacing and margin */}
                  <Store className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" /> {/* Responsive icon size */}
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Store Information</h2> {/* Responsive font size */}
                </div>
                
                <div className="space-y-3 sm:space-y-4"> {/* Responsive spacing */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white/80 mb-1 sm:mb-2"> {/* Responsive font size */}
                      Store Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="storeName"
                        value={storeFormData.storeName}
                        onChange={handleInputChange}
                        className="input-field w-full text-sm sm:text-base" // Responsive font size
                        placeholder="Enter store name"
                      />
                    ) : (
                      <div className="text-white text-sm sm:text-base py-2 px-3 bg-white/5 rounded-lg"> {/* Responsive font size and padding */}
                        {userProfile.store?.storeName || 'Not set'}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"> {/* Responsive grid columns and gaps */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-white/80 mb-1 sm:mb-2"> {/* Responsive font size */}
                        Phone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={storeFormData.phone}
                          onChange={handleInputChange}
                          className="input-field w-full text-sm sm:text-base" // Responsive font size
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-white text-sm sm:text-base py-2 px-3 bg-white/5 rounded-lg"> {/* Responsive font size and padding */}
                          <Phone className="h-4 w-4 text-white/60" />
                          <span>{userProfile.store?.phone || 'Not set'}</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-white/80 mb-1 sm:mb-2"> {/* Responsive font size */}
                        Website
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          name="website"
                          value={storeFormData.website}
                          onChange={handleInputChange}
                          className="input-field w-full text-sm sm:text-base" // Responsive font size
                          placeholder="Enter website URL"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-white text-sm sm:text-base py-2 px-3 bg-white/5 rounded-lg"> {/* Responsive font size and padding */}
                          <Globe className="h-4 w-4 text-white/60" />
                          <span>{userProfile.store?.website || 'Not set'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white/80 mb-1 sm:mb-2"> {/* Responsive font size */}
                      Description
                    </label>
                    {isEditing ? (
                      <textarea
                        name="description"
                        value={storeFormData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="input-field w-full text-sm sm:text-base resize-none" // Responsive font size
                        placeholder="Enter store description"
                      />
                    ) : (
                      <div className="text-white text-sm sm:text-base py-2 px-3 bg-white/5 rounded-lg"> {/* Responsive font size and padding */}
                        {userProfile.store?.description || 'No description'}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white/80 mb-2 sm:mb-3"> {/* Responsive font size and margin */}
                      Address
                    </label>
                    <div className="space-y-3 sm:space-y-4"> {/* Responsive spacing */}
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            name="address.street"
                            value={storeFormData.address.street}
                            onChange={handleInputChange}
                            className="input-field w-full text-sm sm:text-base" // Responsive font size
                            placeholder="Street Address"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"> {/* Responsive grid columns and gaps */}
                            <input
                              type="text"
                              name="address.city"
                              value={storeFormData.address.city}
                              onChange={handleInputChange}
                              className="input-field w-full text-sm sm:text-base" // Responsive font size
                              placeholder="City"
                            />
                            <input
                              type="text"
                              name="address.state"
                              value={storeFormData.address.state}
                              onChange={handleInputChange}
                              className="input-field w-full text-sm sm:text-base" // Responsive font size
                              placeholder="State/Province"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"> {/* Responsive grid columns and gaps */}
                            <input
                              type="text"
                              name="address.zipCode"
                              value={storeFormData.address.zipCode}
                              onChange={handleInputChange}
                              className="input-field w-full text-sm sm:text-base" // Responsive font size
                              placeholder="ZIP/Postal Code"
                            />
                            <input
                              type="text"
                              name="address.country"
                              value={storeFormData.address.country}
                              onChange={handleInputChange}
                              className="input-field w-full text-sm sm:text-base" // Responsive font size
                              placeholder="Country"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="flex items-start space-x-2 text-white text-sm sm:text-base py-2 px-3 bg-white/5 rounded-lg"> {/* Responsive font size and padding */}
                          <MapPin className="h-4 w-4 text-white/60 mt-0.5 flex-shrink-0" />
                          <div>
                            {userProfile.store?.address ? (
                              <div>
                                <div>{userProfile.store.address.street}</div>
                                <div>{userProfile.store.address.city}, {userProfile.store.address.state} {userProfile.store.address.zipCode}</div>
                                <div>{userProfile.store.address.country}</div>
                              </div>
                            ) : (
                              <span>Address not set</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Sidebar - Mobile responsive */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 sm:space-y-6" // Responsive spacing
          >
            {/* Account Stats - Mobile responsive */}
            <div className="card p-4 sm:p-6"> {/* Responsive padding */}
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4"> {/* Responsive spacing and margin */}
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" /> {/* Responsive icon size */}
                <h3 className="text-base sm:text-lg font-semibold text-white">Account Stats</h3> {/* Responsive font size */}
              </div>
              
              <div className="space-y-2 sm:space-y-3"> {/* Responsive spacing */}
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-xs sm:text-sm">Member Since</span> {/* Responsive font size */}
                  <span className="text-white text-xs sm:text-sm font-medium"> {/* Responsive font size */}
                    {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-xs sm:text-sm">Account Type</span> {/* Responsive font size */}
                  <span className="text-white text-xs sm:text-sm font-medium capitalize"> {/* Responsive font size */}
                    {userProfile.userType}
                  </span>
                </div>
                
                {userProfile.userType === 'player' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-xs sm:text-sm">Events Joined</span> {/* Responsive font size */}
                      <span className="text-white text-xs sm:text-sm font-medium">12</span> {/* Responsive font size */}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-xs sm:text-sm">Win Rate</span> {/* Responsive font size */}
                      <span className="text-white text-xs sm:text-sm font-medium">68%</span> {/* Responsive font size */}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-xs sm:text-sm">Current Rank</span> {/* Responsive font size */}
                      <span className="text-blue-400 text-xs sm:text-sm font-medium">#247</span> {/* Responsive font size */}
                    </div>
                  </>
                )}
                
                {userProfile.userType === 'store' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-xs sm:text-sm">Events Organized</span> {/* Responsive font size */}
                      <span className="text-white text-xs sm:text-sm font-medium">8</span> {/* Responsive font size */}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-xs sm:text-sm">Total Participants</span> {/* Responsive font size */}
                      <span className="text-white text-xs sm:text-sm font-medium">156</span> {/* Responsive font size */}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-xs sm:text-sm">Store Rating</span> {/* Responsive font size */}
                      <span className="text-yellow-400 text-xs sm:text-sm font-medium">4.8/5</span> {/* Responsive font size */}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions - Mobile responsive */}
            <div className="card p-4 sm:p-6"> {/* Responsive padding */}
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4"> {/* Responsive spacing and margin */}
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" /> {/* Responsive icon size */}
                <h3 className="text-base sm:text-lg font-semibold text-white">Quick Actions</h3> {/* Responsive font size */}
              </div>
              
              <div className="space-y-2 sm:space-y-3"> {/* Responsive spacing */}
                <button className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 text-left text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs sm:text-sm touch-manipulation"> {/* Responsive spacing, padding, and font size */}
                  <Shield className="h-4 w-4" />
                  <span>Privacy Settings</span>
                </button>
                
                <button className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 text-left text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs sm:text-sm touch-manipulation"> {/* Responsive spacing, padding, and font size */}
                  <CreditCard className="h-4 w-4" />
                  <span>Payment Methods</span>
                </button>
                
                <button className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 text-left text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs sm:text-sm touch-manipulation"> {/* Responsive spacing, padding, and font size */}
                  <Calendar className="h-4 w-4" />
                  <span>Event History</span>
                </button>
                
                <button className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 text-left text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs sm:text-sm touch-manipulation"> {/* Responsive spacing, padding, and font size */}
                  <Users className="h-4 w-4" />
                  <span>Friends List</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
