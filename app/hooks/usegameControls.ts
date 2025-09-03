import { useState } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Game, Round, Team } from '@/lib/types';

const useGameControls = (gameData: Game | null, game_id: string) => {
	const [loading, setLoading] = useState(false);
	const isGameRunning = !!gameData?.gameStartedAt && !gameData?.gameFinishedAt;

	const isLastRound = gameData
		? gameData.currentRoundIndex >= (gameData.totalRounds ?? 0) - 1
		: false;

	const handleStartGame = async (
		totalRounds: number,
		firstRoundId: Round['round_id']
	) => {
		if (!db || !gameData || isGameRunning) return;
		setLoading(true);

		const gameDocRef = doc(db, `insurance_game/${game_id}`);

		try {
			await updateDoc(gameDocRef, {
				gameStartedAt: Date.now(),
				gameFinishedAt: null,
				currentRoundIndex: 0,
				currentRoundId: firstRoundId,
				totalRounds: totalRounds,
			});

			const firstRoundRef = doc(
				db,
				`insurance_game/${game_id}/rounds/${firstRoundId}`
			);
			await updateDoc(firstRoundRef, { round_started_at: Date.now() });
		} catch (error) {
			console.error('Failed to start game:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleStopGame = async (allRounds: Round[]) => {
		if (!db || !gameData || !isGameRunning) return;
		setLoading(true);

		const gameDocRef = doc(db, `insurance_game/${game_id}`);
		const currentRoundRef = doc(
			db,
			`insurance_game/${game_id}/rounds/${
				allRounds[gameData.currentRoundIndex]
			}`
		);

		try {
			// Update the main game document
			await updateDoc(gameDocRef, {
				gameFinishedAt: Date.now(),
			});

			// Update the current round document to set its finish time
			await updateDoc(currentRoundRef, { round_finished_at: Date.now() });
		} catch (error) {
			console.error('Failed to stop game:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleNextRound = async (allRounds: Round[]) => {
		if (!db || !gameData || !isGameRunning || isLastRound) {
			console.log('Cannot advance to next round. Pre-conditions not met.');
			return;
		}
		setLoading(true);

		const currentRoundIndex = gameData.currentRoundIndex;
		const nextRoundIndex = currentRoundIndex + 1;
		const currentRoundRef = doc(
			db,
			`insurance_game/${game_id}/rounds/${allRounds[currentRoundIndex].round_id}`
		);
		const nextRoundRef = doc(
			db,
			`insurance_game/${game_id}/rounds/${allRounds[nextRoundIndex].round_id}`
		);
		const gameDocRef = doc(db, `insurance_game/${game_id}`);

		try {
			await updateDoc(currentRoundRef, { round_finished_at: Date.now() });
			await updateDoc(nextRoundRef, { round_started_at: Date.now() });
			await updateDoc(gameDocRef, {
				currentRoundIndex: nextRoundIndex,
				currentRoundId: allRounds[nextRoundIndex].round_id,
			});
		} catch (error) {
			console.error('Failed to advance to next round:', error);
		} finally {
			setLoading(false);
		}
	};

	const handlePreviousRound = async (allRounds: Round[]) => {
		if (!db || !gameData || !isGameRunning || gameData.currentRoundIndex === 0)
			return;
		setLoading(true);

		const currentRoundIndex = gameData.currentRoundIndex;
		const prevRoundIndex = currentRoundIndex - 1;
		const gameDocRef = doc(db, `insurance_game/${game_id}`);

		const currentRoundRef = doc(
			db,
			`insurance_game/${game_id}/rounds/${allRounds[currentRoundIndex].round_id}`
		);
		const prevRoundRef = doc(
			db,
			`insurance_game/${game_id}/rounds/${allRounds[prevRoundIndex].round_id}`
		);

		try {
			await updateDoc(currentRoundRef, {
				round_started_at: null,
				round_finished_at: null,
			});

			await updateDoc(prevRoundRef, {
				round_started_at: Date.now(),
				round_finished_at: null,
			});

			await updateDoc(gameDocRef, {
				currentRoundIndex: prevRoundIndex,
				currentRoundId: allRounds[prevRoundIndex].round_id,
			});
		} catch (error) {
			console.error('Failed to go to previous round:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleAddRound = async () => {
		if (!db || !gameData) return;
		setLoading(true);

		const newRoundIndex = gameData.totalRounds ?? 0;
		const newRoundRef = doc(
			db,
			`insurance_game/${game_id}/rounds/round_${newRoundIndex}`
		);
		const gameDocRef = doc(db, `insurance_game/${game_id}`);

		const newRound: Round = {
			round_id: `round_${newRoundIndex}`,
			round_duration: 3600,
			round_started_at: null,
			round_finished_at: null,
			round_index: newRoundIndex,
			round_name: `Round ${newRoundIndex + 1}`,
		};

		try {
			// Create the new round document
			await setDoc(newRoundRef, newRound);

			// Update the main game document with the new total round count
			await updateDoc(gameDocRef, { totalRounds: newRoundIndex + 1 });
		} catch (error) {
			console.error('Failed to add new round:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveRound = async (roundId: Round['round_id']) => {
		if (!db || !gameData) return;
		setLoading(true);
		try {
			const roundRef = doc(db, `insurance_game/${game_id}/rounds/${roundId}`);
			await deleteDoc(roundRef);
			// You may need to update the totalRounds count on the main document
		} catch (error) {
			console.error('Failed to remove round:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateRound = async (updatedRound: Round) => {
		if (!db || !gameData) return;
		setLoading(true);
		try {
			const roundRef = doc(
				db,
				`insurance_game/${game_id}/rounds/${updatedRound.round_id}`
			);
			await updateDoc(roundRef, updatedRound);
		} catch (error) {
			console.error('Failed to update round:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleAddTeam = async (team: Team) => {
		if (!db || !gameData) return;
		setLoading(true);
		try {
			const teamRef = doc(db, `insurance_game/${game_id}/teams/${team.id}`);
			await setDoc(teamRef, team);
		} catch (error) {
			console.error('Failed to add new team:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateTeam = async (id: Team['id'], updates: Partial<Team>) => {
		if (!db || !gameData) return;
		setLoading(true);
		try {
			const teamRef = doc(db, `insurance_game/${game_id}/teams/${id}`);
			await updateDoc(teamRef, updates);
		} catch (error) {
			console.error('Failed to update team:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateGameConfig = async (
		key: keyof Game,
		value: string | number
	) => {
		if (!db || !gameData) return;
		setLoading(true);
		const gameDocRef = doc(db, `insurance_game/${game_id}`);
		try {
			await updateDoc(gameDocRef, { [key]: value });
		} catch (error) {
			console.error('Failed to update game:', error);
		} finally {
			setLoading(false);
		}
	};

	return {
		loading,
		handleNextRound,
		handlePreviousRound,
		handleStartGame,
		handleStopGame,
		handleAddRound,
		handleRemoveRound,
		handleUpdateRound,
		handleAddTeam,
		handleUpdateTeam,
		handleUpdateGameConfig,
		isGameRunning,
		isLastRound,
	};
};

export default useGameControls;
