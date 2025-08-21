import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, User, Stethoscope, Pill } from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface MedicalRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: Date;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  prescription: string;
  notes: string;
  followUp: string;
}

const MedicalRecords: React.FC = () => {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchMedicalRecords();
    }
  }, [currentUser]);

  const fetchMedicalRecords = async () => {
    try {
      // First, get patient ID from patients collection
      const patientsSnapshot = await getDocs(collection(db, 'patients'));
      const patient = patientsSnapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id }))
        .find(p => p.userId === currentUser?.uid);

      if (!patient) {
        setLoading(false);
        return;
      }

      // Fetch consultation records for this patient
      const consultationsQuery = query(
        collection(db, 'consultations'),
        where('patientId', '==', patient.id),
        orderBy('createdAt', 'desc')
      );
      
      const consultationsSnapshot = await getDocs(consultationsQuery);
      const consultationsData = consultationsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().createdAt.toDate()
      })) as MedicalRecord[];

      // Get doctor names
      const doctorIds = [...new Set(consultationsData.map(c => c.doctorId))];
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const doctors = usersSnapshot.docs
        .map(doc => ({ ...doc.data(), uid: doc.id }))
        .filter(user => doctorIds.includes(user.uid));

      // Add doctor names to records
      const recordsWithDoctors = consultationsData.map(record => ({
        ...record,
        doctorName: doctors.find(d => d.uid === record.doctorId)?.displayName || 'Unknown Doctor'
      }));

      setRecords(recordsWithDoctors);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadRecord = (record: MedicalRecord) => {
    const content = `
MEDICAL RECORD
==============

Patient: ${currentUser?.displayName || 'Patient'}
Date: ${record.date.toLocaleDateString()}
Doctor: ${record.doctorName}
Department: ${record.department}

SYMPTOMS:
${record.symptoms}

DIAGNOSIS:
${record.diagnosis}

TREATMENT:
${record.treatment}

PRESCRIPTION:
${record.prescription}

NOTES:
${record.notes}

FOLLOW-UP:
${record.followUp}

Generated on: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-record-${record.date.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        <h1 className="text-3xl font-bold text-white mb-2">Medical Records</h1>
        <p className="text-gray-400">View and download your medical consultation history</p>
      </motion.div>

      {records.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Medical Records</h3>
            <p className="text-gray-400">
              You don't have any medical records yet. Your consultation history will appear here after your appointments.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {records.map((record) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card hover className="cursor-pointer" onClick={() => setSelectedRecord(record)}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-teal-500/20 rounded-lg">
                      <FileText className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{record.department}</p>
                      <p className="text-gray-400 text-sm">{record.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadRecord(record);
                    }}
                    icon={Download}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">{record.doctorName}</span>
                  </div>
                  
                  {record.diagnosis && (
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Diagnosis</p>
                      <p className="text-white text-sm line-clamp-2">{record.diagnosis}</p>
                    </div>
                  )}

                  {record.prescription && (
                    <div className="flex items-start space-x-2">
                      <Pill className="w-4 h-4 text-purple-400 mt-0.5" />
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide">Prescription</p>
                        <p className="text-white text-sm line-clamp-2">{record.prescription}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <Button size="sm" fullWidth variant="outline">
                    View Details
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">Medical Record</h3>
                <p className="text-gray-400">{selectedRecord.date.toLocaleDateString()}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => downloadRecord(selectedRecord)}
                  icon={Download}
                >
                  Download
                </Button>
                <Button variant="secondary" onClick={() => setSelectedRecord(null)}>
                  Close
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Consultation Details */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                  Consultation Details
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-teal-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Date</p>
                      <p className="text-white">{selectedRecord.date.toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Doctor</p>
                      <p className="text-white">{selectedRecord.doctorName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Stethoscope className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Department</p>
                      <p className="text-white">{selectedRecord.department}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                  Medical Information
                </h4>

                {selectedRecord.symptoms && (
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-2">Symptoms</p>
                    <p className="text-white bg-gray-700/30 p-3 rounded-lg">{selectedRecord.symptoms}</p>
                  </div>
                )}

                {selectedRecord.diagnosis && (
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-2">Diagnosis</p>
                    <p className="text-white bg-gray-700/30 p-3 rounded-lg">{selectedRecord.diagnosis}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Treatment and Prescription */}
            <div className="mt-6 space-y-4">
              {selectedRecord.treatment && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Treatment Plan</h4>
                  <p className="text-white bg-gray-700/30 p-4 rounded-lg">{selectedRecord.treatment}</p>
                </div>
              )}

              {selectedRecord.prescription && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2 flex items-center space-x-2">
                    <Pill className="w-5 h-5 text-purple-400" />
                    <span>Prescription</span>
                  </h4>
                  <p className="text-white bg-purple-600/10 border border-purple-500/20 p-4 rounded-lg">
                    {selectedRecord.prescription}
                  </p>
                </div>
              )}

              {selectedRecord.notes && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Additional Notes</h4>
                  <p className="text-white bg-gray-700/30 p-4 rounded-lg">{selectedRecord.notes}</p>
                </div>
              )}

              {selectedRecord.followUp && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Follow-up Instructions</h4>
                  <p className="text-white bg-teal-600/10 border border-teal-500/20 p-4 rounded-lg">
                    {selectedRecord.followUp}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;