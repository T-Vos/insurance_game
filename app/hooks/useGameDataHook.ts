// app/hooks/useAdminHooks.ts
import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Game, Round, Team, Choice } from '@/lib/types'; // Import Choice type

export const useGameData = (gameId: string) => {
	const [gameData, setGameData] = useState<Game | null>(null);
	const [allRounds, setAllRounds] = useState<Round[]>([]);
	const [allTeams, setAllTeams] = useState<Team[]>([]);
	const [allChoices, setAllChoices] = useState<Choice[]>([]); // NEW: State for all choices
	const [currentRound, setCurrentRound] = useState<Round | null>(null);

	useEffect(() => {
		if (!db || !gameId) return;
		const gameDocPath = `insurance_game/${gameId}`;
		const _gameDocRef = doc(db, gameDocPath);
		const unsubscribeGame = onSnapshot(_gameDocRef, (snapshot) => {
			if (snapshot.exists()) {
				setGameData(snapshot.data() as Game);
			} else {
				setGameData(null);
			}
		});
		return () => unsubscribeGame();
	}, [gameId]);

	useEffect(() => {
		if (!db || !gameId) return;
		const roundsCollectionRef = collection(
			db,
			`insurance_game/${gameId}/rounds`
		);
		const unsubscribeRounds = onSnapshot(roundsCollectionRef, (snapshot) => {
			const roundsList = snapshot.docs.map((d) => d.data() as Round);
			setAllRounds(roundsList);
		});
		return () => unsubscribeRounds();
	}, [gameId]);

	useEffect(() => {
		if (!db || !gameId) return;
		const teamsCollectionRef = collection(db, `insurance_game/${gameId}/teams`);
		const unsubscribeTeams = onSnapshot(teamsCollectionRef, (snapshot) => {
			const teamsList = snapshot.docs.map((d) => d.data() as Team);
			setAllTeams(teamsList);
		});
		return () => unsubscribeTeams();
	}, [gameId]);

	useEffect(() => {
		if (!db || !gameId) return;
		const choicesCollectionRef = collection(
			db,
			`insurance_game/${gameId}/choices`
		);
		const unsubscribeChoices = onSnapshot(choicesCollectionRef, (snapshot) => {
			const choicesList = snapshot.docs.map((d) => d.data() as Choice);
			setAllChoices(choicesList);
		});
		return () => unsubscribeChoices();
	}, [gameId]);

	useEffect(() => {
		if (gameData && allRounds.length > 0) {
			const foundRound = allRounds.find(
				(r) => r.round_id === gameData.currentRoundId
			);
			setCurrentRound(foundRound || null);
		} else {
			setCurrentRound(null);
		}
	}, [gameData, allRounds]);

	return { gameData, allRounds, currentRound, allTeams, allChoices };
};
