'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	getAuth,
	signInWithEmailAndPassword,
	signOut,
	OAuthProvider,
	signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/config';

export default function AdminLoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleLogin = async (method: 'email' | 'microsoft') => {
		setError('');
		const auth = getAuth();
		try {
			let user;
			if (method === 'email') {
				const result = await signInWithEmailAndPassword(auth, email, password);
				user = result.user;
			} else {
				const provider = new OAuthProvider('microsoft.com');
				const result = await signInWithPopup(auth, provider);
				user = result.user;
			}

			// Check admin authorization
			const adminDoc = await getDoc(doc(db, 'admins', user.uid));
			if (!adminDoc.exists()) {
				setError('You are not authorized as admin.');
				await signOut(auth);
				return;
			}

			// Redirect to dashboard
			router.push('/admin/');
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
		<div className="flex min-h-screen items-center justify-center bg-gray-900">
			<div className="w-full max-w-md bg-gray-800 rounded-xl p-8 shadow-lg text-gray-200">
				<h2 className="text-3xl font-bold text-center text-teal-400 mb-6">
					Admin Login
				</h2>
				{error && <p className="text-red-400 mb-4 text-center">{error}</p>}
				<div className="flex flex-col space-y-4">
					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="p-3 rounded-lg bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
					/>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="p-3 rounded-lg bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
					/>
					<button
						onClick={() => handleLogin('email')}
						className="py-3 bg-teal-500 hover:bg-teal-400 rounded-lg font-semibold transition"
					>
						Login with Email
					</button>
				</div>

				<div className="my-6 text-center text-gray-400">OR</div>

				<button
					onClick={() => handleLogin('microsoft')}
					className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition flex items-center justify-center space-x-2"
				>
					<svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
						<path d="M0 0h24v24H0z" fill="none" />
						<path d="M3 3h9v9H3zM12 3h9v9h-9zM3 12h9v9H3zM12 12h9v9h-9z" />
					</svg>
					<span>Login with Microsoft</span>
				</button>
			</div>
		</div>
	);
}
