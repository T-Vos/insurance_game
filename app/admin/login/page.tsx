'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	getAuth,
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import clsx from 'clsx';
export default function AdminLoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const auth = getAuth();
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				// User is authenticated. Now, check if they are an admin.
				console.log('Auth state changed. User found:', user.uid);

				try {
					const adminDoc = await getDoc(doc(db, 'admins', user.uid));
					if (adminDoc.exists()) {
						// User is an admin, redirect to dashboard.
						// The middleware will now find the cookie.
						router.push('/admin/');
					} else {
						// Not an admin, sign out and show error.
						setError('You are not authorized as admin.');
						await signOut(auth);
					}
				} catch (err) {
					console.error('Error checking admin status:', err);
					setError('Failed to verify admin status.');
					await signOut(auth);
				}
			}
		});

		return () => unsubscribe();
	}, [router]);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		const auth = getAuth();
		try {
			await signInWithEmailAndPassword(auth, email, password);
		} catch (err: unknown) {
			console.error(err);
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError('Login failed');
			}
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center dark:bg-gray-900">
			<div className="w-full max-w-md bg-gray-800 rounded-xl p-8 shadow-lg text-gray-200">
				<h2 className="text-3xl font-bold text-center text-teal-400 mb-6">
					Admin Login
				</h2>
				{error && <p className="text-red-400 mb-4 text-center">{error}</p>}
				<form onSubmit={handleLogin}>
					<div className="flex flex-col space-y-4">
						<input
							type="email"
							placeholder="Email"
							value={email}
							disabled={loading}
							onChange={(e) => setEmail(e.target.value)}
							className="p-3 rounded-lg bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
						/>
						<input
							type="password"
							placeholder="Password"
							value={password}
							disabled={loading}
							onChange={(e) => setPassword(e.target.value)}
							className="p-3 rounded-lg bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
						/>
						<button
							disabled={loading}
							className={clsx(
								'py-3 bg-teal-500 hover:bg-teal-400 rounded-lg font-semibold transition',
								loading ? 'opacity-50' : 'cursor-pointer'
							)}
						>
							Login met Email
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
