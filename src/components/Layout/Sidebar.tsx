import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Settings,
  UserPlus,
  Stethoscope,
  Shield,
  Clock,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { userRole } = useAuth();

  const getNavigationItems = () => {

    switch (userRole?.role) {
      case 'admin':
        return [
          { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/users', icon: Users, label: 'User Management' },
          { path: '/queue', icon: Clock, label: 'Queue Management' },
          { path: '/reports', icon: BarChart3, label: 'Reports & Analytics' },
          { path: '/checkin', icon: UserPlus, label: 'Patient Check-in' },
          { path: '/patients', icon: Users, label: 'All Patients' },
          { path: '/consultations', icon: Stethoscope, label: 'Consultations' },
          { path: '/settings', icon: Settings, label: 'Settings' }
        ];
      case 'receptionist':
        return [
          { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/checkin', icon: UserPlus, label: 'Patient Check-in' },
          { path: '/queue', icon: Clock, label: 'Queue Status' },
          { path: '/settings', icon: Settings, label: 'Settings' }
        ];
      case 'doctor':
      case 'nurse':
        return [
          { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/patients', icon: Users, label: 'My Patients' },
          { path: '/queue', icon: Clock, label: 'Queue' },
          { path: '/consultations', icon: Stethoscope, label: 'Consultations' },
          { path: '/settings', icon: Settings, label: 'Settings' }
        ];
      default:
        return [
          { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/settings', icon: Settings, label: 'Settings' }
        ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-teal-500/20 z-40"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-teal-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Gutu Rural</h1>
              <p className="text-sm text-gray-400">Hospital System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/20 to-purple-600/20 text-teal-400 border border-teal-500/30'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-teal-400'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-teal-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {userRole?.displayName?.[0] || userRole?.email?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userRole?.displayName || 'User'}
              </p>
              <p className="text-xs text-gray-400 capitalize">{userRole?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;