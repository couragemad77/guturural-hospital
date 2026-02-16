import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Calendar, Home, HeartPulse, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { Patient } from '../../types';

const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    allergies: '',
    medicalHistory: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { registerPatient } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const patientData: Omit<Patient, 'id' | 'userId' | 'createdAt'> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone,
        address: formData.address,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship,
        },
        allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
        medicalHistory: formData.medicalHistory.split(',').map(s => s.trim()).filter(Boolean),
      };
      await registerPatient(patientData, formData.password);
      navigate('/'); // Navigate to login page on success
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/80 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-8 w-full max-w-2xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Create Patient Account</h1>
          <p className="text-gray-400">Enter your details to get started</p>
        </div>

        {error && <div className="bg-red-600/20 border border-red-500/50 text-red-400 p-3 mb-6 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-700 pt-4">
            <legend className="text-lg font-semibold text-teal-400 px-2 -translate-y-6">Personal Information</legend>
            <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} required className="p-3 bg-gray-700 rounded-md"/>
            <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} required className="p-3 bg-gray-700 rounded-md"/>
            <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required className="p-3 bg-gray-700 rounded-md"/>
            <input type="tel" name="phone" placeholder="Phone Number" onChange={handleChange} required className="p-3 bg-gray-700 rounded-md"/>
            <input type="date" name="dateOfBirth" placeholder="Date of Birth" onChange={handleChange} required className="p-3 bg-gray-700 rounded-md"/>
            <textarea name="address" placeholder="Address" onChange={handleChange} required className="p-3 bg-gray-700 rounded-md md:col-span-2"/>
          </fieldset>

          <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-700 pt-4">
            <legend className="text-lg font-semibold text-teal-400 px-2 -translate-y-6">Emergency Contact</legend>
            <input type="text" name="emergencyContactName" placeholder="Contact Name" onChange={handleChange} required className="p-3 bg-gray-700 rounded-md"/>
            <input type="text" name="emergencyContactRelationship" placeholder="Relationship" onChange={handleChange} required className="p-3 bg-gray-700 rounded-md"/>
            <input type="tel" name="emergencyContactPhone" placeholder="Contact Phone" onChange={handleChange} required className="p-3 bg-gray-700 rounded-md"/>
          </fieldset>

          <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-700 pt-4">
            <legend className="text-lg font-semibold text-teal-400 px-2 -translate-y-6">Medical Information</legend>
            <textarea name="allergies" placeholder="Allergies (comma-separated)" onChange={handleChange} className="p-3 bg-gray-700 rounded-md"/>
            <textarea name="medicalHistory" placeholder="Medical History (comma-separated)" onChange={handleChange} className="p-3 bg-gray-700 rounded-md"/>
          </fieldset>

          <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-700 pt-4">
            <legend className="text-lg font-semibold text-teal-400 px-2 -translate-y-6">Account Security</legend>
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="p-3 bg-gray-700 rounded-md"/>
            <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required className="p-3 bg-gray-700 rounded-md"/>
          </fieldset>

          <Button type="submit" fullWidth loading={loading}>Create Account</Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/" className="font-medium text-teal-400 hover:text-teal-300">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistrationForm;
