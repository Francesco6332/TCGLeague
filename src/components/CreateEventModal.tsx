import { useState, useEffect } from 'react';
import { Calendar, MapPin, DollarSign, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { League } from '../types';
import { AccessibleModal } from './ui/AccessibleModal';
import { AccessibleForm, FormField, FormButton, FormError } from './ui/AccessibleForm';

// Geocoding function to get coordinates from address
async function getCoordinatesFromAddress(address: string, city: string, state: string): Promise<{lat: number, lng: number} | undefined> {
  if (!address && !city) return undefined;
  
  const query = [address, city, state].filter(Boolean).join(', ');
  
  try {
    // Using OpenStreetMap Nominatim API (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'TCG-League-App/1.0',
        },
      }
    );
    
    if (!response.ok) throw new Error('Geocoding failed');
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (error) {
  }
  
  return undefined;
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: League) => void;
  editingEvent?: League;
}

export function CreateEventModal({ isOpen, onClose, onEventCreated, editingEvent }: CreateEventModalProps) {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    format: 'Constructed' as 'Constructed' | 'Limited' | 'Championship' | 'Casual',
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
    numberOfStages: '1',
  });

  const [stages, setStages] = useState<Array<{name: string, date: string}>>([
    { name: 'Stage 1', date: '' }
  ]);

  // Populate form when editing
  useEffect(() => {
    if (editingEvent) {
      const startDate = editingEvent.startDate.toISOString().split('T')[0];
      const startTime = editingEvent.startDate.toTimeString().slice(0, 5);
      const endDate = editingEvent.endDate.toISOString().split('T')[0];
      const endTime = editingEvent.endDate.toTimeString().slice(0, 5);

      setFormData({
        name: editingEvent.name,
        description: editingEvent.description,
        format: editingEvent.format,
        startDate,
        startTime,
        endDate,
        endTime,
        maxParticipants: editingEvent.maxParticipants?.toString() || '',
        entryFee: editingEvent.entryFee?.toString() || '',
        prizePool: editingEvent.prizePool || '',
        address: editingEvent.location.address,
        city: editingEvent.location.city,
        state: editingEvent.location.state,
        numberOfStages: editingEvent.stages?.length.toString() || '1',
      });

      if (editingEvent.stages && editingEvent.stages.length > 0) {
        setStages(editingEvent.stages.map(stage => ({
          name: stage.name,
          date: stage.date.toISOString().split('T')[0],
        })));
      }
    } else {
      // Reset form for new event
      setFormData({
        name: '',
        description: '',
        format: 'Constructed',
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
        numberOfStages: '1',
      });
      setStages([{ name: 'Stage 1', date: '' }]);
    }
  }, [editingEvent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Handle number of stages change
    if (name === 'numberOfStages') {
      const numStages = parseInt(value) || 1;
      const newStages = Array.from({ length: numStages }, (_, i) => ({
        name: stages[i]?.name || `Stage ${i + 1}`,
        date: stages[i]?.date || ''
      }));
      setStages(newStages);
    }
  };

  const handleStageChange = (index: number, field: 'name' | 'date', value: string) => {
    setStages(prev => prev.map((stage, i) => 
      i === index ? { ...stage, [field]: value } : stage
    ));
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

    // Validate stages
    if (stages.some(stage => !stage.name || !stage.date)) {
      setError('Please fill in all stage names and dates');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = formData.endDate && formData.endTime 
        ? new Date(`${formData.endDate}T${formData.endTime}`)
        : new Date(startDateTime.getTime() + 4 * 60 * 60 * 1000); // Default 4 hours

      // Create stages with proper dates
      const eventStages = stages.map((stage, index) => ({
        stageNumber: index + 1,
        name: stage.name,
        date: new Date(stage.date),
        isCompleted: false,
        standings: []
      }));

      const eventData = {
        name: formData.name,
        description: formData.description,
        storeId: userProfile.id,
        storeName: (userProfile as any).storeName || userProfile.username,
        format: formData.format,
        startDate: startDateTime,
        endDate: endDateTime,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        entryFee: formData.entryFee ? parseFloat(formData.entryFee) : undefined,
        prizePool: formData.prizePool || '',
        status: 'upcoming' as const,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          coordinates: await getCoordinatesFromAddress(formData.address, formData.city, formData.state),
        },
        participants: [],
        rounds: [],
        standings: [],
        stages: eventStages,
        currentStage: 0, // No stage completed yet
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      let resultEvent: League;

      if (editingEvent) {
        // Update existing event
        const updateData = {
          ...eventData,
          // Preserve existing data for events with participants
          participants: editingEvent.participants,
          rounds: editingEvent.rounds,
          standings: editingEvent.standings,
          currentStage: editingEvent.currentStage,
          createdAt: editingEvent.createdAt, // Keep original creation date
        };

        await updateDoc(doc(db, 'events', editingEvent.id), updateData);
        
        resultEvent = {
          id: editingEvent.id,
          ...updateData,
          startDate: startDateTime,
          endDate: endDateTime,
          stages: eventStages,
          createdAt: editingEvent.createdAt,
          updatedAt: new Date(),
        };
      } else {
        // Create new event
        const docRef = await addDoc(collection(db, 'events'), eventData);
        
        resultEvent = {
          id: docRef.id,
          ...eventData,
          startDate: startDateTime,
          endDate: endDateTime,
          stages: eventStages,
          currentStage: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      onEventCreated(resultEvent);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        format: 'Constructed',
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
        numberOfStages: '1',
      });
      setStages([{ name: 'Stage 1', date: '' }]);
    } catch (error) {
      setError('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEvent ? "Edit Event" : "Create New Event"}
      size="lg"
    >
      <FormError error={error} id="create-event-error" />

      <AccessibleForm 
        onSubmit={handleSubmit}
        aria-labelledby="modal-title"
      >
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Event Information</h3>
          <div className="space-y-4">
            <FormField
              id="name"
              label="Event Name"
              required
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              placeholder="Enter event name"
              error={error && !formData.name ? 'Event name is required' : ''}
              aria-describedby={error ? "create-event-error" : undefined}
            />

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white/80 mb-2">
                Description
              </label>
              <textarea
                id="description"
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
                    <option value="Constructed">Constructed</option>
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

          {/* Tournament Stages */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Tournament Stages
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Number of Stages *
                </label>
                <select
                  name="numberOfStages"
                  value={formData.numberOfStages}
                  onChange={handleInputChange}
                  className="input-field w-full md:w-48"
                  required
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num.toString()}>
                      {num} Stage{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-white/60 text-sm mt-1">
                  Each stage will have its own tournament and standings
                </p>
              </div>

              {stages.map((stage, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-md font-medium text-white mb-3">
                    Stage {index + 1}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Stage Name *
                      </label>
                      <input
                        type="text"
                        value={stage.name}
                        onChange={(e) => handleStageChange(index, 'name', e.target.value)}
                        className="input-field w-full"
                        placeholder={`Stage ${index + 1}`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={stage.date}
                        onChange={(e) => handleStageChange(index, 'date', e.target.value)}
                        className="input-field w-full"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
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
          <FormButton
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </FormButton>
          <FormButton
            type="submit"
            variant="primary"
            loading={loading}
            loadingText={editingEvent ? "Updating Event..." : "Creating Event..."}
            className="flex-1"
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>{editingEvent ? "Update Event" : "Create Event"}</span>
          </FormButton>
        </div>
      </AccessibleForm>
    </AccessibleModal>
  );
}
