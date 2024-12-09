// src/services/auth.ts
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { auth, storage, db } from '../config/firebase';

export const authService = {
  // Register new user
  async register(email: string, password: string, displayName: string, profileImage: string | null) {
      try {
          // Create user
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          // Ensure displayName is never empty
          const safeDisplayName = displayName.trim() || email.split('@')[0];

          // Upload profile image if provided
          let photoURL = null;
          if (profileImage) {
              const imageRef = ref(storage, `profileImages/${user.uid}`);
              const response = await fetch(profileImage);
              const blob = await response.blob();
              await uploadBytes(imageRef, blob);
              photoURL = await getDownloadURL(imageRef);
          }

          // Update profile
          await updateProfile(user, {
              displayName: safeDisplayName,
              photoURL
          });

          // Create user document in Firestore
          await setDoc(doc(db, 'users', user.uid), {
              email,
              displayName: safeDisplayName,
              photoURL,
              availableDates: []
          });

          return user;
      } catch (error) {
          console.error('Registration error:', error);
          throw error;
      }
  },

  // Login
  async login(email: string, password: string): Promise<User> {
      try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          return userCredential.user;
      } catch (error) {
          console.error('Login error:', error);
          throw error;
      }
  },

  // Logout
  async logout(): Promise<void> {
      try {
          await signOut(auth);
      } catch (error) {
          console.error('Logout error:', error);
          throw error;
      }
  },

  // Get current user
  getCurrentUser(): User | null {
      return auth.currentUser;
  },

  // Update user profile
  async updateProfile(displayName: string, profileImage: string | null): Promise<void> {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      try {
          let photoURL = user.photoURL;

          // Upload new profile image if provided
          if (profileImage) {
              const imageRef = ref(storage, `profileImages/${user.uid}`);
              const response = await fetch(profileImage);
              const blob = await response.blob();
              await uploadBytes(imageRef, blob);
              photoURL = await getDownloadURL(imageRef);
          }

          // Update auth profile
          await updateProfile(user, {
              displayName: displayName.trim() || user.email?.split('@')[0] || 'User',
              photoURL
          });

          // Update Firestore document
          await setDoc(doc(db, 'users', user.uid), {
              email: user.email,
              displayName,
              photoURL,
              updatedAt: new Date()
          }, { merge: true });
      } catch (error) {
          console.error('Profile update error:', error);
          throw error;
      }
  }
};

export default authService;