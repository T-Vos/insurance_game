'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase/config';
import {
	collection,
	query,
	where,
	getDocs,
	updateDoc,
	arrayUnion,
} from 'firebase/firestore';
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
		const q = query(
			collection(db, 'insurance_game'),
			where('key', '==', gameCode)
		);
		const snapshot = await getDocs(q);

		if (snapshot.empty) {
			alert('Game not found');
			setJoining(false);
			return;
		}

		const gameDoc = snapshot.docs[0];
		const gameId = gameDoc.id;

		const teamId = crypto.randomUUID();
		await updateDoc(gameDoc.ref, {
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
		setJoining(false);
	};

	return (
		<div className="p-6 max-w-md mx-auto">
			<h1 className="text-xl font-bold text-center">Join a Game</h1>
			<form onSubmit={handleJoin} className="flex flex-col gap-4 mt-6">
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
