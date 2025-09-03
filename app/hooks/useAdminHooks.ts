// app/hooks/useAdminHooks.ts
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, Auth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, app } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

export const useAdminAuth = () => {
	const [auth, setAuth] = useState<Auth | null>(null);
	const [userEmail, setUserEmail] = useState<string | null>(null);
	const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const authInstance = getAuth(app);
		const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
			if (user) {
				setAuth(authInstance);
				setUserEmail(user.email);

				// Check if the user is in the admins collection
				const adminDocRef = doc(db, 'admins', user.uid);
				const adminDoc = await getDoc(adminDocRef);
				const isAdminUser = adminDoc.exists();
				setIsAdmin(isAdminUser);

				if (!isAdminUser) {
					console.error('User is not an admin. Redirecting...');
					router.push('/admin/login');
				}
			} else {
				setAuth(null);
				setUserEmail(null);
				setIsAdmin(false);
				router.push('/admin/login');
			}
			setLoading(false);
		});

		return () => unsubscribe();
	}, [router]);

	return { auth, userEmail, isAdmin, loading };
};
