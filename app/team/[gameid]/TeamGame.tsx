'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/config';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getTeamSession } from '@/lib/session';
import TeamBoard from '@/components/TeamBoard';
import { Choice, ChosenItem, Game, Team } from '@/lib/types';
import RoundTimer from '../components/RoundTimer';

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

		const teamIndex = game.teams.findIndex((t: Team) => t.id === teamId);
		if (teamIndex === -1) return;

		const team = game.teams[teamIndex];

		// Check if this round is already saved
		const roundChoice = team.choices.find(
			(c: ChosenItem) => c.round_id === roundId
		);
		if (roundChoice?.saved) return; // cannot change saved choice

		// Only one choice per round
		const updatedChoices = [
			...team.choices.filter((c: ChosenItem) => c.round_id !== roundId),
			{
				round_id: roundId,
				choice_id: choice.id,
				roundIndex: game.currentRoundIndex,
				saved: false,
			},
		];

		const updatedTeams = [...game.teams];
		updatedTeams[teamIndex] = { ...team, choices: updatedChoices };

		await updateDoc(doc(db, 'insurance_game', gameId), {
			teams: updatedTeams,
		});
	};

	const handleSaveChoice = async (teamId: string, roundId: string) => {
		if (!game) return;

		const teamIndex = game.teams.findIndex((t: Team) => t.id === teamId);
		if (teamIndex === -1) return;

		const team = game.teams[teamIndex];
		const roundChoiceIndex = team.choices.findIndex(
			(c: ChosenItem) => c.round_id === roundId
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

	const currentTeam = game.teams.find((t: Team) => t.id === teamId);
	const currentRound = game.rounds[game.currentRoundIndex];

	if (!teamId) return <div>Please log in first.</div>;
	if (!game) return <div>Loading or game not found...</div>;
	if (!currentTeam) {
		return (
			<div className="text-center text-gray-500">No team data available.</div>
		);
	}
	const selectedChoice = currentTeam.choices.find(
		(c: ChosenItem) => c.round_id === currentRound.round_id
	);

	const isChoiceSaved = selectedChoice?.saved ?? false;
	const roundStarted =
		currentRound.round_started_at !== null &&
		currentRound.round_started_at != '';
	return (
		<div className="flex items-center justify-center flex-col min-h-screen">
			<div className=" w-full max-w-3xl">
				<div className="rounded-xl shadow-lg p-6">
					<div className="flex items-center justify-center flex-col">
						<RoundTimer
							roundDuration={currentRound.round_duration}
							roundStartedAt={currentRound.round_started_at}
							confirmed={isChoiceSaved}
						/>
						<h3 className="text-xl">{currentRound.round_name}</h3>
					</div>
				</div>
				<div className="pt-8">
					{roundStarted ? (
						<TeamBoard
							team={currentTeam}
							currentRound={currentRound}
							handleSelectChoice={handleSelectChoice}
							handleSaveChoice={handleSaveChoice}
						/>
					) : (
						<div className=" text-center w-full">
							Wacht tot de ronde gestart wordt
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
