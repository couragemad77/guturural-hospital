import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Search, UserPlus, Clock, CheckCircle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Appointment, QueueItem } from '../../types';

const PatientCheckIn: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  useEffect(() => {
    if (showQRScanner) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          handleQRScan(decodedText);
          scanner.clear();
          setShowQRScanner(false);
        },
        (error) => {
          console.log('QR scan error:', error);
        }
      );

      return () => {
        scanner.clear();
      };
    }
  }, [showQRScanner]);

  const fetchTodayAppointments = async () => {
    try {
      const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
      const today = new Date().toDateString();
      
      const todayAppointments = appointmentsSnapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id }))
        .filter(apt => new Date(apt.appointmentDate).toDateString() === today) as Appointment[];
      
      setAppointments(todayAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleQRScan = async (qrCode: string) => {
    const appointment = appointments.find(apt => apt.qrCode === qrCode);
    if (appointment) {
      await checkInPatient(appointment);
    } else {
      alert('Invalid QR code or appointment not found');
    }
  };

  const checkInPatient = async (appointment: Appointment) => {
    setLoading(true);
    try {
      // Update appointment status
      await updateDoc(doc(db, 'appointments', appointment.id), {
        status: 'checked-in'
      });

      // Add to queue
      const queueItem: Omit<QueueItem, 'id'> = {
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        patientName: `Patient ${appointment.patientId}`, // You'd get this from patient data
        department: appointment.department,
        priority: appointment.priority,
        estimatedTime: 15,
        status: 'waiting',
        checkedInAt: new Date(),
        position: await getNextQueuePosition(appointment.department)
      };

      await addDoc(collection(db, 'queue'), queueItem);
      await fetchTodayAppointments();
      
      alert('Patient checked in successfully!');
    } catch (error) {
      console.error('Error checking in patient:', error);
      alert('Error checking in patient');
    } finally {
      setLoading(false);
    }
  };

  const getNextQueuePosition = async (department: string): Promise<number> => {
    const queueSnapshot = await getDocs(collection(db, 'queue'));
    const departmentQueue = queueSnapshot.docs
      .map(doc => doc.data())
      .filter(item => item.department === department && item.status === 'waiting');
    
    return departmentQueue.length + 1;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-400 bg-blue-400/20';
      case 'checked-in': return 'text-green-400 bg-green-400/20';
      case 'in-consultation': return 'text-yellow-400 bg-yellow-400/20';
      case 'completed': return 'text-gray-400 bg-gray-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Patient Check-In</h1>
        <p className="text-gray-400">Check in patients for their appointments</p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="text-center" hover>
          <QrCode className="w-12 h-12 text-teal-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">QR Code Scanner</h3>
          <p className="text-gray-400 mb-4">Scan patient QR codes for quick check-in</p>
          <Button 
            onClick={() => setShowQRScanner(true)}
            icon={QrCode}
            fullWidth
          >
            Start Scanner
          </Button>
        </Card>

        <Card className="text-center" hover>
          <Search className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Manual Search</h3>
          <p className="text-gray-400 mb-4">Search and check in patients manually</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
            />
          </div>
        </Card>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-white mb-4">Scan QR Code</h3>
            <div id="qr-reader" className="mb-4"></div>
            <Button 
              variant="secondary" 
              onClick={() => setShowQRScanner(false)}
              fullWidth
            >
              Cancel
            </Button>
          </motion.div>
        </div>
      )}

      {/* Today's Appointments */}
      <Card title="Today's Appointments" icon={Clock}>
        <div className="space-y-3">
          {filteredAppointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-purple-600 rounded-full flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Patient ID: {appointment.patientId}</p>
                  <p className="text-gray-400 text-sm">{appointment.department}</p>
                  <p className="text-gray-400 text-sm">{appointment.timeSlot}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
                {appointment.status === 'scheduled' && (
                  <Button
                    size="sm"
                    onClick={() => checkInPatient(appointment)}
                    loading={loading}
                    icon={CheckCircle}
                  >
                    Check In
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
          
          {filteredAppointments.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No appointments found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PatientCheckIn;