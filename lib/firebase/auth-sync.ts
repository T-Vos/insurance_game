'use client';

import { getAuth, onIdTokenChanged } from 'firebase/auth';
import { app } from '@/lib/firebase/config';
import { useEffect } from 'react';
import { setCookie, destroyCookie } from 'nookies';

const auth = getAuth(app);

export default function AuthSync() {
	useEffect(() => {
		const unsubscribe = onIdTokenChanged(auth, async (user) => {
			if (user) {
				// Get the ID token and set it in a cookie
				const token = await user.getIdToken();
				setCookie(null, 'adminToken', token, {
					maxAge: 30 * 24 * 60 * 60, // 30 days
					path: '/',
				});
			} else {
				// No user, destroy the cookie
				destroyCookie(null, 'adminToken');
			}
		});
		return () => unsubscribe();
	}, []);

	return null; // This component doesn't render anything
}
