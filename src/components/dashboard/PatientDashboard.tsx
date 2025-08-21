import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, QrCode, FileText, Bell, MapPin } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const PatientDashboard: React.FC = () => {
  const [appointments] = useState([
    {
      id: '1',
      doctor: 'Dr. Sarah Mukamuri',
      department: 'General Medicine',
      date: '2025-01-15',
      time: '10:00 AM',
      status: 'scheduled',
      qrCode: 'QR123456'
    }
  ]);

  const [queueStatus] = useState({
    position: 3,
    estimatedWaitTime: '15 minutes',
    department: 'General Medicine',
    status: 'waiting'
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Patient Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's your health overview.</p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center" hover>
          <Calendar className="w-8 h-8 text-teal-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Book Appointment</h3>
          <Button size="sm" fullWidth>Schedule</Button>
        </Card>

        <Card className="text-center" hover>
          <Clock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Queue Status</h3>
          <Button size="sm" fullWidth variant="secondary">View</Button>
        </Card>

        <Card className="text-center" hover>
          <QrCode className="w-8 h-8 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Check-in</h3>
          <Button size="sm" fullWidth variant="outline">Scan QR</Button>
        </Card>

        <Card className="text-center" hover>
          <FileText className="w-8 h-8 text-orange-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Medical Records</h3>
          <Button size="sm" fullWidth variant="secondary">View</Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Queue Status */}
        <Card title="Current Queue Status" icon={Clock}>
          {queueStatus.status === 'waiting' ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-400 mb-2">
                  #{queueStatus.position}
                </div>
                <p className="text-gray-300">Your position in queue</p>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Department:</span>
                  <span className="text-white">{queueStatus.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimated Wait:</span>
                  <span className="text-teal-400 font-medium">{queueStatus.estimatedWaitTime}</span>
                </div>
              </div>

              <div className="bg-blue-600/20 border border-blue-500/50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Bell className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-400 font-medium">We'll notify you!</p>
                    <p className="text-sm text-gray-300">
                      You'll receive an alert when you're next in line.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No active queue status</p>
              <p className="text-sm text-gray-500 mt-2">
                Check in for your appointment to see queue information
              </p>
            </div>
          )}
        </Card>

        {/* Upcoming Appointments */}
        <Card title="Upcoming Appointments" icon={Calendar}>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-medium">{appointment.doctor}</h4>
                    <p className="text-gray-400 text-sm">{appointment.department}</p>
                  </div>
                  <span className="px-2 py-1 bg-teal-600/20 text-teal-400 text-xs rounded-full">
                    {appointment.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <QrCode className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button fullWidth variant="outline">
              Book New Appointment
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity" icon={FileText}>
        <div className="space-y-4">
          {[
            {
              action: 'Appointment booked',
              details: 'General Medicine - Dr. Sarah Mukamuri',
              time: '2 hours ago',
              icon: Calendar
            },
            {
              action: 'Medical form updated',
              details: 'Emergency contact information',
              time: '1 day ago',
              icon: FileText
            },
            {
              action: 'Check-in completed',
              details: 'Pediatrics Department',
              time: '3 days ago',
              icon: MapPin
            }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-gray-700/30 rounded-lg">
              <div className="p-2 bg-teal-500/20 rounded-lg">
                <activity.icon className="w-4 h-4 text-teal-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{activity.action}</p>
                <p className="text-gray-400 text-sm">{activity.details}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default PatientDashboard;