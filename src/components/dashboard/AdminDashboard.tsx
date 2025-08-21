import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '../ui/Card';
import { db } from '../../config/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { Appointment, User } from '../../types';

interface AdminStats {
  totalPatients: number;
  activeAppointments: number;
  completedToday: number;
  totalStaff: number;
  avgWaitTime: string; // Placeholder
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all users and appointments concurrently
        const [usersSnapshot, appointmentsSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'appointments'))
        ]);

        const users = usersSnapshot.docs.map(doc => doc.data() as User);
        const appointments = appointmentsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Appointment));

        // --- Calculate Key Stats ---
        const totalPatients = users.filter(u => u.role === 'patient').length;
        const totalStaff = users.filter(u => u.role !== 'patient').length;
        const activeAppointments = appointments.filter(a => a.status === 'scheduled' || a.status === 'in-consultation').length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const completedToday = appointments.filter(a =>
          a.status === 'completed' &&
          (a.appointmentDate as unknown as Timestamp).toDate() >= today &&
          (a.appointmentDate as unknown as Timestamp).toDate() < tomorrow
        ).length;

        setStats({
          totalPatients,
          activeAppointments,
          completedToday,
          totalStaff,
          avgWaitTime: '18 min' // Placeholder
        });

        // --- Process Chart Data ---
        const departmentCounts = appointments.reduce((acc, appt) => {
          acc[appt.department] = (acc[appt.department] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        const departmentChartData = Object.entries(departmentCounts).map(([name, value], index) => ({
          name,
          value,
          color: ['#14B8A6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'][index % 5]
        }));
        setDepartmentData(departmentChartData);

        // --- Process Recent Activity (Simplified) ---
        const sortedAppointments = appointments.sort((a, b) =>
          (b.createdAt as unknown as Timestamp).toMillis() - (a.createdAt as unknown as Timestamp).toMillis()
        ).slice(0, 5);

        const activityFeed = sortedAppointments.map(a => ({
          id: a.id,
          action: `Appointment ${a.status}`,
          user: `Patient ID: ${a.patientId.substring(0, 8)}...`,
          time: `${Math.floor((Date.now() - (a.createdAt as unknown as Timestamp).toMillis()) / 60000)} min ago`,
          type: a.status === 'completed' ? 'success' : a.status === 'cancelled' ? 'warning' : 'info'
        }));
        setRecentActivity(activityFeed);

      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        <p className="ml-4 text-lg text-white">Loading Dashboard Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Live hospital overview and system analytics</p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card gradient hover className="text-center">
          <Users className="w-8 h-8 text-teal-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{stats.totalPatients}</div>
          <p className="text-gray-400">Total Patients</p>
        </Card>
        <Card gradient hover className="text-center">
          <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{stats.activeAppointments}</div>
          <p className="text-gray-400">Active Appointments</p>
        </Card>
        <Card gradient hover className="text-center">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{stats.completedToday}</div>
          <p className="text-gray-400">Completed Today</p>
        </Card>
        <Card gradient hover className="text-center">
          <Clock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{stats.avgWaitTime}</div>
          <p className="text-gray-400">Avg Wait Time</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <Card title="Department Distribution" icon={Activity}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={departmentData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity" icon={Activity}>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg">
                <div className="p-1 bg-gray-600 rounded-full">{getActivityIcon(activity.type)}</div>
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
    </div>
  );
};

export default AdminDashboard;