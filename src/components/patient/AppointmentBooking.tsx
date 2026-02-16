import React, { useState, useEffect } from 'react';
import { db, auth } from '../../config/firebase';
import { collection, getDocs, query, where, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { Department, User as Doctor } from '../../types';
import { Calendar, Clock, Stethoscope, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import QRCode from 'qrcode';

const AppointmentBooking: React.FC = () => {
  const { currentUser } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'departments'));
        const depts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
        setDepartments(depts);
      } catch (err) {
        setError('Failed to fetch departments.');
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      const fetchDoctors = async () => {
        try {
          const q = query(collection(db, 'users'), where('role', '==', 'doctor'), where('department', '==', selectedDepartment));
          const querySnapshot = await getDocs(q);
          const docs = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as Doctor));
          setDoctors(docs);
          setSelectedDoctor('');
        } catch (err) {
          setError('Failed to fetch doctors for the selected department.');
        }
      };
      fetchDoctors();
    } else {
      setDoctors([]);
    }
  }, [selectedDepartment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentUser) {
      setError('You must be logged in to book an appointment.');
      return;
    }

    if (!selectedDepartment || !selectedDoctor || !appointmentDate || !appointmentTime) {
      setError('Please fill out all required fields.');
      return;
    }

    try {
      // 1. Create Appointment
      const appointmentDateObj = new Date(`${appointmentDate}T${appointmentTime}`);
      const appointmentRef = await addDoc(collection(db, 'appointments'), {
        patientId: currentUser.uid,
        doctorId: selectedDoctor,
        department: selectedDepartment,
        appointmentDate: appointmentDateObj,
        timeSlot: appointmentTime,
        status: 'scheduled',
        symptoms,
        priority,
        createdAt: new Date(),
      });

      // 2. Generate QR Code
      const qrCodeDataUrl = await QRCode.toDataURL(appointmentRef.id);
      await updateDoc(appointmentRef, { qrCode: qrCodeDataUrl });

      // 3. Create Queue Item
      const doctorDoc = await getDoc(doc(db, 'users', selectedDoctor));
      const patientDoc = await getDoc(doc(db, 'users', currentUser.uid));

      const doctorName = doctorDoc.data()?.displayName || 'N/A';
      const patientName = patientDoc.data()?.displayName || 'Anonymous';

      const q = query(collection(db, 'queue'), where('department', '==', selectedDepartment));
      const queueSnapshot = await getDocs(q);
      const position = queueSnapshot.size + 1;


      await addDoc(collection(db, 'queue'), {
        appointmentId: appointmentRef.id,
        patientId: currentUser.uid,
        patientName: patientName,
        department: selectedDepartment,
        doctorName: doctorName,
        priority,
        status: 'waiting',
        checkedInAt: new Date(),
        position: position
      });

      // 4. Notify User and Reset Form
      setSuccess(`Appointment booked successfully! You are number ${position} in the queue.`);
      setSelectedDepartment('');
      setSelectedDoctor('');
      setAppointmentDate('');
      setAppointmentTime('');
      setSymptoms('');
      setPriority('normal');

    } catch (err) {
      console.error(err);
      setError('Failed to book appointment. Please try again.');
    }
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  ];

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-teal-400">Book an Appointment</h1>

      {error && <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>}
      {success && <div className="bg-green-500 text-white p-3 rounded-md mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Department Selection */}
          <div className="flex flex-col">
            <label htmlFor="department" className="mb-2 font-semibold flex items-center"><Stethoscope className="mr-2 h-5 w-5" />Department</label>
            <select
              id="department"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            >
              <option value="">Select a Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Doctor Selection */}
          <div className="flex flex-col">
            <label htmlFor="doctor" className="mb-2 font-semibold flex items-center"><UserIcon className="mr-2 h-5 w-5" />Doctor</label>
            <select
              id="doctor"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              disabled={!selectedDepartment || doctors.length === 0}
              required
            >
              <option value="">{selectedDepartment ? 'Select a Doctor' : 'Select a department first'}</option>
              {doctors.map(doc => (
                <option key={doc.uid} value={doc.uid}>{doc.displayName || 'N/A'}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Selection */}
          <div className="flex flex-col">
            <label htmlFor="date" className="mb-2 font-semibold flex items-center"><Calendar className="mr-2 h-5 w-5" />Date</label>
            <input
              type="date"
              id="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          {/* Time Slot Selection */}
          <div className="flex flex-col">
             <label htmlFor="time" className="mb-2 font-semibold flex items-center"><Clock className="mr-2 h-5 w-5" />Time Slot</label>
             <select
                id="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              >
                <option value="">Select a time slot</option>
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
          </div>
        </div>

        {/* Symptoms */}
        <div className="flex flex-col">
          <label htmlFor="symptoms" className="mb-2 font-semibold">Symptoms / Reason for Visit</label>
          <textarea
            id="symptoms"
            rows={4}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            placeholder="Briefly describe your symptoms..."
          ></textarea>
        </div>

        {/* Priority */}
        <div className="flex flex-col">
          <label htmlFor="priority" className="mb-2 font-semibold">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'normal' | 'high' | 'urgent')}
            className="p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="normal">Normal</option>
            <option value="low">Low</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Request Appointment
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentBooking;
