import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Initialize Firebase (automatic with google-services.json)

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

class FirebaseService {
  // Get current user
  getCurrentUser(): FirebaseUser | null {
    const user = auth().currentUser;
    if (!user) return null;

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      isAnonymous: user.isAnonymous,
    };
  }

  // Sign in anonymously (Guest mode)
  async signInAnonymously(): Promise<FirebaseUser> {
    try {
      const result = await auth().signInAnonymously();
      const user = result.user;
      
      return {
        uid: user.uid,
        email: null,
        displayName: 'Guest',
        photoURL: null,
        isAnonymous: true,
      };
    } catch (error) {
      console.error('Anonymous sign in error:', error);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Guest' : null),
          photoURL: firebaseUser.photoURL,
          isAnonymous: firebaseUser.isAnonymous,
        });
      } else {
        callback(null);
      }
    });
  }

  // Get Firestore instance
  getFirestore() {
    return firestore();
  }

  // Get Auth instance
  getAuth() {
    return auth();
  }
}

export const firebaseService = new FirebaseService();
export { auth, firestore };
