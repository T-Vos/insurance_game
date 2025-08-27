'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	getAuth,
	signInWithEmailAndPassword,
	signOut,
	OAuthProvider,
	signInWithPopup,
	onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import clsx from 'clsx';
import { SquareArrowOutUpRight } from 'lucide-react';

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

		// Cleanup the listener on component unmount
		return () => unsubscribe();
	}, [router]);

	const handleSubmit = (e: React.FormEvent) => {
		console.log('Form submitted');
		setLoading(true);
		e.preventDefault();
		handleLogin('email');
	};

	const handleLogin = async (method: 'email' | 'microsoft') => {
		console.log(`Attempting login with method: ${method}`);
		setError('');
		const auth = getAuth();
		try {
			if (method === 'email') {
				await signInWithEmailAndPassword(auth, email, password);
			} else {
				const provider = new OAuthProvider('microsoft.com');
				await signInWithPopup(auth, provider);
			}
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
				<form onSubmit={handleSubmit}>
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

				<div className="my-6 text-center text-gray-400">OR</div>

				<button
					onClick={() => handleLogin('microsoft')}
					className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition flex items-center justify-center space-x-2"
				>
					<SquareArrowOutUpRight />
					<span>Login with Microsoft</span>
				</button>
			</div>
		</div>
	);
}
