// app/hooks/useSelectChoice.ts

import { Team, Round, Choice, Game } from '@/lib/types';

export function useSelectChoice(game: Game | null) {
	const handleSelectChoice = async (
		gameId: Game['id'],
		teamId: Team['id'],
		roundId: Round['round_id'],
		choice: Choice
	) => {
		if (!game) return;
		try {
			const res = await fetch(`/api/game/${gameId}/select-choice`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					gameId,
					teamId,
					roundId,
					choiceId: choice.id,
					roundIndex: game.currentRoundIndex,
				}),
			});

			const data = await res.json();
			if (!res.ok) {
				console.error('Failed to select choice:', data.error);
				// You might want to display an alert to the user here
			}
		} catch (err) {
			console.error('Error selecting choice:', err);
			// Handle network or other errors
		}
	};

	return { handleSelectChoice };
}
