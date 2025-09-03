// transpose.ts
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			require('./serviceAccount.json')
		),
	});
}

export const adminDb = admin.firestore();

async function transposeFirestoreData() {
	console.log('Starting data transposition...');

	// Get a reference to the main 'insurance_game' collection
	const gamesRef = adminDb.collection('insurance_game');
	const gamesSnapshot = await gamesRef.get();

	if (gamesSnapshot.empty) {
		console.log('No game documents found to transpose. Exiting.');
		return;
	}

	// Use a transaction for atomic operations on a single game document
	const batch = adminDb.batch();

	for (const gameDoc of gamesSnapshot.docs) {
		const gameData = gameDoc.data();
		const gameId = gameDoc.id;

		console.log(`Processing game: ${gameId}`);

		const teams = gameData.teams;
		const rounds = gameData.rounds;

		// --- Process Teams ---
		if (teams && Array.isArray(teams)) {
			console.log(`  - Found ${teams.length} teams. Creating new documents...`);
			const teamsRef = gamesRef.doc(gameId).collection('teams');
			for (const team of teams) {
				// Use the team's existing ID to maintain links
				const teamDocRef = teamsRef.doc(team.id);
				const { id, ...teamData } = team; // Exclude 'id' as it's now the doc ID
				batch.set(teamDocRef, teamData);
			}
		}

		// --- Process Rounds and Choices ---
		if (rounds && Array.isArray(rounds)) {
			console.log(
				`  - Found ${rounds.length} rounds. Creating new documents...`
			);
			const roundsRef = gamesRef.doc(gameId).collection('rounds');
			const choicesRef = gamesRef.doc(gameId).collection('choices');

			for (const round of rounds) {
				// Use the round's existing ID
				const roundDocRef = roundsRef.doc(round.round_id);
				const { choices, ...roundData } = round; // Separate choices from round data
				batch.set(roundDocRef, roundData);

				// Process choices as a separate subcollection
				if (choices && Array.isArray(choices)) {
					for (const choice of choices) {
						// Use the choice's existing ID
						const choiceDocRef = choicesRef.doc(choice.id);
						// Add a reference to the round it belongs to
						const choiceData = { ...choice, round_id: round.round_id };
						batch.set(choiceDocRef, choiceData);
					}
				}
			}
		}

		// --- Remove old arrays from the main document ---
		console.log(`  - Removing old arrays from game document...`);
		batch.update(gameDoc.ref, {
			teams: admin.firestore.FieldValue.delete(),
			rounds: admin.firestore.FieldValue.delete(),
		});
	}

	// Commit the batched write
	try {
		await batch.commit();
		console.log('Transposition completed successfully!');
	} catch (error) {
		console.error('Batch commit failed:', error);
	}
}

// Run the function
transposeFirestoreData().catch(console.error);
