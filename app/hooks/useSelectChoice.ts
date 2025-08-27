import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Team, Round, Choice, ChosenItem, Game } from '@/lib/types';

export function useSelectChoice(game: Game | null) {
	const handleSelectChoice = async (
		teamId: Team['id'],
		roundId: Round['round_id'],
		choice: Choice
	) => {
		if (!game) return;

		const teamIndex = game.teams.findIndex((t: Team) => t.id === teamId);
		if (teamIndex === -1) return;

		const team = game.teams[teamIndex];

		const roundChoice = team.choices.find(
			(c: ChosenItem) => c.round_id === roundId
		);
		if (roundChoice?.saved) return; // cannot change saved choice

		const updatedChoices: ChosenItem[] = [
			...team.choices.filter((c: ChosenItem) => c.round_id !== roundId),
			{
				round_id: roundId,
				choice_id: choice.id,
				roundIndex: game.currentRoundIndex,
				saved: false,
			},
		];

		const updatedTeams = [...game.teams];
		updatedTeams[teamIndex] = { ...team, choices: updatedChoices };

		await updateDoc(doc(db, 'insurance_game', game.id), {
			teams: updatedTeams,
		});
	};

	return { handleSelectChoice };
}
