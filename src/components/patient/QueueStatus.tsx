import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { QueueItem, Appointment } from '../../types';
import { QrCode, User, Clock, Stethoscope, Hash } from 'lucide-react';

const QueueStatus: React.FC = () => {
  const { currentUser } = useAuth();
  const [queueItem, setQueueItem] = useState<QueueItem | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setError("Please log in to see your queue status.");
      return;
    }

    const q = query(collection(db, 'queue'), where('patientId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      setLoading(true);
      if (!querySnapshot.empty) {
        const queueDoc = querySnapshot.docs[0];
        const queueData = { id: queueDoc.id, ...queueDoc.data() } as QueueItem;
        setQueueItem(queueData);

        try {
          const apptDocRef = doc(db, 'appointments', queueData.appointmentId);
          const apptDocSnap = await getDoc(apptDocRef);
          if (apptDocSnap.exists()) {
            setAppointment({ id: apptDocSnap.id, ...apptDocSnap.data() } as Appointment);
          } else {
            setError('Could not find the corresponding appointment details.');
          }
        } catch (err) {
            setError('Failed to fetch appointment details.');
        }
      } else {
        setQueueItem(null);
        setAppointment(null);
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError('Failed to listen for queue updates.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="ml-4 text-lg">Loading your queue status...</p>
        </div>
      );
    }

    if (error) {
      return <div className="bg-red-500 text-white p-4 rounded-md text-center">{error}</div>;
    }

    if (!queueItem) {
      return (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">You are not in a queue.</h2>
          <p className="text-gray-400">Book an appointment to get your queue number.</p>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-teal-400 mb-2">Your Position in Queue</h2>
            <p className="text-6xl font-bold flex items-center"><Hash className="h-12 w-12 mr-2" />{queueItem.position}</p>
          </div>
          <div className="space-y-3">
            <p className="flex items-center text-lg"><Stethoscope className="h-6 w-6 mr-3 text-teal-400" /> Department: <span className="font-semibold ml-2">{queueItem.department}</span></p>
            <p className="flex items-center text-lg"><User className="h-6 w-6 mr-3 text-teal-400" /> Doctor: <span className="font-semibold ml-2">{queueItem.doctorName || 'N/A'}</span></p>
            <p className="flex items-center text-lg"><Clock className="h-6 w-6 mr-3 text-teal-400" /> Status: <span className="font-semibold ml-2 capitalize bg-yellow-500 text-gray-900 px-2 py-1 rounded">{queueItem.status}</span></p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center bg-gray-700 p-6 rounded-lg">
           <h3 className="text-xl font-bold mb-4 flex items-center"><QrCode className="mr-2"/>Your Appointment QR Code</h3>
           {appointment?.qrCode ? (
             <img src={appointment.qrCode} alt="Appointment QR Code" className="w-64 h-64 rounded-md bg-white p-2" />
           ) : (
             <div className="w-64 h-64 bg-gray-600 flex items-center justify-center rounded-md">
                <p>QR Code not available.</p>
             </div>
           )}
           <p className="mt-4 text-gray-400 text-sm">Present this code at the reception.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-teal-400">Live Queue Status</h1>
      {renderContent()}
    </div>
  );
};

export default QueueStatus;
