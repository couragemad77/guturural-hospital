import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const defaultAccounts = [
    { role: 'Admin', email: 'admin@gutu.com', password: 'admin123' },
    { role: 'Receptionist', email: 'reception@gutu.com', password: 'recept123' },
    { role: 'Doctor', email: 'doctor@gutu.com', password: 'doctor123' },
    { role: 'Nurse', email: 'nurse@gutu.com', password: 'nurse123' },
    { role: 'Patient', email: 'patient@gutu.com', password: 'patient123' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to sign in. Please check your credentials or try one of the demo accounts below.');
    }

    setLoading(false);
  };

  const quickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  const handleQuickLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
    } catch (error) {
      console.error('Quick login error:', error);
      setError('Failed to sign in with demo account. Please try again.');
    }
    
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-teal-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/80 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-8 w-full max-w-md shadow-2xl"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Gutu Rural Hospital</h1>
          <p className="text-gray-400">Patient Management System</p>
        </div>

        {error && (
          <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={!email || !password}
          >
            Sign In
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-teal-400 hover:text-teal-300">
              Create one
            </Link>
          </p>
        </div>

        {/* Demo Accounts */}
        <div className="mt-8">
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-300 mb-4 text-center">
              Demo Accounts
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {defaultAccounts.map((account) => (
                <button
                  key={account.role}
                  onClick={() => handleQuickLogin(account.email, account.password)}
                  disabled={loading}
                  className="text-left p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors border border-gray-600/50 hover:border-teal-500/30"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">{account.role}</span>
                    <span className="text-xs text-gray-400">{account.email}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-600/20 border border-blue-500/50 rounded-lg">
              <p className="text-blue-400 text-xs text-center">
                Demo accounts will be created automatically on first login
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;