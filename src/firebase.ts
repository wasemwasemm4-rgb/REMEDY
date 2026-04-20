import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, onSnapshot, getDocFromServer, Timestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  // Construct a safe error message
  let errorMessage = 'Unknown error';
  let isPermissionError = false;

  if (error instanceof Error) {
    errorMessage = error.message;
    if (errorMessage.includes('permission-denied') || errorMessage.includes('Missing or insufficient permissions')) {
      isPermissionError = true;
    }
  } else if (typeof error === 'string') {
    errorMessage = error;
    if (errorMessage.includes('permission-denied') || errorMessage.includes('Missing or insufficient permissions')) {
      isPermissionError = true;
    }
  } else if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as any).code;
    if (code === 'permission-denied') {
      isPermissionError = true;
      errorMessage = 'Missing or insufficient permissions.';
    }
  }

  // Create a clean error info object for logging (avoiding circular structures)
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || 'anonymous',
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || false,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName,
        email: p.email,
        photoUrl: p.photoURL
      })) || []
    }
  };

  // Log simple versions to avoid circular structure issues in bridge environments
  console.error('Firestore Error:', errorMessage, operationType, path);
  
  if (isPermissionError) {
    // Throw as JSON string as required by the instructions
    throw new Error(JSON.stringify(errInfo));
  }
  
  // Throw a simple error message for other errors
  throw new Error(errorMessage);
}

export async function testConnection() {
  try {
    console.log("Testing Firestore connection...");
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection successful.");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Firestore connection test failed:", msg);
    if(msg.includes('the client is offline') || msg.includes('Could not reach Cloud Firestore backend')) {
      console.error("Please check your Firebase configuration. The backend is unreachable.");
    }
  }
}

testConnection();
