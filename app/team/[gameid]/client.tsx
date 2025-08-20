'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { getTeamSession } from '@/lib/session';
import { Game } from '@/lib/types';

export default function TeamGame({ gameId }: { gameId: string }) {
	const [game, setGame] = useState<Game | null>(null);
	const [teamId, setTeamId] = useState<string | null>(null);

	useEffect(() => {
		if (!gameId) return;

		const session = getTeamSession();
		if (!session) {
			alert('You are not logged in as a team. Please join the game first.');
			return;
		}
		setTeamId(session);

		const gameRef = doc(db, 'insurance_game', gameId);

		// Subscribe to real-time updates
		const unsubscribe = onSnapshot(gameRef, (snapshot) => {
			if (snapshot.exists()) {
				setGame(snapshot.data() as Game);
			} else {
				console.warn('Game not found:', gameId);
				setGame(null);
			}
		});

		// Clean up the subscription on unmount
		return () => unsubscribe();
	}, [gameId]);

	if (!teamId) return <div>Please log in first.</div>;
	if (!game) return <div>Loading or game not found...</div>;
	return (
		<div className="p-6">
			<h1 className="text-xl font-bold">Game: {game.name}</h1>
			<p>Current Round: {game.currentRoundIndex + 1}</p>

			{/* Render rounds/questions */}
		</div>
	);
}
