'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GameCodeInput from './inputbox';

export default function TeamJoinForm() {
	const searchParams = useSearchParams();
	const [gameCode, setGameCode] = useState('');
	const [joining, setJoining] = useState(false);
	const [teamName, setTeamName] = useState('');
	const router = useRouter();

	useEffect(() => {
		const codeFromUrl = searchParams.get('code');
		if (codeFromUrl) setGameCode(codeFromUrl.toUpperCase());
	}, [searchParams]);

	const handleJoin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (gameCode.length !== 6) {
			alert('Game code must be 6 characters');
			return;
		}

		setJoining(true);

		const res = await fetch('/api/join', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ gameCode, teamName }),
		});

		const data = await res.json();

		if (!res.ok) {
			alert(data.error || 'Failed to join game');
			setJoining(false);
			return;
		}

		console.log(data);

		// Store team session in a cookie (client-side)
		document.cookie = `teamSession=${data.teamId}; path=/`;

		router.push(`/team/${data.gameId}`);
		setJoining(false);
	};

	return (
		<div className="p-4 sm:p-6 max-w-md mx-auto min-h-screen flex flex-col justify-center border-2 border-gray-300 bg-gray-50 dark:bg-gray-900">
			<h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
				Meedoen
			</h1>
			<form onSubmit={handleJoin} className="flex flex-col gap-5">
				<GameCodeInput
					disabled={joining}
					value={gameCode}
					onChange={setGameCode}
				/>

				<input
					type="text"
					placeholder="Team Name"
					value={teamName}
					onChange={(e) => setTeamName(e.target.value)}
					className="border p-2 rounded-lg focus:ring-blue-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500"
					disabled={joining}
					required
				/>
				<button
					type="submit"
					disabled={joining}
					className="bg-blue-600 focus:ring-blue-500 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-default cursor-pointer disabled:hover:bg-blue-600 hover:bg-blue-700"
				>
					{joining ? 'U wordt aangemeld' : 'Aanmelden'}
				</button>
			</form>
		</div>
	);
}
