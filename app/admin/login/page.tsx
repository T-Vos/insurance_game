'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from 'firebase/client';

export default function AdminLoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const router = useRouter();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const user = await signInWithEmailAndPassword(auth, email, password);
			// Store session token
			document.cookie = `adminToken=${user.user.uid}; path=/`;
			router.push('/admin');
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div className="p-6">
			<h1 className="text-xl font-bold">Admin Login</h1>
			<form onSubmit={handleLogin} className="flex flex-col gap-2 mt-4">
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button type="submit">Login</button>
			</form>
		</div>
	);
}
