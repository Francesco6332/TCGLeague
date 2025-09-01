import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { League } from '../types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: League) => void;
}

export function CreateEventModal({ isOpen, onClose, onEventCreated }: CreateEventModalProps) {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    format: 'Standard' as 'Standard' | 'Limited' | 'Championship' | 'Casual',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    maxParticipants: '',
    entryFee: '',
    prizePool: '',
    address: '',
    city: '',
    state: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile || userProfile.userType !== 'store') {
      setError('Only stores can create events');
      return;
    }

    if (!formData.name || !formData.startDate || !formData.startTime) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = formData.endDate && formData.endTime 
        ? new Date(`${formData.endDate}T${formData.endTime}`)
        : new Date(startDateTime.getTime() + 4 * 60 * 60 * 1000); // Default 4 hours

      const eventData = {
        name: formData.name,
        description: formData.description,
        storeId: userProfile.id,
        storeName: (userProfile as any).storeName || userProfile.username,
        format: formData.format,
        startDate: startDateTime,
        endDate: endDateTime,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        entryFee: formData.entryFee ? parseFloat(formData.entryFee) : null,
        prizePool: formData.prizePool || '',
        status: 'upcoming' as const,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
        },
        participants: [],
        rounds: [],
        standings: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'events'), eventData);
      
      const newEvent: League = {
        id: docRef.id,
        ...eventData,
        startDate: startDateTime,
        endDate: endDateTime,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      onEventCreated(newEvent);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        format: 'Standard',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        maxParticipants: '',
        entryFee: '',
        prizePool: '',
        address: '',
        city: '',
        state: '',
      });
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">Create New Event</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Event Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="Enter event name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field w-full resize-none"
                  rows={3}
                  placeholder="Describe your event"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Format
                  </label>
                  <select
                    name="format"
                    value={formData.format}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Limited">Limited</option>
                    <option value="Championship">Championship</option>
                    <option value="Casual">Casual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="Optional"
                    min="2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Date & Time
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="State"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Prizes */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Pricing & Prizes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Entry Fee ($)
                </label>
                <input
                  type="number"
                  name="entryFee"
                  value={formData.entryFee}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Prize Pool
                </label>
                <input
                  type="text"
                  name="prizePool"
                  value={formData.prizePool}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="Describe prizes"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  <span>Create Event</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
