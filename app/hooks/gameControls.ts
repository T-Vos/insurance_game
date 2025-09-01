// useGameControls.ts

import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { calculateScores } from '@/lib/calculateScores'; // Your new calculateScores function
import { Game } from '@/lib/types';

/**
 * A custom hook to manage game flow and control actions.
 * @param {Game | null} gameData The current state of the game data.
 */
const useGameControls = (gameData: Game | null, game_id: string) => {
	const [loading, setLoading] = useState(false);

	const gameDocPath = `insurance_game/${game_id}`;

	const isGameRunning = !!gameData?.gameStartedAt && !gameData?.gameFinishedAt;
	const isLastRound =
		(gameData?.currentRoundIndex ?? -1) >= (gameData?.rounds?.length || 0) - 1;

	const handleNextRound = async () => {
		if (!db || !gameData || !isGameRunning || isLastRound) {
			console.log('Cannot advance to next round. Pre-conditions not met.');
			return;
		}

		setLoading(true);

		const gameDocRef = doc(db, gameDocPath);
		const currentRoundIndex = gameData.currentRoundIndex;
		const updatedRounds = [...(gameData.rounds ?? [])];

		updatedRounds[currentRoundIndex] = {
			...updatedRounds[currentRoundIndex],
			round_finished_at: Date.now(),
		};

		const nextRoundIndex = currentRoundIndex + 1;
		if (nextRoundIndex < updatedRounds.length) {
			updatedRounds[nextRoundIndex] = {
				...updatedRounds[nextRoundIndex],
				round_started_at: Date.now(),
			};
		}

		const newRoundId =
			updatedRounds[nextRoundIndex]?.round_id || gameData.currentRoundId;

		const updatedTeams = calculateScores(gameData, nextRoundIndex);

		const updatedGameData = {
			...gameData,
			currentRoundIndex: nextRoundIndex,
			currentRoundId: newRoundId,
			rounds: updatedRounds,
			teams: updatedTeams,
		};

		try {
			await setDoc(gameDocRef, updatedGameData);
			console.log('Successfully advanced to the next round.');
		} catch (error) {
			console.error('Failed to advance to next round:', error);
		} finally {
			setLoading(false);
		}
	};

	return {
		handleNextRound,
		isGameRunning,
		isLastRound,
	};
};

export default useGameControls;
