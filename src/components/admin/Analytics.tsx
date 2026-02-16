import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Appointment } from '../../types';
import { BarChart as BarChartIcon, Calendar, PieChart as PieChartIcon, Users } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

interface AnalyticsData {
  totalAppointments: number;
  statusCounts: { name: string; value: number }[];
  departmentCounts: { name: string; value: number }[];
}

// Colors for the charts, fitting the neon theme
const COLORS = ['#00f5d4', '#9b5de5', '#f72585', '#3a0ca3', '#4cc9f0'];

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
        const appointments = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));

        const totalAppointments = appointments.length;

        const statusCounts = appointments.reduce((acc, appt) => {
          acc[appt.status] = (acc[appt.status] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        const departmentCounts = appointments.reduce((acc, appt) => {
          acc[appt.department] = (acc[appt.department] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        setAnalytics({
          totalAppointments,
          statusCounts: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
          departmentCounts: Object.entries(departmentCounts).map(([name, value]) => ({ name, value })),
        });
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to fetch analytics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        <p className="ml-4 text-lg text-white">Loading Analytics...</p>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-900 border border-red-500 text-white p-4 rounded-md text-center">{error}</div>;
  }

  if (!analytics) {
    return <div className="text-center text-white">No analytics data available.</div>;
  }

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-teal-400">Hospital Analytics Dashboard</h1>

      {/* Top Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 mr-4 text-teal-400"/>
            <div>
              <p className="text-sm text-gray-400">Total Appointments</p>
              <p className="text-3xl font-bold">{analytics.totalAppointments}</p>
            </div>
          </div>
        </div>
        {/* Other top-level stats can go here */}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown Pie Chart */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center"><PieChartIcon className="mr-2 text-purple-400" />Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.statusCounts}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {analytics.statusCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
                itemStyle={{ color: '#f5f5f5' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Department Breakdown Bar Chart */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center"><BarChartIcon className="mr-2 text-indigo-400" />Appointments by Department</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.departmentCounts}>
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
                itemStyle={{ color: '#f5f5f5' }}
                cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
              />
              <Legend />
              <Bar dataKey="value" fill="#00f5d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
