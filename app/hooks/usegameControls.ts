import { useCallback, useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import {
	doc,
	setDoc,
	updateDoc,
	deleteDoc,
	addDoc,
	collection,
	onSnapshot,
	query,
} from 'firebase/firestore';
import { Choice, Game, Round, Team } from '@/lib/types';

const TEAMS_COLLECTION_NAME = 'teams';
const ROUNDS_COLLECTION_NAME = 'rounds';
const CHOICES_COLLECTION_NAME = 'choices';

const getCollectionRefs = (gameId: string) => {
	if (!db) return null;
	const gameDocPath = `insurance_game/${gameId}`;
	const gameDocRef = doc(db, gameDocPath);
	return {
		gameDocRef,
		teamsCollection: collection(gameDocRef, TEAMS_COLLECTION_NAME),
		roundsCollection: collection(gameDocRef, ROUNDS_COLLECTION_NAME),
		choicesCollection: collection(gameDocRef, CHOICES_COLLECTION_NAME),
	};
};

const useGameControls = (gameId: string) => {
	const [loading, setLoading] = useState(false);
	const [gameData, setGameData] = useState<Game | null>(null);
	const [allRounds, setAllRounds] = useState<Round[]>([]);
	const [allChoices, setAllChoices] = useState<Choice[]>([]);
	const [allTeams, setAllTeams] = useState<Team[]>([]);

	const collectionRefs = getCollectionRefs(gameId);

	useEffect(() => {
		if (!collectionRefs) return;
		const { gameDocRef, roundsCollection, choicesCollection, teamsCollection } =
			collectionRefs;

		const unsubscribeGame = onSnapshot(gameDocRef, (docSnap) => {
			if (docSnap.exists()) {
				setGameData(docSnap.data() as Game);
			}
		});

		const unsubscribeRounds = onSnapshot(
			query(roundsCollection),
			(snapshot) => {
				const rounds = snapshot.docs.map((doc) => ({
					...doc.data(),
				})) as Round[];
				setAllRounds(rounds.sort((a, b) => a.round_index - b.round_index));
			}
		);

		const unsubscribeChoices = onSnapshot(
			query(choicesCollection),
			(snapshot) => {
				const choices = snapshot.docs.map((doc) => ({
					...doc.data(),
					id: doc.id,
				})) as Choice[];
				setAllChoices(choices);
			}
		);

		const unsubscribeTeams = onSnapshot(query(teamsCollection), (snapshot) => {
			const teams = snapshot.docs.map((doc) => ({
				...doc.data(),
				id: doc.id,
			})) as Team[];
			setAllTeams(teams);
		});

		return () => {
			unsubscribeGame();
			unsubscribeRounds();
			unsubscribeChoices();
			unsubscribeTeams();
		};
	}, [collectionRefs]);

	const isGameRunning = !!gameData?.gameStartedAt && !gameData?.gameFinishedAt;
	const isLastRound = gameData
		? gameData.currentRoundIndex >= (gameData.totalRounds ?? 0) - 1
		: false;

	const handleStartGame = useCallback(
		async (totalRounds: number, firstRoundId: Round['round_id']) => {
			if (!collectionRefs || isGameRunning) return;
			setLoading(true);

			const { gameDocRef, roundsCollection } = collectionRefs;

			try {
				await updateDoc(gameDocRef, {
					gameStartedAt: Date.now(),
					gameFinishedAt: null,
					currentRoundIndex: 0,
					currentRoundId: firstRoundId,
					totalRounds: totalRounds,
				});

				const firstRoundRef = doc(roundsCollection, String(firstRoundId));
				await updateDoc(firstRoundRef, { round_started_at: Date.now() });
			} catch (error) {
				console.error('Failed to start game:', error);
			} finally {
				setLoading(false);
			}
		},
		[collectionRefs, isGameRunning]
	);

	const handleStopGame = useCallback(async () => {
		if (!collectionRefs || !gameData || !isGameRunning) return;
		setLoading(true);

		const { gameDocRef, roundsCollection } = collectionRefs;
		const currentRoundRef = doc(
			roundsCollection,
			String(allRounds[gameData.currentRoundIndex].round_id)
		);

		try {
			await updateDoc(gameDocRef, { gameFinishedAt: Date.now() });
			await updateDoc(currentRoundRef, { round_finished_at: Date.now() });
		} catch (error) {
			console.error('Failed to stop game:', error);
		} finally {
			setLoading(false);
		}
	}, [collectionRefs, gameData, isGameRunning, allRounds]);

	const handleNextRound = useCallback(async () => {
		if (!collectionRefs || !gameData || !isGameRunning || isLastRound) {
			console.log('Cannot advance to next round. Pre-conditions not met.');
			return;
		}
		setLoading(true);

		const currentRoundIndex = gameData.currentRoundIndex;
		const nextRoundIndex = currentRoundIndex + 1;
		const { gameDocRef, roundsCollection } = collectionRefs;

		const currentRoundRef = doc(
			roundsCollection,
			String(allRounds[currentRoundIndex].round_id)
		);
		const nextRoundRef = doc(
			roundsCollection,
			String(allRounds[nextRoundIndex].round_id)
		);

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
	}, [collectionRefs, gameData, isGameRunning, isLastRound, allRounds]);

	const handlePreviousRound = useCallback(async () => {
		if (
			!collectionRefs ||
			!gameData ||
			!isGameRunning ||
			gameData.currentRoundIndex === 0
		)
			return;
		setLoading(true);

		const currentRoundIndex = gameData.currentRoundIndex;
		const prevRoundIndex = currentRoundIndex - 1;
		const { gameDocRef, roundsCollection } = collectionRefs;

		const currentRoundRef = doc(
			roundsCollection,
			String(allRounds[currentRoundIndex].round_id)
		);
		const prevRoundRef = doc(
			roundsCollection,
			String(allRounds[prevRoundIndex].round_id)
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
	}, [collectionRefs, gameData, isGameRunning, allRounds]);

	const handleAddRound = useCallback(async () => {
		if (!collectionRefs || !gameData) return;
		setLoading(true);

		const { gameDocRef, roundsCollection } = collectionRefs;
		const newRoundIndex = allRounds.length + 1;
		const newRoundId = `round_${newRoundIndex}`;

		const newRound: Round = {
			round_id: newRoundId,
			round_duration: 3600,
			round_started_at: null,
			round_finished_at: null,
			round_index: newRoundIndex,
			round_name: `Round ${newRoundIndex}`,
			choices_ids: [],
		};

		try {
			const newRoundRef = doc(roundsCollection, newRoundId);
			await setDoc(newRoundRef, newRound);
			await updateDoc(gameDocRef, { totalRounds: newRoundIndex + 1 });
		} catch (error) {
			console.error('Failed to add new round:', error);
		} finally {
			setLoading(false);
		}
	}, [collectionRefs, gameData, allRounds]);

	const handleRemoveRound = useCallback(
		async (roundId: Round['round_id']) => {
			if (!collectionRefs) return;
			setLoading(true);
			try {
				const { roundsCollection } = collectionRefs;
				const roundRef = doc(roundsCollection, String(roundId));
				// TODO: we can delete all choices connected to the round and also remove all choices made by teams.
				// But why go all lengths to do that right now?
				await deleteDoc(roundRef);
			} catch (error) {
				console.error('Failed to remove round:', error);
			} finally {
				setLoading(false);
			}
		},
		[collectionRefs]
	);
	const handleRemoveTeam = useCallback(
		async (teamId: Team['id']) => {
			if (!collectionRefs) return;
			setLoading(true);
			try {
				const { teamsCollection } = collectionRefs;
				const teamRef = doc(teamsCollection, String(teamId));
				await deleteDoc(teamRef);
			} catch (error) {
				console.error('Failed to remove team:', error);
			} finally {
				setLoading(false);
			}
		},
		[collectionRefs]
	);

	const handleUpdateRound = useCallback(
		async (updatedRound: Round) => {
			if (!collectionRefs) return;
			setLoading(true);
			try {
				const { roundsCollection } = collectionRefs;
				const roundRef = doc(roundsCollection, String(updatedRound.round_id));
				await updateDoc(roundRef, updatedRound as never); // Type assertion for updateDoc
			} catch (error) {
				console.error('Failed to update round:', error);
			} finally {
				setLoading(false);
			}
		},
		[collectionRefs]
	);

	const handleAddTeam = useCallback(
		async (teamName: string) => {
			if (!collectionRefs) return;
			setLoading(true);
			try {
				const { teamsCollection } = collectionRefs;
				const newDocRef = doc(teamsCollection);
				const newTeam: Team = {
					id: newDocRef.id,
					teamName: teamName.trim(),
					choices: [],
					capacity_score: 0,
					expected_profit_score: 0,
					IT_score: 0,
					liquidity_score: 0,
					solvency_score: 0,
					team_code: crypto.randomUUID().slice(0, 6).toUpperCase(),
				};
				await setDoc(newDocRef, newTeam);
			} catch (error) {
				console.error('Failed to add new team:', error);
			} finally {
				setLoading(false);
			}
		},
		[collectionRefs]
	);

	const handleUpdateTeam = useCallback(
		async (id: string, updates: Partial<Team>) => {
			if (!collectionRefs) return;
			setLoading(true);
			try {
				const { teamsCollection } = collectionRefs;
				const teamRef = doc(teamsCollection, id);
				await updateDoc(teamRef, updates as never); // Type assertion for updateDoc
			} catch (error) {
				console.error('Failed to update team:', error);
			} finally {
				setLoading(false);
			}
		},
		[collectionRefs]
	);

	const handleUpdateGameConfig = useCallback(
		async (key: keyof Game, value: unknown) => {
			if (!collectionRefs || !gameData) return;
			setLoading(true);
			const { gameDocRef } = collectionRefs;
			try {
				await updateDoc(gameDocRef, { [key]: value });
			} catch (error) {
				console.error('Failed to update game:', error);
			} finally {
				setLoading(false);
			}
		},
		[collectionRefs, gameData]
	);

	const onAddChoice = useCallback(
		async (roundId: Round['round_id']) => {
			if (!collectionRefs || !gameData) return;
			setLoading(true);
			try {
				const { choicesCollection } = collectionRefs;
				const newChoice: Choice = {
					id: crypto.randomUUID(),
					round_id: roundId,
					choice_index: allChoices.filter((c) => c.round_id === roundId).length,
					description: 'New choice',
					duration: 1,
					reveals: [],
					interactionEffects: [],
					capacity_score: 0,
					expected_profit_score: 0,
					IT_score: 0,
					liquidity_score: 0,
					solvency_score: 0,
					blocking_choices: [],
					title: '',
					roundIndex: allRounds.filter((c) => c.round_id == roundId)[0]
						.round_index,
					delayedEffect: [],
				};
				await addDoc(choicesCollection, newChoice);
			} catch (error) {
				console.error('Error adding choice:', error);
			} finally {
				setLoading(false);
			}
		},
		[collectionRefs, gameData, allChoices]
	);

	const onRemoveChoice = useCallback(
		async (choiceId: string) => {
			if (!collectionRefs) return;
			setLoading(true);
			try {
				const { choicesCollection } = collectionRefs;
				const choiceDocRef = doc(choicesCollection, choiceId);
				await deleteDoc(choiceDocRef);
			} catch (error) {
				console.error('Error removing choice:', error);
			} finally {
				setLoading(false);
			}
		},
		[collectionRefs]
	);

	const onSaveChoice = useCallback(
		async (updatedChoice: Choice) => {
			if (!collectionRefs) return;
			setLoading(true);
			try {
				const { choicesCollection } = collectionRefs;
				const choiceDocRef = doc(choicesCollection, updatedChoice.id);
				const { id, ...dataToUpdate } = updatedChoice;
				await updateDoc(choiceDocRef, dataToUpdate as never);
			} catch (error) {
				console.error('Error saving choice:', error);
			} finally {
				setLoading(false);
			}
		},
		[collectionRefs]
	);

	return {
		loading,
		gameData,
		allRounds,
		allChoices,
		allTeams,
		handleNextRound,
		handlePreviousRound,
		handleStartGame,
		handleStopGame,
		handleAddRound,
		handleRemoveRound,
		handleUpdateRound,
		handleAddTeam,
		handleRemoveTeam,
		handleUpdateTeam,
		handleUpdateGameConfig,
		isGameRunning,
		isLastRound,
		onAddChoice,
		onRemoveChoice,
		onSaveChoice,
	};
};

export default useGameControls;
