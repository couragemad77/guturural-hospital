import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userRole: User | null;
  login: (email: string, password: string) => Promise<void>;
  createDemoAccount: (email: string, password: string, role: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const createDemoAccount = async (email: string, password: string, role: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update the user's display name
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      const userData: User = {
        uid: user.uid,
        email: user.email!,
        role: role as any,
        displayName,
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      
      return userData;
    } catch (error: any) {
      // If user already exists, just try to sign in
      if (error.code === 'auth/email-already-in-use') {
        await signInWithEmailAndPassword(auth, email, password);
        return;
      }
      throw error;
    }
  };
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      // If user doesn't exist and it's a demo account, create it
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        const demoAccounts = [
          { email: 'admin@gutu.com', password: 'admin123', role: 'admin', displayName: 'Admin User' },
          { email: 'reception@gutu.com', password: 'recept123', role: 'receptionist', displayName: 'Reception Staff' },
          { email: 'doctor@gutu.com', password: 'doctor123', role: 'doctor', displayName: 'Dr. Sarah Mukamuri' },
          { email: 'nurse@gutu.com', password: 'nurse123', role: 'nurse', displayName: 'Nurse Mary' },
          { email: 'patient@gutu.com', password: 'patient123', role: 'patient', displayName: 'John Mutasa' }
        ];
        
        const demoAccount = demoAccounts.find(acc => acc.email === email && acc.password === password);
        if (demoAccount) {
          await createDemoAccount(email, password, demoAccount.role, demoAccount.displayName);
          return;
        }
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserPassword = async (newPassword: string) => {
    if (currentUser) {
      await updatePassword(currentUser, newPassword);
    }
  };

  const updateUserProfile = async (displayName: string) => {
    if (currentUser) {
      await updateProfile(currentUser, { displayName });
      
      // Also update Firestore document
      if (userRole) {
        await setDoc(doc(db, 'users', currentUser.uid), {
          ...userRole,
          displayName
        }, { merge: true });
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data() as User);
          } else {
            // If user document doesn't exist, create a basic one
            const userData: User = {
              uid: user.uid,
              email: user.email!,
              role: 'patient', // default role
              displayName: user.displayName || 'User',
              createdAt: new Date()
            };
            await setDoc(doc(db, 'users', user.uid), userData);
            setUserRole(userData);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    createDemoAccount,
    logout,
    updateUserPassword,
    updateUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};