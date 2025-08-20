'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase/client';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function TeamJoinPage() {
	const [gameId, setGameId] = useState('');
	const [teamName, setTeamName] = useState('');
	const router = useRouter();

	const handleJoin = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const gameRef = doc(db, 'games', gameId);
			const gameSnap = await getDoc(gameRef);

			if (!gameSnap.exists()) {
				alert('Game not found');
				return;
			}

			const teamId = crypto.randomUUID();
			await updateDoc(gameRef, {
				teams: arrayUnion({
					id: teamId,
					teamName,
					choices: [],
					expected_profit_score: 0,
					liquidity_score: 0,
					solvency_score: 0,
					IT_score: 0,
					capacity_score: 0,
				}),
			});

			document.cookie = `teamSession=${teamId}; path=/`;
			router.push(`/team/${gameId}`);
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div className="p-6">
			<h1 className="text-xl font-bold">Join a Game</h1>
			<form onSubmit={handleJoin} className="flex flex-col gap-2 mt-4">
				<input
					type="text"
					placeholder="Game ID"
					value={gameId}
					onChange={(e) => setGameId(e.target.value)}
				/>
				<input
					type="text"
					placeholder="Team Name"
					value={teamName}
					onChange={(e) => setTeamName(e.target.value)}
				/>
				<button type="submit">Join</button>
			</form>
		</div>
	);
}
