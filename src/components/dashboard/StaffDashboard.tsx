import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Calendar, AlertCircle, TrendingUp, CheckCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

const StaffDashboard: React.FC = () => {
  const { userRole } = useAuth();
  const [stats] = useState({
    totalPatients: 24,
    waitingPatients: 8,
    completedToday: 16,
    avgWaitTime: '12 min',
    nextAppointment: '10:30 AM',
    urgentCases: 2
  });

  const [recentPatients] = useState([
    {
      id: '1',
      name: 'John Mutasa',
      time: '09:30 AM',
      status: 'waiting',
      priority: 'normal',
      department: 'General Medicine'
    },
    {
      id: '2',
      name: 'Mary Chikwanha',
      time: '10:00 AM',
      status: 'in-consultation',
      priority: 'high',
      department: 'Emergency'
    },
    {
      id: '3',
      name: 'Peter Mukamuri',
      time: '10:30 AM',
      status: 'scheduled',
      priority: 'normal',
      department: 'General Medicine'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'in-consultation':
        return 'text-blue-400 bg-blue-400/20';
      case 'completed':
        return 'text-green-400 bg-green-400/20';
      case 'scheduled':
        return 'text-gray-400 bg-gray-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400 bg-red-400/20';
      case 'high':
        return 'text-orange-400 bg-orange-400/20';
      case 'normal':
        return 'text-green-400 bg-green-400/20';
      case 'low':
        return 'text-blue-400 bg-blue-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          {userRole?.role === 'doctor' ? 'Doctor' : 
           userRole?.role === 'nurse' ? 'Nurse' : 
           'Staff'} Dashboard
        </h1>
        <p className="text-gray-400">
          Monitor patient flow and manage your daily schedule
        </p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card gradient hover className="text-center">
          <Users className="w-8 h-8 text-teal-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{stats.totalPatients}</div>
          <p className="text-gray-400">Total Patients Today</p>
        </Card>

        <Card gradient hover className="text-center">
          <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{stats.waitingPatients}</div>
          <p className="text-gray-400">Currently Waiting</p>
        </Card>

        <Card gradient hover className="text-center">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{stats.completedToday}</div>
          <p className="text-gray-400">Completed Today</p>
        </Card>

        <Card gradient hover className="text-center">
          <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{stats.avgWaitTime}</div>
          <p className="text-gray-400">Avg Wait Time</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Queue */}
        <Card title="Current Queue" icon={Clock}>
          <div className="space-y-3">
            {recentPatients.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-white font-medium">{patient.name}</p>
                    <p className="text-gray-400 text-sm">{patient.time} • {patient.department}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(patient.priority)}`}>
                    {patient.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(patient.status)}`}>
                    {patient.status}
                  </span>
                </div>
              </motion.div>
            ))}
            <Button fullWidth variant="outline">
              View Full Queue
            </Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions" icon={Calendar}>
          <div className="grid grid-cols-2 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center">
              <Users className="w-6 h-6 mb-2" />
              <span>Check-in Patient</span>
            </Button>
            <Button variant="secondary" className="h-20 flex flex-col items-center justify-center">
              <Calendar className="w-6 h-6 mb-2" />
              <span>View Schedule</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Clock className="w-6 h-6 mb-2" />
              <span>Update Status</span>
            </Button>
            <Button variant="secondary" className="h-20 flex flex-col items-center justify-center">
              <AlertCircle className="w-6 h-6 mb-2" />
              <span>Urgent Cases</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Next Appointment */}
      {stats.nextAppointment && (
        <Card>
          <div className="bg-gradient-to-r from-teal-500/20 to-purple-600/20 rounded-lg p-6 border border-teal-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Next Appointment</h3>
                <p className="text-gray-300">Peter Mukamuri - General Consultation</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{stats.nextAppointment}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Today</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">View Details</Button>
                <Button size="sm">Start Consultation</Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StaffDashboard;