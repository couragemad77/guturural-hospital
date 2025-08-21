import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, FileText, Clock, Phone, Mail } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Patient, Appointment } from '../../types';

const MyPatients: React.FC = () => {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchMyPatients();
    }
  }, [currentUser]);

  const fetchMyPatients = async () => {
    try {
      // Fetch appointments for this doctor/nurse
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('doctorId', '==', currentUser?.uid)
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentsData = appointmentsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Appointment[];

      setAppointments(appointmentsData);

      // Get unique patient IDs
      const patientIds = [...new Set(appointmentsData.map(apt => apt.patientId))];

      // Fetch patient details
      if (patientIds.length > 0) {
        const patientsSnapshot = await getDocs(collection(db, 'patients'));
        const patientsData = patientsSnapshot.docs
          .map(doc => ({ ...doc.data(), id: doc.id }))
          .filter(patient => patientIds.includes(patient.id)) as Patient[];
        
        setPatients(patientsData);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPatientAppointments = (patientId: string) => {
    return appointments.filter(apt => apt.patientId === patientId);
  };

  const getLastAppointment = (patientId: string) => {
    const patientAppointments = getPatientAppointments(patientId);
    return patientAppointments
      .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())[0];
  };

  const filteredPatients = patients.filter(patient =>
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">My Patients</h1>
        <p className="text-gray-400">Manage your assigned patients and their medical records</p>
      </motion.div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
          />
        </div>
      </Card>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => {
          const lastAppointment = getLastAppointment(patient.id);
          const totalAppointments = getPatientAppointments(patient.id).length;

          return (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card hover className="cursor-pointer" onClick={() => setSelectedPatient(patient)}>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-white">
                      {patient.firstName[0]}{patient.lastName[0]}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {patient.firstName} {patient.lastName}
                  </h3>
                  <p className="text-gray-400 text-sm">{patient.email}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Age:</span>
                    <span className="text-white">
                      {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Visits:</span>
                    <span className="text-teal-400 font-medium">{totalAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Visit:</span>
                    <span className="text-white">
                      {lastAppointment 
                        ? new Date(lastAppointment.appointmentDate).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <Button size="sm" fullWidth variant="outline">
                    View Details
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredPatients.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Patients Found</h3>
            <p className="text-gray-400">
              {searchTerm ? 'No patients match your search criteria.' : 'You have no assigned patients yet.'}
            </p>
          </div>
        </Card>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Patient Details</h3>
              <Button variant="secondary" onClick={() => setSelectedPatient(null)}>
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                  Personal Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-sm">Full Name</label>
                    <p className="text-white">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Date of Birth</label>
                    <p className="text-white">{selectedPatient.dateOfBirth}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-white">{selectedPatient.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-white">{selectedPatient.email}</span>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Address</label>
                    <p className="text-white">{selectedPatient.address}</p>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                  Medical Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-sm">Medical History</label>
                    <div className="space-y-1">
                      {selectedPatient.medicalHistory.map((item, index) => (
                        <p key={index} className="text-white text-sm">• {item}</p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Allergies</label>
                    <div className="space-y-1">
                      {selectedPatient.allergies.map((allergy, index) => (
                        <span key={index} className="inline-block bg-red-600/20 text-red-400 px-2 py-1 rounded text-xs mr-2 mb-1">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedPatient.insurance && (
                    <div>
                      <label className="text-gray-400 text-sm">Insurance</label>
                      <p className="text-white">{selectedPatient.insurance.provider}</p>
                      <p className="text-gray-400 text-sm">{selectedPatient.insurance.policyNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Name</label>
                  <p className="text-white">{selectedPatient.emergencyContact.name}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Phone</label>
                  <p className="text-white">{selectedPatient.emergencyContact.phone}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Relationship</label>
                  <p className="text-white">{selectedPatient.emergencyContact.relationship}</p>
                </div>
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4">Recent Appointments</h4>
              <div className="space-y-2">
                {getPatientAppointments(selectedPatient.id)
                  .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
                  .slice(0, 5)
                  .map((appointment) => (
                    <div key={appointment.id} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{appointment.department}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.timeSlot}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        appointment.status === 'completed' ? 'text-green-400 bg-green-400/20' :
                        appointment.status === 'cancelled' ? 'text-red-400 bg-red-400/20' :
                        'text-yellow-400 bg-yellow-400/20'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyPatients;