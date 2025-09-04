// app/components/TeamJoinForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GameCodeInput from './inputbox'; // Re-using this component
import { roleTypes, roleType } from '@/lib/types';

const with_name = false;

export default function TeamJoinForm() {
	const searchParams = useSearchParams();
	const [gameCode, setGameCode] = useState('');
	const [teamCode, setTeamCode] = useState('');
	const [_userName, setUserName] = useState<string>(
		with_name ? '' : 'Nieuwe gebruiker'
	);
	const [role, setRole] = useState<roleType | ''>('');
	const [joining, setJoining] = useState(false);
	const [foundCode, setFoundCode] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const codeFromUrl = searchParams.get('code');
		if (codeFromUrl) {
			setGameCode(codeFromUrl.toUpperCase());
			setFoundCode(true);
		}
	}, [searchParams]);

	const handleJoin = async (e: React.FormEvent) => {
		console.log(_userName);
		e.preventDefault();

		// The input component already handles length, but a final check is good.
		if (gameCode.length !== 6 || teamCode.length !== 6) {
			alert('Game and Team codes must be 6 characters');
			return;
		}

		if (!role) {
			alert('Please select a role');
			return;
		}

		setJoining(true);

		const res = await fetch('/api/join', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				gameCode,
				teamCode: teamCode.toUpperCase(),
				userName: _userName,
				role,
			}),
		});

		const data = await res.json();

		if (!res.ok) {
			alert(data.error || 'Failed to join game');
			setJoining(false);
			return;
		}

		const sessionData = {
			teamId: data.teamId,
			memberId: data.memberId,
			role: role,
		};

		document.cookie = `teamSession=${JSON.stringify(sessionData)}; path=/`;
		router.push(`/team/${data.gameId}`);
		setJoining(false);
	};

	return (
		<div className="p-4 sm:p-6 max-w-md mx-auto min-h-screen flex flex-col justify-center">
			<h1 className="text-2xl sm:text-3xl font-bold text-center mb-8">
				Meedoen
			</h1>
			<form onSubmit={handleJoin} className="flex flex-col gap-5">
				{!foundCode && (
					<>
						<label className="text-lg font-semibold text-center">
							Game Code
						</label>
						<GameCodeInput
							disabled={joining}
							value={gameCode}
							onChange={setGameCode}
						/>
					</>
				)}
				<label className="text-lg font-semibold text-center mt-4">
					Team Code
				</label>
				<GameCodeInput
					disabled={joining}
					value={teamCode}
					onChange={setTeamCode}
				/>
				<select
					value={role}
					onChange={(e) => setRole(e.target.value as roleType)}
					className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					disabled={joining}
					required
				>
					<option value="" disabled>
						Selecteer jouw rol
					</option>
					{roleTypes.map((r) => (
						<option key={r.name} value={r.name}>
							{r.name}
						</option>
					))}
				</select>
				{with_name && (
					<input
						type="text"
						placeholder="Your Name"
						value={_userName}
						onChange={(e) => setUserName(e.target.value)}
						className="border p-2 rounded-lg focus:ring-blue-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500"
						disabled={joining}
						required
					/>
				)}
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
