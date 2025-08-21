import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Clock, User, FileText, Save, CheckCircle } from 'lucide-react';
import { collection, getDocs, query, where, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Appointment, Patient } from '../../types';

interface ConsultationNote {
  id?: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  prescription: string;
  notes: string;
  followUp: string;
  createdAt: Date;
}

const Consultations: React.FC = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [consultationNote, setConsultationNote] = useState<Partial<ConsultationNote>>({
    symptoms: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    notes: '',
    followUp: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchTodayConsultations();
    }
  }, [currentUser]);

  const fetchTodayConsultations = async () => {
    try {
      const today = new Date().toDateString();
      
      // Fetch today's appointments for this doctor
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('doctorId', '==', currentUser?.uid)
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentsData = appointmentsSnapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id }))
        .filter(apt => new Date(apt.appointmentDate).toDateString() === today) as Appointment[];

      setAppointments(appointmentsData);

      // Fetch patient details
      const patientIds = [...new Set(appointmentsData.map(apt => apt.patientId))];
      if (patientIds.length > 0) {
        const patientsSnapshot = await getDocs(collection(db, 'patients'));
        const patientsData = patientsSnapshot.docs
          .map(doc => ({ ...doc.data(), id: doc.id }))
          .filter(patient => patientIds.includes(patient.id)) as Patient[];
        
        setPatients(patientsData);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPatientById = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };

  const handleStartConsultation = async (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    
    // Update appointment status to in-consultation
    try {
      await updateDoc(doc(db, 'appointments', appointment.id), {
        status: 'in-consultation'
      });
      
      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt.id === appointment.id ? { ...apt, status: 'in-consultation' } : apt
      ));
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const handleSaveConsultation = async () => {
    if (!selectedAppointment || !currentUser) return;

    setSaving(true);
    try {
      // Save consultation notes
      const consultationData: Omit<ConsultationNote, 'id'> = {
        appointmentId: selectedAppointment.id,
        patientId: selectedAppointment.patientId,
        doctorId: currentUser.uid,
        symptoms: consultationNote.symptoms || '',
        diagnosis: consultationNote.diagnosis || '',
        treatment: consultationNote.treatment || '',
        prescription: consultationNote.prescription || '',
        notes: consultationNote.notes || '',
        followUp: consultationNote.followUp || '',
        createdAt: new Date()
      };

      await addDoc(collection(db, 'consultations'), consultationData);

      // Update appointment status to completed
      await updateDoc(doc(db, 'appointments', selectedAppointment.id), {
        status: 'completed'
      });

      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt.id === selectedAppointment.id ? { ...apt, status: 'completed' } : apt
      ));

      // Reset form
      setConsultationNote({
        symptoms: '',
        diagnosis: '',
        treatment: '',
        prescription: '',
        notes: '',
        followUp: ''
      });
      setSelectedAppointment(null);

      alert('Consultation saved successfully!');
    } catch (error) {
      console.error('Error saving consultation:', error);
      alert('Error saving consultation');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-400 bg-blue-400/20';
      case 'checked-in': return 'text-yellow-400 bg-yellow-400/20';
      case 'in-consultation': return 'text-green-400 bg-green-400/20';
      case 'completed': return 'text-gray-400 bg-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

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
        <h1 className="text-3xl font-bold text-white mb-2">Consultations</h1>
        <p className="text-gray-400">Manage patient consultations and medical records</p>
      </motion.div>

      {/* Today's Consultations */}
      <Card title="Today's Consultations" icon={Stethoscope}>
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const patient = getPatientById(appointment.patientId);
            
            return (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {patient ? `${patient.firstName} ${patient.lastName}` : `Patient ${appointment.patientId}`}
                    </p>
                    <p className="text-gray-400 text-sm">{appointment.department}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.timeSlot}</span>
                      </div>
                      {appointment.symptoms && (
                        <span>Symptoms: {appointment.symptoms}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                  {appointment.status === 'checked-in' && (
                    <Button
                      size="sm"
                      onClick={() => handleStartConsultation(appointment)}
                      icon={Stethoscope}
                    >
                      Start Consultation
                    </Button>
                  )}
                  {appointment.status === 'in-consultation' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedAppointment(appointment)}
                      icon={FileText}
                    >
                      Continue
                    </Button>
                  )}
                  {appointment.status === 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      icon={CheckCircle}
                      disabled
                    >
                      Completed
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}

          {appointments.length === 0 && (
            <div className="text-center py-8">
              <Stethoscope className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No consultations scheduled for today</p>
            </div>
          )}
        </div>
      </Card>

      {/* Consultation Form Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">Consultation Notes</h3>
                <p className="text-gray-400">
                  {(() => {
                    const patient = getPatientById(selectedAppointment.patientId);
                    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient ${selectedAppointment.patientId}`;
                  })()}
                </p>
              </div>
              <Button variant="secondary" onClick={() => setSelectedAppointment(null)}>
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Information */}
              <Card title="Patient Information">
                {(() => {
                  const patient = getPatientById(selectedAppointment.patientId);
                  if (!patient) return <p className="text-gray-400">Patient information not available</p>;
                  
                  return (
                    <div className="space-y-3">
                      <div>
                        <label className="text-gray-400 text-sm">Age</label>
                        <p className="text-white">
                          {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Medical History</label>
                        <div className="space-y-1">
                          {patient.medicalHistory.map((item, index) => (
                            <p key={index} className="text-white text-sm">• {item}</p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Allergies</label>
                        <div className="flex flex-wrap gap-1">
                          {patient.allergies.map((allergy, index) => (
                            <span key={index} className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-xs">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </Card>

              {/* Consultation Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Chief Complaint / Symptoms
                  </label>
                  <textarea
                    value={consultationNote.symptoms}
                    onChange={(e) => setConsultationNote(prev => ({ ...prev, symptoms: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 resize-none"
                    rows={3}
                    placeholder="Patient's main complaints and symptoms..."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Diagnosis
                  </label>
                  <textarea
                    value={consultationNote.diagnosis}
                    onChange={(e) => setConsultationNote(prev => ({ ...prev, diagnosis: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 resize-none"
                    rows={3}
                    placeholder="Medical diagnosis and assessment..."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Treatment Plan
                  </label>
                  <textarea
                    value={consultationNote.treatment}
                    onChange={(e) => setConsultationNote(prev => ({ ...prev, treatment: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 resize-none"
                    rows={3}
                    placeholder="Recommended treatment and procedures..."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Prescription
                  </label>
                  <textarea
                    value={consultationNote.prescription}
                    onChange={(e) => setConsultationNote(prev => ({ ...prev, prescription: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 resize-none"
                    rows={3}
                    placeholder="Medications and dosage instructions..."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={consultationNote.notes}
                    onChange={(e) => setConsultationNote(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 resize-none"
                    rows={2}
                    placeholder="Any additional observations or notes..."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Follow-up Instructions
                  </label>
                  <textarea
                    value={consultationNote.followUp}
                    onChange={(e) => setConsultationNote(prev => ({ ...prev, followUp: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 resize-none"
                    rows={2}
                    placeholder="Next appointment, monitoring instructions..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
              <Button
                variant="secondary"
                onClick={() => setSelectedAppointment(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveConsultation}
                loading={saving}
                icon={Save}
              >
                Save & Complete Consultation
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Consultations;