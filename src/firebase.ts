import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, onSnapshot, getDocFromServer, Timestamp, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Enable persistence for better offline/flaky connection handling
if (typeof window !== 'undefined') {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.warn('Firestore persistence is not supported by this browser');
    }
  });
}
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
  
  // Safe stringify helper for bridge environments that might have issues with circular structures
  const safeStringify = (obj: any) => {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      return value;
    });
  };

  if (isPermissionError) {
    // Throw as JSON string as required by the instructions
    throw new Error(safeStringify(errInfo));
  }
  
  // Throw a simple error message for other errors
  throw new Error(errorMessage);
}

export async function testConnection() {
  try {
    console.log("Testing Firestore connection...");
    // Use getDoc instead of getDocFromServer for the test to allow cache-based success if offline
    await getDoc(doc(db, 'test', 'connection'));
    console.log("Firestore connection test passed (may be from cache)");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if(msg.includes('the client is offline') || msg.includes('Could not reach Cloud Firestore backend') || msg.includes('network-request-failed')) {
      console.warn("Firestore is operating in offline mode. Changes will sync when connection is restored.");
    } else {
      console.error("Firestore connection unexpected error:", msg);
    }
  }
}

testConnection();
