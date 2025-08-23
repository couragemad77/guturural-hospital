import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc, where, getDocs, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Department, QueueItem, Appointment } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Clock, Play, CheckCircle, ScanLine, ArrowRightLeft } from 'lucide-react';

// Define a type for queues grouped by department
interface GroupedQueues {
  [key: string]: QueueItem[];
}

const ManualCheckInModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [appointmentId, setAppointmentId] = useState('');
  const [foundAppointment, setFoundAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const handleSearch = async () => {
    setError('');
    if (!appointmentId.trim()) {
      setError('Please enter an appointment ID.');
      return;
    }
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      const docSnap = await getDoc(appointmentRef);
      if (docSnap.exists() && docSnap.data().status === 'scheduled') {
        setFoundAppointment({ id: docSnap.id, ...docSnap.data() } as Appointment);
      } else {
        setError('No scheduled appointment found with this ID.');
        setFoundAppointment(null);
      }
    } catch (err) { setError('Failed to search for appointment.'); }
  };

  const handleCheckIn = async () => {
    if (!foundAppointment) return;
    setIsCheckingIn(true);
    setError('');
    try {
      await updateDoc(doc(db, 'appointments', foundAppointment.id), { status: 'checked-in' });
      const patientDoc = await getDoc(doc(db, 'users', foundAppointment.patientId));
      const patientName = patientDoc.data()?.displayName || 'Anonymous';
      const q = query(collection(db, 'queue'), where('department', '==', foundAppointment.department));
      const queueSnapshot = await getDocs(q);
      const position = queueSnapshot.size + 1;
      await addDoc(collection(db, 'queue'), {
        appointmentId: foundAppointment.id,
        patientId: foundAppointment.patientId,
        patientName: patientName,
        department: foundAppointment.department,
        priority: foundAppointment.priority,
        status: 'waiting',
        checkedInAt: new Date(),
        position: position
      });
      onClose();
    } catch(err) {
      setError('Failed to check-in patient.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-teal-500">
        <h2 className="text-2xl font-bold text-teal-400 mb-4">Manual Patient Check-in</h2>
        <div className="flex gap-2 mb-4">
          <input type="text" value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} placeholder="Enter Appointment ID" className="flex-grow p-2 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-teal-500 focus:outline-none" />
          <button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-md font-semibold">Search</button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {foundAppointment && (
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="font-bold">Appointment Found:</h3>
            <p>Patient ID: {foundAppointment.patientId}</p>
            <p>Department: {foundAppointment.department}</p>
            <p>Time: {new Date(foundAppointment.appointmentDate.seconds * 1000).toLocaleString()}</p>
            <button onClick={handleCheckIn} disabled={isCheckingIn} className="w-full mt-4 bg-teal-600 hover:bg-teal-500 py-2 rounded-md font-bold disabled:bg-gray-500">{isCheckingIn ? 'Checking in...' : 'Confirm Check-in'}</button>
          </div>
        )}
        <button onClick={onClose} className="w-full mt-4 bg-gray-600 hover:bg-gray-500 py-2 rounded-md">Close</button>
      </div>
    </div>
  );
};

const MovePatientModal: React.FC<{ onClose: () => void; queueItem: QueueItem; departments: Department[] }> = ({ onClose, queueItem, departments }) => {
  const [targetDepartment, setTargetDepartment] = useState('');
  const [isMoving, setIsMoving] = useState(false);
  const [error, setError] = useState('');

  const handleMove = async () => {
    if (!targetDepartment) {
      setError('Please select a target department.');
      return;
    }
    setIsMoving(true);
    setError('');
    try {
      await updateDoc(doc(db, 'queue', queueItem.id), { department: targetDepartment });
      await updateDoc(doc(db, 'appointments', queueItem.appointmentId), { department: targetDepartment });
      onClose();
    } catch (err) {
      setError('Failed to move patient.');
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-purple-500">
        <h2 className="text-2xl font-bold text-purple-400 mb-4">Move Patient</h2>
        <p className="mb-4">Move <span className="font-bold">{queueItem.patientName}</span> from <span className="font-bold">{queueItem.department}</span> to:</p>
        <select value={targetDepartment} onChange={(e) => setTargetDepartment(e.target.value)} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:outline-none">
          <option value="">Select New Department</option>
          {departments.filter(d => d.name !== queueItem.department).map(d => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <div className="flex gap-4 mt-6">
          <button onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded-md">Cancel</button>
          <button onClick={handleMove} disabled={isMoving} className="flex-1 bg-purple-600 hover:bg-purple-500 py-2 rounded-md font-bold disabled:bg-gray-500">{isMoving ? 'Moving...' : 'Confirm Move'}</button>
        </div>
      </div>
    </div>
  );
};


const QueueManagement: React.FC = () => {
  const { userRole } = useAuth();
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [groupedQueues, setGroupedQueues] = useState<GroupedQueues>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [patientToMove, setPatientToMove] = useState<QueueItem | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'departments'), (snapshot) => {
      const depts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
      setAllDepartments(depts);
    }, (err) => setError("Failed to fetch departments."));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!userRole || !allDepartments.length) return;
    if (userRole.role === 'admin' || userRole.role === 'receptionist') setFilteredDepartments(allDepartments);
    else if (userRole.role === 'doctor' || userRole.role === 'nurse') {
      const userDept = allDepartments.find(d => d.name === userRole.department);
      setFilteredDepartments(userDept ? [userDept] : []);
    }
  }, [userRole, allDepartments]);

  useEffect(() => {
    const q = query(collection(db, 'queue'), orderBy('checkedInAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const queues = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          checkedInAt: (data.checkedInAt as any).toDate(),
        } as QueueItem;
      });
      const grouped = queues.reduce((acc, item) => {
        const deptName = item.department;
        if (!acc[deptName]) acc[deptName] = [];
        acc[deptName].push(item);
        return acc;
      }, {} as GroupedQueues);
      setGroupedQueues(grouped);
      setLoading(false);
    }, (err) => {
      setError("Failed to fetch queue data.");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (queueItemId: string, appointmentId: string, newStatus: 'in-consultation' | 'completed') => {
    try {
      const queueDocRef = doc(db, 'queue', queueItemId);
      const appointmentDocRef = doc(db, 'appointments', appointmentId);
      if (newStatus === 'in-consultation') {
        await updateDoc(queueDocRef, { status: newStatus });
        await updateDoc(appointmentDocRef, { status: newStatus });
      } else if (newStatus === 'completed') {
        await updateDoc(appointmentDocRef, { status: newStatus });
        await deleteDoc(queueDocRef);
      }
    } catch (err) { alert("Failed to update patient status."); }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div><p className="ml-4 text-lg text-white">Loading Live Queues...</p></div>;
  if (error) return <div className="bg-red-900 border border-red-500 text-white p-4 rounded-md text-center">{error}</div>;

  const isDoctorOrNurse = userRole?.role === 'doctor' || userRole?.role === 'nurse';
  const isReceptionistOrAdmin = userRole?.role === 'receptionist' || userRole?.role === 'admin';

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      {showCheckInModal && <ManualCheckInModal onClose={() => setShowCheckInModal(false)} />}
      {patientToMove && <MovePatientModal onClose={() => setPatientToMove(null)} queueItem={patientToMove} departments={allDepartments} />}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-teal-400">Live Patient Queues</h1>
        {isReceptionistOrAdmin && <button onClick={() => setShowCheckInModal(true)} className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md flex items-center transition-colors"><ScanLine className="w-5 h-5 mr-2" /> Manual Check-in</button>}
      </div>
      <div className={`grid grid-cols-1 ${filteredDepartments.length > 1 ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''} gap-6`}>
        {filteredDepartments.map(dept => (
          <div key={dept.id} className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 flex flex-col">
            <h2 className="text-xl font-bold p-4 border-b border-gray-700 text-purple-400">{dept.name} ({groupedQueues[dept.name]?.length || 0})</h2>
            <div className="p-4 space-y-4 overflow-y-auto">
              {groupedQueues[dept.name]?.length > 0 ? groupedQueues[dept.name].map(item => (
                <div key={item.id} className="bg-gray-700 p-4 rounded-lg shadow-md border border-gray-600 hover:border-teal-500 transition-colors">
                  <p className="font-bold text-lg flex items-center"><Users className="w-5 h-5 mr-2" />{item.patientName}</p>
                  <p className="text-sm text-gray-400 flex items-center mt-2"><Clock className="w-4 h-4 mr-2" />Checked in at: {item.checkedInAt.toLocaleTimeString()}</p>
                  <div className="mt-3 flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.priority === 'urgent' ? 'bg-red-500' : item.priority === 'high' ? 'bg-yellow-500 text-black' : 'bg-blue-500'}`}>{item.priority}</span>
                    <span className="text-sm font-semibold capitalize">{item.status}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-600 flex gap-2">
                    {isDoctorOrNurse && item.status === 'waiting' && <button onClick={() => handleUpdateStatus(item.id, item.appointmentId, 'in-consultation')} className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3 rounded-md text-sm flex items-center justify-center transition-colors"><Play className="w-4 h-4 mr-2"/> Start</button>}
                    {isDoctorOrNurse && item.status === 'in-consultation' && <button onClick={() => handleUpdateStatus(item.id, item.appointmentId, 'completed')} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-3 rounded-md text-sm flex items-center justify-center transition-colors"><CheckCircle className="w-4 h-4 mr-2"/> End</button>}
                    {isReceptionistOrAdmin && <button onClick={() => setPatientToMove(item)} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-3 rounded-md text-sm flex items-center justify-center transition-colors"><ArrowRightLeft className="w-4 h-4 mr-2"/> Move</button>}
                  </div>
                </div>
              )) : <p className="text-gray-500 text-center py-8">No patients in queue.</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueueManagement;
