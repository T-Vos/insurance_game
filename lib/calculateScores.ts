import { Round, Team } from './types';

export const __initialBaseCapacity = {
	expected_profit_score: 0,
	liquidity_score: 0,
	solvency_score: 0,
	IT_score: 0,
	capacity_score: 0,
};

export interface baseCapacity {
	expected_profit_score: number;
	liquidity_score: number;
	solvency_score: number;
	IT_score: number;
	capacity_score: number;
}

export const calculateScores = (
	teams: Team[],
	rounds: Round[],
	roundIndex: number,
	initialBaseCapacity: baseCapacity = __initialBaseCapacity
) => {
	const roundCapacityBonus = roundIndex * 2;

	// This helper function finds a choice by its round ID and choice ID
	const findChoice = (roundId: string, choiceId: string) => {
		const round = rounds.find((r) => r.round_id === roundId);
		return round?.choices.find((c) => c.id === choiceId);
	};

	return teams.map((team) => {
		const newTeam = { ...team };

		let expected_profit_score = 0;
		let liquidity_score = 0;
		let solvency_score = 0;
		let IT_score = 0;
		let capacity_score_used = 0;

		// First, calculate base scores and used capacity
		newTeam.choices.forEach((chosenItem) => {
			const choice = findChoice(chosenItem.round_id, chosenItem.choice_id);
			if (choice) {
				expected_profit_score += choice.expected_profit_score;
				liquidity_score += choice.liquidity_score;
				solvency_score += choice.solvency_score;
				IT_score += choice.IT_score;

				const isActive =
					roundIndex >= chosenItem.roundIndex &&
					(choice.duration === null ||
						roundIndex < chosenItem.roundIndex + choice.duration);
				if (isActive) {
					capacity_score_used += choice.capacity_score;
				}
			}
		});

		// Second, apply interaction effects
		newTeam.choices.forEach((chosenItem) => {
			const choice = findChoice(chosenItem.round_id, chosenItem.choice_id);
			if (choice && choice.interactionEffects) {
				choice.interactionEffects.forEach((effect) => {
					const hasTargetChoice = newTeam.choices.some(
						(c) =>
							c.choice_id === effect.targetChoiceId &&
							c.round_id === effect.roundId
					);
					if (hasTargetChoice) {
						expected_profit_score += effect.bonusScore;
					}
				});
			}
		});

		newTeam.expected_profit_score =
			initialBaseCapacity.expected_profit_score + expected_profit_score;
		newTeam.liquidity_score =
			initialBaseCapacity.liquidity_score + liquidity_score;
		newTeam.solvency_score =
			initialBaseCapacity.solvency_score + solvency_score;
		newTeam.IT_score = initialBaseCapacity.IT_score + IT_score;
		newTeam.capacity_score =
			initialBaseCapacity.capacity_score + roundCapacityBonus;

		return newTeam;
	});
};
