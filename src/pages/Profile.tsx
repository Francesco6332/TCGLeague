import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  MapPin, 
  Phone, 
  Globe, 
  Mail,
  Trophy,
  Camera
} from 'lucide-react';

export function Profile() {
  const { userProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: userProfile?.username || '',
    email: userProfile?.email || '',
    storeName: userProfile?.userType === 'store' ? (userProfile as any).storeName || '' : '',
    phone: userProfile?.userType === 'store' ? (userProfile as any).phone || '' : '',
    website: userProfile?.userType === 'store' ? (userProfile as any).website || '' : '',
    description: userProfile?.userType === 'store' ? (userProfile as any).description || '' : '',
    address: userProfile?.userType === 'store' ? (userProfile as any).address || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    } : null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.') && formData.address) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address!,
          [addressField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    if (!userProfile) return;
    
    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
        updatedAt: new Date(),
        ...(userProfile.userType === 'store' && {
          storeName: formData.storeName,
          phone: formData.phone,
          website: formData.website,
          description: formData.description,
          address: formData.address,
        }),
      };

      await updateDoc(doc(db, 'users', userProfile.id), updateData);
      console.log('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      username: userProfile?.username || '',
      email: userProfile?.email || '',
      storeName: userProfile?.userType === 'store' ? (userProfile as any).storeName || '' : '',
      phone: userProfile?.userType === 'store' ? (userProfile as any).phone || '' : '',
      website: userProfile?.userType === 'store' ? (userProfile as any).website || '' : '',
      description: userProfile?.userType === 'store' ? (userProfile as any).description || '' : '',
      address: userProfile?.userType === 'store' ? (userProfile as any).address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      } : null,
    });
    setIsEditing(false);
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  const isStore = userProfile.userType === 'store';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold gradient-text">
          {isStore ? 'Store Profile' : 'Player Profile'}
        </h1>
        <p className="text-white/70 mt-2">
          Manage your {isStore ? 'store' : 'player'} information and settings
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="card p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="h-12 w-12 text-white" />
              </div>
              <button className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 rounded-full p-2 transition-colors">
                <Camera className="h-4 w-4 text-white" />
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-1">
              {isStore ? (userProfile as any).storeName : userProfile.username}
            </h2>
            <p className="text-white/60 text-sm mb-4 capitalize">
              {userProfile.userType}
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center space-x-2 text-white/70">
                <Mail className="h-4 w-4" />
                <span>{userProfile.email}</span>
              </div>
              {userProfile.bandaiMembershipId && (
                <div className="flex items-center justify-center space-x-2 text-white/70">
                  <Trophy className="h-4 w-4" />
                  <span>Bandai ID: {userProfile.bandaiMembershipId}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">
                  {isStore ? '8' : '12'}
                </div>
                <div className="text-xs text-white/60">
                  {isStore ? 'Events Organized' : 'Events Joined'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">
                  {isStore ? '147' : '68%'}
                </div>
                <div className="text-xs text-white/60">
                  {isStore ? 'Total Players' : 'Win Rate'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {isStore ? 'Store Information' : 'Player Information'}
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Username
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="input-field w-full"
                      />
                    ) : (
                      <p className="text-white p-2">{userProfile.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="input-field w-full"
                      />
                    ) : (
                      <p className="text-white p-2">{userProfile.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Store-specific fields */}
              {isStore && (
                <>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">Store Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Store Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="storeName"
                            value={formData.storeName}
                            onChange={handleInputChange}
                            className="input-field w-full"
                          />
                        ) : (
                          <p className="text-white p-2">{(userProfile as any).storeName}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Phone
                          </label>
                          {isEditing ? (
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="input-field w-full"
                            />
                          ) : (
                            <p className="text-white p-2 flex items-center space-x-2">
                              {(userProfile as any).phone && <Phone className="h-4 w-4" />}
                              <span>{(userProfile as any).phone || 'Not provided'}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Website
                          </label>
                          {isEditing ? (
                            <input
                              type="url"
                              name="website"
                              value={formData.website}
                              onChange={handleInputChange}
                              className="input-field w-full"
                            />
                          ) : (
                            <p className="text-white p-2 flex items-center space-x-2">
                              {(userProfile as any).website && <Globe className="h-4 w-4" />}
                              <span>{(userProfile as any).website || 'Not provided'}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Description
                        </label>
                        {isEditing ? (
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="input-field w-full resize-none"
                          />
                        ) : (
                          <p className="text-white p-2">
                            {(userProfile as any).description || 'No description provided'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Address</span>
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Street Address
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="address.street"
                            value={formData.address?.street || ''}
                            onChange={handleInputChange}
                            className="input-field w-full"
                          />
                        ) : (
                          <p className="text-white p-2">
                            {(userProfile as any).address?.street || 'Not provided'}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            City
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="address.city"
                              value={formData.address?.city || ''}
                              onChange={handleInputChange}
                              className="input-field w-full"
                            />
                          ) : (
                            <p className="text-white p-2">
                              {(userProfile as any).address?.city || 'Not provided'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            State/Province
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="address.state"
                              value={formData.address?.state || ''}
                              onChange={handleInputChange}
                              className="input-field w-full"
                            />
                          ) : (
                            <p className="text-white p-2">
                              {(userProfile as any).address?.state || 'Not provided'}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            ZIP Code
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="address.zipCode"
                              value={formData.address?.zipCode || ''}
                              onChange={handleInputChange}
                              className="input-field w-full"
                            />
                          ) : (
                            <p className="text-white p-2">
                              {(userProfile as any).address?.zipCode || 'Not provided'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Country
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="address.country"
                              value={formData.address?.country || ''}
                              onChange={handleInputChange}
                              className="input-field w-full"
                            />
                          ) : (
                            <p className="text-white p-2">
                              {(userProfile as any).address?.country || 'Not provided'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
