'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/config';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getTeamSession } from '@/lib/session';
import TeamBoard from '@/components/TeamBoard';
import { Choice, Game } from '@/lib/types';

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

		const unsubscribe = onSnapshot(gameRef, (snapshot) => {
			if (snapshot.exists()) {
				setGame(snapshot.data() as Game);
			} else {
				setGame(null);
			}
		});

		return () => unsubscribe();
	}, [gameId]);

	const handleSelectChoice = async (
		teamId: string,
		roundId: string,
		choice: Choice
	) => {
		if (!game) return;

		const teamIndex = game.teams.findIndex((t: any) => t.id === teamId);
		if (teamIndex === -1) return;

		const team = game.teams[teamIndex];

		// Check if this round is already saved
		const roundChoice = team.choices.find((c: any) => c.round_id === roundId);
		if (roundChoice?.saved) return; // cannot change saved choice

		// Only one choice per round
		const updatedChoices = [
			...team.choices.filter((c: any) => c.round_id !== roundId),
			{ round_id: roundId, choice_id: choice.id, saved: false },
		];

		const updatedTeams = [...game.teams];
		updatedTeams[teamIndex] = { ...team, choices: updatedChoices };

		await updateDoc(doc(db, 'insurance_game', gameId), {
			teams: updatedTeams,
		});
	};

	const handleSaveChoice = async (teamId: string, roundId: string) => {
		if (!game) return;

		const teamIndex = game.teams.findIndex((t: any) => t.id === teamId);
		if (teamIndex === -1) return;

		const team = game.teams[teamIndex];
		const roundChoiceIndex = team.choices.findIndex(
			(c: any) => c.round_id === roundId
		);
		if (roundChoiceIndex === -1) return;

		const updatedChoices = [...team.choices];
		updatedChoices[roundChoiceIndex] = {
			...updatedChoices[roundChoiceIndex],
			saved: true,
		};

		const updatedTeams = [...game.teams];
		updatedTeams[teamIndex] = { ...team, choices: updatedChoices };

		await updateDoc(doc(db, 'insurance_game', gameId), {
			teams: updatedTeams,
		});
	};

	if (!teamId) return <div>Please log in first.</div>;
	if (!game) return <div>Loading or game not found...</div>;

	const currentTeam = game.teams.find((t: any) => t.id === teamId);
	const currentRound = game.rounds[game.currentRoundIndex];

	return (
		<div className="p-6 space-y-4">
			<h1 className="text-2xl font-bold text-teal-400">{game.name}</h1>
			<TeamBoard
				team={currentTeam}
				currentRound={currentRound}
				handleSelectChoice={handleSelectChoice}
				handleSaveChoice={handleSaveChoice}
			/>
		</div>
	);
}
