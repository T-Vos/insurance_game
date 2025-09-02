import { calculateScores } from '@/lib/calculateScores';
import { Game, Scores } from '@/lib/types';
import clsx from 'clsx';

const scoreTypes = [
	'expected_profit_score',
	'liquidity_score',
	'solvency_score',
	'IT_score',
	'capacity_score',
] as const;

type GameScoresTableProps = {
	game?: Game | null;
};

const GameGraphs = ({ game }: GameScoresTableProps) => {
	if (!game) return <div>Geen spel gevonden</div>;
	const { rounds, teams } = game;
	if (!rounds) return <div>Geen rondes gevonden</div>;
	if (!teams) return <div>Geen teams gevonden</div>;

	// Calculate scores per team per round
	const scoresPerTeamPerRound: Record<
		string,
		{ [scoreType in (typeof scoreTypes)[number]]: number[] }
	> = {};

	teams.forEach((team) => {
		scoresPerTeamPerRound[team.id] = {
			expected_profit_score: [],
			liquidity_score: [],
			solvency_score: [],
			IT_score: [],
			capacity_score: [],
		};

		rounds.forEach((_, roundIndex) => {
			const teamScores = calculateScores(game, roundIndex).find(
				(t) => t.id === team.id
			)!;

			scoreTypes.forEach((scoreType) => {
				scoresPerTeamPerRound[team.id][scoreType].push(
					teamScores[scoreType as keyof Scores] as number
				);
			});
		});
	});

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
								{scoreTypes.map((scoreType) => (
									<tr key={scoreType}>
										<td className="border px-4 py-2 font-medium">
											{scoreType.replace(/_/g, ' ').toUpperCase()}
										</td>
										{scoresPerTeamPerRound[team.id][scoreType].map(
											(score, idx) => (
												<td key={idx} className="border px-4 py-2 text-center">
													<span className={clsx(score <= 0 ? 'font-bold' : '')}>
														{score}
													</span>
												</td>
											)
										)}
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
