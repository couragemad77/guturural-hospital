import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Card from '../ui/Card';

const AdminDashboard: React.FC = () => {
  const [stats] = useState({
    totalPatients: 156,
    activeAppointments: 32,
    completedToday: 87,
    cancelledToday: 5,
    totalStaff: 24,
    avgWaitTime: '15 min',
    patientSatisfaction: 4.6
  });

  const [chartData] = useState([
    { name: 'Mon', patients: 120, appointments: 95 },
    { name: 'Tue', patients: 145, appointments: 110 },
    { name: 'Wed', patients: 132, appointments: 98 },
    { name: 'Thu', patients: 167, appointments: 125 },
    { name: 'Fri', patients: 189, appointments: 142 },
    { name: 'Sat', patients: 98, appointments: 75 },
    { name: 'Sun', patients: 76, appointments: 58 }
  ]);

  const [departmentData] = useState([
    { name: 'General Medicine', value: 35, color: '#14B8A6' },
    { name: 'Emergency', value: 25, color: '#EF4444' },
    { name: 'Pediatrics', value: 20, color: '#8B5CF6' },
    { name: 'Maternity', value: 12, color: '#F59E0B' },
    { name: 'Dental', value: 8, color: '#06B6D4' }
  ]);

  const [recentActivity] = useState([
    { id: 1, action: 'New patient registered', user: 'John Mutasa', time: '5 min ago', type: 'success' },
    { id: 2, action: 'Appointment cancelled', user: 'Mary Chikwanha', time: '12 min ago', type: 'warning' },
    { id: 3, action: 'Emergency case assigned', user: 'Dr. Mukamuri', time: '18 min ago', type: 'urgent' },
    { id: 4, action: 'Queue updated', user: 'Reception', time: '25 min ago', type: 'info' },
    { id: 5, action: 'Report generated', user: 'System', time: '1 hour ago', type: 'success' }
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'urgent':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Hospital overview and system analytics</p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card gradient hover className="text-center">
          <Users className="w-8 h-8 text-teal-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{stats.totalPatients}</div>
          <p className="text-gray-400">Total Patients</p>
          <div className="flex items-center justify-center mt-2">
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400 text-sm">+12% this week</span>
          </div>
        </Card>

        <Card gradient hover className="text-center">
          <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{stats.activeAppointments}</div>
          <p className="text-gray-400">Active Appointments</p>
          <div className="flex items-center justify-center mt-2">
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400 text-sm">+5% today</span>
          </div>
        </Card>

        <Card gradient hover className="text-center">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{stats.completedToday}</div>
          <p className="text-gray-400">Completed Today</p>
          <div className="flex items-center justify-center mt-2">
            <span className="text-gray-400 text-sm">{stats.cancelledToday} cancelled</span>
          </div>
        </Card>

        <Card gradient hover className="text-center">
          <Clock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{stats.avgWaitTime}</div>
          <p className="text-gray-400">Avg Wait Time</p>
          <div className="flex items-center justify-center mt-2">
            <span className="text-green-400 text-sm">-3 min from yesterday</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trends */}
        <Card title="Weekly Patient Flow" className="col-span-1 lg:col-span-2">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Line 
                  type="monotone" 
                  dataKey="patients" 
                  stroke="#14B8A6" 
                  strokeWidth={3}
                  dot={{ fill: '#14B8A6', r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="appointments" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Department Distribution */}
        <Card title="Department Distribution" icon={Activity}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity" icon={Activity}>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg">
                <div className="p-1 bg-gray-600 rounded-full">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{activity.action}</p>
                  <p className="text-gray-400 text-xs">{activity.user}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Daily Performance */}
      <Card title="Today's Performance Summary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">94%</div>
            <p className="text-gray-400">Appointment Completion Rate</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-400 mb-2">{stats.patientSatisfaction}</div>
            <p className="text-gray-400">Patient Satisfaction Score</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{stats.totalStaff}</div>
            <p className="text-gray-400">Active Staff Members</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;