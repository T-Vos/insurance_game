import { addDoc, collection } from 'firebase/firestore';
import { Game } from './types';
import { db } from './firebase/config';

export const copyRuleSetHook = async (game: Game, newName: string) => {
	const excludedFields: (keyof Game)[] = [
		'id',
		'key',
		'name',
		'teams',
		'gameStartedAt',
		'gameFinishedAt',
		'currentRoundIndex',
		'currentRoundId',
		'createdAt',
	];
	// Build a new game object with allowed fields only
	const copiedData: Partial<Game> = {};

	for (const key in game) {
		if (!excludedFields.includes(key as keyof Game)) {
			// @ts-expect-error dynamic assignment
			copiedData[key] = game[key as keyof Game];
		}
	}

	// Add the required overrides
	const newGame: Omit<Game, 'id'> = {
		...(copiedData as Game),
		key: crypto.randomUUID().slice(0, 6).toUpperCase(),
		name: newName,
		teams: [],
		currentRoundIndex: 0,
		currentRoundId: null,
		gameStartedAt: null,
		gameFinishedAt: null,
		createdAt: Date.now(),
	};

	// Create the new game in Firestore
	const docRef = await addDoc(collection(db, 'insurance_game'), newGame);
	return { id: docRef.id, ...newGame };
};
