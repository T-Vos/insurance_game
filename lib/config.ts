import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const apiKey: string = process.env.NEXT_PUBLIC_API_KEY || '';
const authDomain: string = process.env.NEXT_PUBLIC_AUTH_DOMAIN || '';
const projectId: string = process.env.NEXT_PUBLIC_PROJECT_ID || '';
const storageBucket: string = process.env.NEXT_PUBLIC_STORAGE_BUCKET || '';
const messagingSenderId: string =
	process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID || '';
const appId: string = process.env.NEXT_PUBLIC_APP_ID || '';

export const firebaseConfig: FirebaseConfig = {
	apiKey: apiKey,
	authDomain: authDomain,
	projectId: projectId,
	storageBucket: storageBucket,
	messagingSenderId: messagingSenderId,
	appId: appId,
};

const app: FirebaseApp = !getApps().length
	? initializeApp(firebaseConfig)
	: getApp();
export const db: Firestore = getFirestore(app);
export { app, appId };

export interface FirebaseConfig {
	apiKey: string;
	authDomain: string;
	projectId: string;
	storageBucket: string;
	messagingSenderId: string;
	appId: string;
}
