import { db } from '@/lib/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

export function generateGameKey(length = 6): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let key = '';
	for (let i = 0; i < length; i++) {
		key += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return key;
}

export async function generateUniqueGameKey(): Promise<string> {
	let unique = false;
	let key = '';

	while (!unique) {
		key = generateGameKey();
		const q = query(collection(db, 'games'), where('key', '==', key));
		const snap = await getDocs(q);
		if (snap.empty) {
			unique = true;
		}
	}

	return key;
}
