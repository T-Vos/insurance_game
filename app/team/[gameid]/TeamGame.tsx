'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { getTeamSession } from '@/lib/session';
import TeamBoard from '@/components/TeamBoard';
import { TeamChoice, Game, Round, Team } from '@/lib/types';
import { useSelectChoice } from '@/app/hooks/useSelectChoice';
import { cardstyle } from '@/app/admin/[gameid]/components/styling';
import MessageBubble from '@/components/messageBubble';

const pill_layout = 'rounded-2xl mt-3 shadow-lg p-6 flex flex-col items-center';

export default function TeamGame({ gameid: gameid }: { gameid: string }) {
	const [game, setGame] = useState<Game | null>(null);
	const [teamId, setTeamId] = useState<string | null>(null);
	const [isBlocked, setIsBlocked] = useState<boolean>(false);

	const { handleSelectChoice } = useSelectChoice(game);

	useEffect(() => {
		if (!gameid) return;

		const session = getTeamSession();
		if (!session) {
			alert('You are not logged in as a team. Please join the game first.');
			return;
		}
		setTeamId(session);

		const gameRef = doc(db, 'insurance_game', gameid);

		const unsubscribe = onSnapshot(gameRef, (snapshot) => {
			if (snapshot.exists()) {
				setGame(snapshot.data() as Game);
			} else {
				setGame(null);
			}
		});

		return () => unsubscribe();
	}, [gameid]);

	useEffect(() => {
		if (!game || !teamId || !game.rounds) {
			setIsBlocked(false);
			return;
		}

		const currentTeam = game.teams.find((t: Team) => t.id === teamId);
		if (!currentTeam || !currentTeam.choices) {
			setIsBlocked(false);
			return;
		}

		// Iterate through choices to find the latest one that might be blocking
		let blockedStatus = false;
		for (let i = currentTeam.choices.length - 1; i >= 0; i--) {
			const teamChoice = currentTeam.choices[i];
			if (!teamChoice.saved) {
				setIsBlocked(false);
				continue;
			}

			// Find the full choice object from the game data
			const roundWithChoice = game.rounds.find(
				(r) => r.round_id === teamChoice.round_id
			);

			if (!roundWithChoice || !roundWithChoice.choices) {
				setIsBlocked(false);
				continue;
			}

			const choiceDetails = roundWithChoice.choices.find(
				(c) => c.id === teamChoice.choice_id
			);

			if (choiceDetails?.duration && choiceDetails.duration > 0) {
				const roundsSinceChoice =
					game.currentRoundIndex - teamChoice.roundIndex;
				if (roundsSinceChoice < choiceDetails.duration) {
					blockedStatus = true;
					setIsBlocked(blockedStatus);
					break;
				}
			}
		}
		setIsBlocked(blockedStatus);
	}, [game, teamId]);

	const handleSaveChoice = async (
		teamId: Team['id'],
		roundId: Round['round_id']
	) => {
		const res = await fetch(`/api/game/${gameid}/save-choice`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ gameId: gameid, teamId, roundId }),
		});

		const data = await res.json();
		if (!res.ok) {
			alert(data.error || 'Failed to save choice');
		}
	};

	if (!teamId) return <div>Please log in first.</div>;
	if (!game) return <div>Loading or game not found...</div>;
	if (!game.rounds) return <div>Geen Rondes gevonde </div>;
	const currentTeam = game.teams.find((t: Team) => t.id === teamId);
	const currentRound = game.rounds[game.currentRoundIndex];

	if (!currentTeam) {
		return (
			<div className="text-center text-gray-500">No team data available.</div>
		);
	}
	const selectedChoice = currentTeam.choices.find(
		(c: TeamChoice) => c.round_id === currentRound.round_id
	);

	const isChoiceSaved = selectedChoice?.saved ?? false;
	const roundStarted =
		currentRound.round_started_at !== null &&
		currentRound.round_started_at != '';
	return (
		<div className="flex items-center justify-center flex-col min-h-screen px-4">
			<div className="w-full max-w-md space-y-6 mb-3">
				<div className={cardstyle}>
					<h3 className="font-semibold mt-3">{currentRound.round_name}</h3>
				</div>

				{currentTeam.choices.flatMap((chosenItem) => {
					// Find the round in the original game data
					const originalRound = game.rounds?.find(
						(r) => r.round_id === chosenItem.round_id
					);
					if (!originalRound) return [];

					// Find the choice that was made
					const originalChoice = originalRound.choices?.find(
						(c) => c.id === chosenItem.choice_id
					);
					if (!originalChoice?.reveals) return [];

					return originalChoice.reveals
						.filter(
							(reveal) =>
								chosenItem.roundIndex + (reveal.revealedInRounds - 1) ===
								game.currentRoundIndex
						)
						.map((revealMessage, index) => (
							<MessageBubble
								key={index}
								name="Hoi"
								time={Date.now().toString()}
								text={revealMessage.text}
								image="/portrait.jpg"
								sent={false}
							/>
						));
				})}

				<div className={cardstyle}>
					{roundStarted ? (
						<TeamBoard
							team={currentTeam}
							currentRound={currentRound}
							handleSelectChoice={(teamId, roundId, choice) =>
								handleSelectChoice(gameid, teamId, roundId, choice)
							}
							handleSaveChoice={handleSaveChoice}
							disabled={isBlocked}
						/>
					) : (
						<div className="text-center animate-pulse text-gray-600">
							⏳ Wacht tot de ronde gestart wordt
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
