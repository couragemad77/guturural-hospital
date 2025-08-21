import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, QrCode, FileText, Bell, User } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { Appointment, QueueItem } from '../../types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const PatientDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queueItem, setQueueItem] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const unsubscribeAppointments = onSnapshot(
      query(collection(db, 'appointments'), where('patientId', '==', currentUser.uid), orderBy('appointmentDate', 'desc'), limit(5)),
      (snapshot) => {
        const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
        setAppointments(apps);
      }
    );

    const unsubscribeQueue = onSnapshot(
      query(collection(db, 'queue'), where('patientId', '==', currentUser.uid)),
      (snapshot) => {
        if (!snapshot.empty) {
          setQueueItem({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as QueueItem);
        } else {
          setQueueItem(null);
        }
      }
    );

    setLoading(false);

    return () => {
      unsubscribeAppointments();
      unsubscribeQueue();
    };
  }, [currentUser]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Patient Dashboard</h1>
        <p className="text-gray-400">Welcome back, {currentUser?.displayName || 'Patient'}! Here's your health overview.</p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/appointments">
            <Card className="text-center" hover>
                <Calendar className="w-8 h-8 text-teal-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Book Appointment</h3>
                <p className="text-xs text-gray-400">Schedule a new visit</p>
            </Card>
        </Link>
        <Link to="/queue">
            <Card className="text-center" hover>
                <Clock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Queue Status</h3>
                <p className="text-xs text-gray-400">View your current position</p>
            </Card>
        </Link>
        <Link to="/records">
            <Card className="text-center" hover>
                <FileText className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Medical Records</h3>
                <p className="text-xs text-gray-400">Access your history</p>
            </Card>
        </Link>
        <Link to="/settings">
            <Card className="text-center" hover>
                <User className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Profile</h3>
                <p className="text-xs text-gray-400">Update your information</p>
            </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Queue Status */}
        <Card title="Current Queue Status" icon={Clock}>
          {loading ? <p>Loading...</p> : queueItem ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-400 mb-2">
                  #{queueItem.position}
                </div>
                <p className="text-gray-300">Your position in queue</p>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Department:</span>
                  <span className="text-white">{queueItem.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Doctor:</span>
                  <span className="text-white">{queueItem.doctorName}</span>
                </div>
                 <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="font-semibold capitalize bg-yellow-500 text-gray-900 px-2 py-1 rounded">{queueItem.status}</span>
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
        <Card title="Recent Appointments" icon={Calendar}>
          <div className="space-y-4">
            {loading ? <p>Loading...</p> : appointments.length > 0 ? (
                appointments.map((appointment) => (
              <div key={appointment.id} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-medium">{appointment.department}</h4>
                    <p className="text-gray-400 text-sm">Dr. {appointment.doctorId}</p>
                  </div>
                  <span className="px-2 py-1 bg-teal-600/20 text-teal-400 text-xs rounded-full">
                    {appointment.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(appointment.appointmentDate), 'PPP')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.timeSlot}</span>
                    </div>
                  </div>
                  {appointment.qrCode && (
                    <img src={appointment.qrCode} alt="QR" className="w-8 h-8 rounded-sm" />
                  )}
                </div>
              </div>
            ))
            ) : (
                <p className="text-gray-400 text-center py-4">No recent appointments found.</p>
            )}

            <Link to="/appointments" className="block w-full">
                <Button fullWidth variant="outline">
                Book New Appointment
                </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Activity - Removed hardcoded data */}
      <Card title="Recent Activity" icon={FileText}>
        <div className="text-center py-8">
            <p className="text-gray-400">Activity log is not yet available.</p>
        </div>
      </Card>
    </div>
  );
};

export default PatientDashboard;