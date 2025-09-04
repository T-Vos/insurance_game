import { Game, Team, Scores, Choice, Round } from './types';

/**
 * Calculates the cumulative scores for all teams up to a specific round index.
 *
 * @param {Game} gameData The full game data object containing rounds and initial scores.
 * @param {Team[]} teams The array of all team data.
 * @param {Round[]} allRounds The array of all round data.
 * @param {Choice[]} allChoices The array of all choice data.
 * @param {number} roundIndex The index of the round up to which scores should be calculated.
 * @returns {Team[]} A new array of teams with their updated scores.
 */
export const calculateScores = (
	gameData: Game,
	teams: Team[],
	allRounds: Round[],
	allChoices: Choice[],
	roundIndex: number
): Team[] => {
	const {
		start_expected_profit_score,
		start_liquidity_score,
		start_solvency_score,
		start_IT_score,
		start_capacity_score,
	} = gameData;

	// Helper function to find a choice's data from a given choiceId
	const findChoice = (choiceId: string): Choice | undefined => {
		return allChoices.find((c) => c.id === choiceId);
	};

	if (!allRounds || !allChoices) {
		return teams;
	}

	return teams.map((team) => {
		// Initialize scores with the game's starting conditions
		const finalScores: Scores = {
			expected_profit_score: start_expected_profit_score || 0,
			liquidity_score: start_liquidity_score || 0,
			solvency_score: start_solvency_score || 0,
			IT_score: start_IT_score || 0,
			capacity_score: start_capacity_score || 0,
		};

		// Iterate through all rounds up to the current round index
		for (let i = 0; i <= roundIndex; i++) {
			const currentRound = allRounds[i];

			if (!currentRound) continue; // Should not happen but good practice

			// 1. Apply the round-specific shock to the cumulative scores
			finalScores.expected_profit_score +=
				currentRound.round_schock_expected_profit_score || 0;
			finalScores.liquidity_score +=
				currentRound.round_schock_liquidity_score || 0;
			finalScores.solvency_score +=
				currentRound.round_schock_solvency_score || 0;
			finalScores.IT_score += currentRound.round_schock_IT_score || 0;
			finalScores.capacity_score +=
				currentRound.round_schock_capacity_score || 0;

			// Find the choice this team made in the current round
			const teamChoiceInRound = team.choices?.find((c) => c.roundIndex === i);

			if (teamChoiceInRound) {
				const choiceData = findChoice(teamChoiceInRound.choice_id);

				if (choiceData) {
					// Check if the choice's immediate effect is still active
					const duration = choiceData.duration;
					const isChoiceActive =
						duration === undefined ||
						duration === null ||
						i < teamChoiceInRound.roundIndex + duration;

					if (isChoiceActive) {
						// 2. Apply the choice-specific immediate score changes
						finalScores.expected_profit_score +=
							choiceData.expected_profit_score || 0;
						finalScores.liquidity_score += choiceData.liquidity_score || 0;
						finalScores.solvency_score += choiceData.solvency_score || 0;
						finalScores.IT_score += choiceData.IT_score || 0;
						finalScores.capacity_score -= choiceData.capacity_score || 0; // Assuming capacity is also a cost
					}
				}
			}

			// --- NEW LOGIC FOR DELAYED EFFECTS ---
			// Iterate through all of the team's past choices to check for delayed effects
			team.choices?.forEach((pastChoice) => {
				const choiceData = findChoice(pastChoice.choice_id);

				if (choiceData?.delayedEffect) {
					// Check if any delayed effect in this choice is effective in the current round
					choiceData.delayedEffect.forEach((effect) => {
						if (effect.effective_round === currentRound.round_id) {
							// Apply the delayed score changes
							finalScores.expected_profit_score +=
								effect.expected_profit_score || 0;
							finalScores.liquidity_score += effect.liquidity_score || 0;
							finalScores.solvency_score += effect.solvency_score || 0;
							finalScores.IT_score += effect.IT_score || 0;
							finalScores.capacity_score -= effect.capacity_score || 0; // Assuming capacity is also a cost
						}
					});
				}
			});
			// --- END NEW LOGIC ---
		}

		// Return the new team object with the calculated scores
		return {
			...team,
			...finalScores,
		};
	});
};
