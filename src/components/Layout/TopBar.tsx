import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Search, Menu, Shield, Calendar, Clock, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface TopBarProps {
  onMenuClick?: () => void;
  showMenu?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, showMenu = false }) => {
  const { userRole, currentUser } = useAuth();

  const isPatient = userRole?.role === 'patient';

  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      className="bg-gray-900/80 backdrop-blur-lg border-b border-teal-500/20 px-6 py-4 sticky top-0 z-30"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showMenu && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-teal-400 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-lg font-bold text-white">Gutu Rural Hospital</h1>
                {isPatient && <p className="text-xs text-gray-400">Patient Portal</p>}
              </div>
            </div>
          </div>

          {/* Patient Navigation */}
          {isPatient && (
            <nav className="hidden md:flex items-center space-x-6 ml-8">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 text-gray-300 hover:text-teal-400 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/appointments"
                className="flex items-center space-x-2 text-gray-300 hover:text-teal-400 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Appointments</span>
              </Link>
              <Link
                to="/queue"
                className="flex items-center space-x-2 text-gray-300 hover:text-teal-400 transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span>Queue</span>
              </Link>
              <Link
                to="/records"
                className="flex items-center space-x-2 text-gray-300 hover:text-teal-400 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Records</span>
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients, appointments..."
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 w-64"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-teal-400 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Profile */}
          <Link to="/settings" className="flex items-center space-x-3 hover:bg-gray-800 rounded-lg p-2 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {userRole?.displayName?.[0] || currentUser?.email?.[0] || 'U'}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white">
                {userRole?.displayName || currentUser?.displayName || 'User'}
              </p>
              <p className="text-xs text-gray-400 capitalize">{userRole?.role}</p>
            </div>
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

export default TopBar;