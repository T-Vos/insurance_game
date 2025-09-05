import { Game, Team, Scores, Choice, Round } from './types';

/**
 * Calculates the cumulative scores for all teams up to a specific round index.
 * @author Thomas Vos
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

	const findChoice = (choiceId: string): Choice | undefined => {
		return allChoices.find((c) => c.id === choiceId);
	};

	if (!allRounds || !allChoices) {
		return teams;
	}

	return teams.map((team) => {
		const finalScores: Scores = {
			expected_profit_score: start_expected_profit_score || 0,
			liquidity_score: start_liquidity_score || 0,
			solvency_score: start_solvency_score || 0,
			IT_score: start_IT_score || 0,
			capacity_score: start_capacity_score || 0,
		};

		for (let i = 0; i <= roundIndex; i++) {
			const currentRound = allRounds[i];
			if (!currentRound) continue;

			finalScores.expected_profit_score +=
				currentRound.round_schock_expected_profit_score || 0;
			finalScores.liquidity_score +=
				currentRound.round_schock_liquidity_score || 0;
			finalScores.solvency_score +=
				currentRound.round_schock_solvency_score || 0;
			finalScores.IT_score += currentRound.round_schock_IT_score || 0;
			finalScores.capacity_score +=
				currentRound.round_schock_capacity_score || 0;

			const teamChoiceInRound = team.choices?.find((c) => c.roundIndex === i);

			if (teamChoiceInRound) {
				if (!teamChoiceInRound.accepted) continue;
				const choiceData = findChoice(teamChoiceInRound.choice_id);
				if (choiceData) {
					const duration = choiceData.duration;
					const isChoiceActive =
						duration === undefined ||
						duration === null ||
						i < teamChoiceInRound.roundIndex + duration;

					if (isChoiceActive) {
						finalScores.expected_profit_score +=
							choiceData.expected_profit_score || 0;
						finalScores.liquidity_score += choiceData.liquidity_score || 0;
						finalScores.solvency_score += choiceData.solvency_score || 0;
						finalScores.IT_score += choiceData.IT_score || 0;
						finalScores.capacity_score -= choiceData.capacity_score || 0;
					}
				}
			}
			team.choices?.forEach((pastChoice) => {
				const choiceData = findChoice(pastChoice.choice_id);

				if (choiceData?.delayedEffect) {
					choiceData.delayedEffect.forEach((effect) => {
						if (effect.effective_round === currentRound.round_id) {
							finalScores.expected_profit_score +=
								effect.expected_profit_score || 0;
							finalScores.liquidity_score += effect.liquidity_score || 0;
							finalScores.solvency_score += effect.solvency_score || 0;
							finalScores.IT_score += effect.IT_score || 0;
							finalScores.capacity_score -= effect.capacity_score || 0;
						}
					});
				}
			});
		}

		return {
			...team,
			...finalScores,
		};
	});
};
