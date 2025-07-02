'use client';

import { useState } from 'react';
import { database } from '../lib/firebase'; // Adjust path as needed
import { ref, push } from 'firebase/database';

interface AppointmentData {
  name: string;
  email: string;
  phone: string;
  company: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  contactMethod: 'call' | 'email';
}

interface TimeSlot {
  value: string;
  label: string;
}

export default function AppointmentPage() {
  const [formData, setFormData] = useState<AppointmentData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
    contactMethod: 'call'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Generate time slots from 9 AM to 5 PM
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 0) break; // Stop at 5:00 PM
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const time12 = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        slots.push({
          value: timeString,
          label: time12
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (2 months from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);
    return maxDate.toISOString().split('T')[0];
  };

  const handleInputChange = (field: keyof AppointmentData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.preferredDate || !formData.preferredTime) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.contactMethod === 'call' && !formData.phone) {
        throw new Error('Phone number is required for call appointments');
      }

      // Save to Firebase
      const appointmentsRef = ref(database, 'appointments');
      const appointmentData = {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      await push(appointmentsRef, appointmentData);

      // Send notification email to the team
      try {
        const emailResponse = await fetch('/api/send-appointment-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(appointmentData),
        });

        if (!emailResponse.ok) {
          console.error('Failed to send notification email');
        }
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Don't fail the appointment creation if email fails
      }

      setSubmitStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          preferredDate: '',
          preferredTime: '',
          message: '',
          contactMethod: 'call'
        });
        setSubmitStatus('idle');
      }, 3000);

    } catch (error) {
      console.error('Error submitting appointment:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSelectedDateTime = () => {
    if (!formData.preferredDate || !formData.preferredTime) return '';
    
    const date = new Date(formData.preferredDate);
    const timeSlot = timeSlots.find(slot => slot.value === formData.preferredTime);
    
    return `${date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })} at ${timeSlot?.label}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📅 Schedule Your Consultation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let's discuss how our clothing bank partnership can benefit your location. 
            Choose your preferred way to connect with us!
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Contact Method Selection */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">How would you like us to contact you?</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('contactMethod', 'call')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    formData.contactMethod === 'call'
                      ? 'border-yellow-300 bg-yellow-50 text-gray-900'
                      : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <div className="text-2xl mb-2">📞</div>
                  <div className="font-semibold">Schedule a Call</div>
                  <div className="text-sm opacity-90">We'll call you at your preferred time</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange('contactMethod', 'email')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    formData.contactMethod === 'email'
                      ? 'border-yellow-300 bg-yellow-50 text-gray-900'
                      : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <div className="text-2xl mb-2">✉️</div>
                  <div className="font-semibold">Email Response</div>
                  <div className="text-sm opacity-90">We'll send you detailed information</div>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    👤 Your Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number {formData.contactMethod === 'call' && '*'}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="+44 1234 567890"
                      required={formData.contactMethod === 'call'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company/Organization
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Your company name"
                    />
                  </div>
                </div>

                {/* Scheduling Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    📅 Preferred {formData.contactMethod === 'call' ? 'Call' : 'Response'} Time
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                      min={getMinDate()}
                      max={getMaxDate()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time *
                    </label>
                    <select
                      value={formData.preferredTime}
                      onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="">Select a time</option>
                      {timeSlots.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Date/Time Preview */}
                  {formData.preferredDate && formData.preferredTime && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800">
                        <span className="text-lg">🗓️</span>
                        <div>
                          <div className="font-semibold">Selected Time:</div>
                          <div className="text-sm">{formatSelectedDateTime()}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Tell us about your location, any specific questions, or anything else you'd like us to know..."
                />
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      {formData.contactMethod === 'call' ? '📞' : '✉️'}
                      Schedule {formData.contactMethod === 'call' ? 'Call' : 'Email Response'}
                    </>
                  )}
                </button>
              </div>

              {/* Success/Error Messages */}
              {submitStatus === 'success' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <span className="text-xl">✅</span>
                    <div>
                      <div className="font-semibold">Success!</div>
                      <div className="text-sm">
                        Your {formData.contactMethod} appointment has been scheduled. We'll {formData.contactMethod === 'call' ? 'call you' : 'email you'} soon!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <span className="text-xl">❌</span>
                    <div>
                      <div className="font-semibold">Error</div>
                      <div className="text-sm">
                        There was a problem submitting your request. Please try again.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center text-gray-600">
            <p className="text-sm">
              📍 We typically respond within 24 hours during business days (Monday - Friday, 9 AM - 5 PM)
            </p>
            <p className="text-sm mt-2">
              🔒 Your information is secure and will only be used to contact you about this partnership opportunity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}