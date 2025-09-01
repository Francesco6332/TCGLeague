import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { User, UserType, Player, Store } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
    userType: UserType,
    bandaiMembershipId?: string,
    storeInfo?: Partial<Store>
  ) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile({
              id: user.uid,
              ...userData,
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
            } as User);
          } else {
            // If user document doesn't exist, create a basic profile
            const basicProfile = {
              id: user.uid,
              email: user.email || '',
              username: user.displayName || user.email?.split('@')[0] || 'User',
              userType: 'player' as const,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            setUserProfile(basicProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Set basic profile on error
          setUserProfile({
            id: user.uid,
            email: user.email || '',
            username: user.displayName || user.email?.split('@')[0] || 'User',
            userType: 'player' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (
    email: string,
    password: string,
    username: string,
    userType: UserType,
    bandaiMembershipId?: string,
    storeInfo?: Partial<Store>
  ) => {
    // Validate store info if registering as store
    if (userType === 'store' && (!storeInfo || !storeInfo.storeName)) {
      throw new Error('Store name is required for store registration');
    }

    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    const baseUserData = {
      email,
      username,
      userType,
      bandaiMembershipId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let userData: Partial<Player | Store>;

    console.log('Processing userType:', userType); // Debug
    
    if (userType === 'player') {
      userData = {
        ...baseUserData,
        userType: 'player', // Explicitly set userType
        participatingEvents: [],
        decks: [],
      } as Partial<Player>;
      console.log('Created PLAYER userData'); // Debug
    } else if (userType === 'store') {
      userData = {
        ...baseUserData,
        userType: 'store', // Explicitly set userType
        storeName: storeInfo?.storeName || '',
        address: storeInfo?.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        phone: storeInfo?.phone,
        website: storeInfo?.website,
        description: storeInfo?.description,
        organizedEvents: [],
      } as Partial<Store>;
      console.log('Created STORE userData'); // Debug
    } else {
      throw new Error(`Invalid user type: ${userType}`);
    }

    console.log('Saving user data:', userData); // Debug log
    try {
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('✅ User data saved successfully to Firestore'); // Debug
    } catch (firestoreError) {
      console.error('❌ Failed to save user data to Firestore:', firestoreError);
      throw firestoreError;
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    currentUser,
    userProfile,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
