import { calculateScores } from '@/lib/calculateScores';
import {
	Choice,
	Game,
	Round,
	Scores,
	ScoreType,
	scoreTypes,
	Team,
} from '@/lib/types';
import clsx from 'clsx';

type GameScoresTableProps = {
	game?: Game | null;
	choices?: Choice[];
	rounds?: Round[];
	teams?: Team[];
};

const GameGraphs = ({ game, choices, rounds, teams }: GameScoresTableProps) => {
	if (!game) return <div>Geen spel gevonden</div>;
	if (!choices) return <div>Geen keuzes gevonden</div>;
	if (!rounds) return <div>Geen rondes gevonden</div>;
	if (!teams) return <div>Geen teams gevonden</div>;

	// scores per team per round, keyed by teamId
	const scoresPerTeamPerRound: Record<
		string,
		{ [K in (typeof scoreTypes)[number]['name']]: number[] }
	> = {};

	teams.forEach((team) => {
		// initialize empty arrays for each score type
		scoresPerTeamPerRound[team.id] = scoreTypes.reduce((acc, { name }) => {
			acc[name] = [];
			return acc;
		}, {} as { [K in (typeof scoreTypes)[number]['name']]: number[] });

		rounds.forEach((_, roundIndex) => {
			const teamScores = calculateScores(
				game,
				teams,
				rounds,
				choices,
				roundIndex
			).find((t) => t.id === team.id)!;

			scoreTypes.forEach(({ name }) => {
				scoresPerTeamPerRound[team.id][name].push(
					teamScores[name as keyof Scores] as number
				);
			});
		});
	});

	const determineCritical = (score: number, scoreType: ScoreType): string => {
		const gameover_condition: number = game[`gameover_${scoreType}`] || 0;
		if (score <= gameover_condition) return 'font-bold text-yellow-400';
		const critical_condition: number = game[`critical_${scoreType}`] || 0;
		if (score <= critical_condition) return 'font-bold text-red-500';
		return '';
	};

	return (
		<div className="p-6">
			{teams.map((team) => (
				<div
					key={team.id}
					className="mb-8 p-4 rounded-lg shadow-md overflow-x-auto"
				>
					<h2 className="text-xl font-bold mb-4">{team.teamName}</h2>
					{!rounds || rounds.length <= 0 ? (
						<p>Nog geen rondes</p>
					) : (
						<table className="min-w-full border border-gray-300">
							<thead className="bg-gray-200 dark:bg-gray-800">
								<tr>
									<th className="border px-4 py-2">Score Type</th>
									{rounds.map((r, idx) => (
										<th key={idx} className="border px-4 py-2">
											Ronde {idx + 1}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{scoreTypes.map(({ name, icon: Icon }) => (
									<tr key={name}>
										<td className="border flex flex-row gap-4 items-center px-4 py-2 font-medium">
											<Icon className="w-4 h-4" />
											{name}
										</td>
										{scoresPerTeamPerRound[team.id][name].map((score, idx) => (
											<td key={idx} className="border px-4 py-2 text-center">
												<span className={clsx(determineCritical(score, name))}>
													{score}
												</span>
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			))}
		</div>
	);
};

export default GameGraphs;
