import { Choice, Round, Team } from '@/lib/types';
import TeamBoard from '@/components/TeamBoard';
import { cardstyle } from '../components/styling';

type GameRoundsProps = {
	teams: Team[];
	allRounds: Round[];
	currentRoundIndex: number;
	handleSelectChoice: (
		teamId: Team['id'],
		roundId: Round['round_id'],
		choice: Choice
	) => void;
	choices?: Choice[];
};

const GameRounds = ({
	teams,
	allRounds,
	currentRoundIndex,
	handleSelectChoice,
	choices,
}: GameRoundsProps) => {
	const currentRound = allRounds[currentRoundIndex];
	const currentRoundChoices = choices?.filter(
		(x) => x.round_id == currentRound.round_id
	);
	return (
		<div className="space-y-6 overflow-hidden">
			<div className="text-center">
				<h2 className="text-3xl font-bold text-teal-400 transition-opacity duration-300">
					{currentRound.round_name}
				</h2>
			</div>

			<div className="relative h-fit">
				<div
					key={currentRound.round_id}
					className={`transition-transform duration-500 ease-in-out`}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{teams.map((team: Team) =>
							TeamRoundCard(
								team,
								currentRound,
								handleSelectChoice,
								currentRoundChoices
							)
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default GameRounds;

function TeamRoundCard(
	team: Team,
	currentRound: Round,
	handleSelectChoice: (
		teamId: Team['id'],
		roundId: Round['round_id'],
		choice: Choice
	) => void,
	currentRoundChoices?: Choice[]
) {
	return (
		<div key={team.id} className={cardstyle}>
			<h3 className="text-2xl font-semibold text-teal-300">{team.teamName}</h3>
			<div className="mt-1 flex justify-between text-sm font-medium">
				<p className="text-gray-400">
					Verwachte winst:{' '}
					<span className="font-bold text-teal-500">
						{team.expected_profit_score ?? 0}
					</span>
				</p>
				<p className="text-gray-400">
					Liquiditeit:{' '}
					<span className="font-bold text-teal-500">
						{team.liquidity_score ?? 0}
					</span>
				</p>
				<p className="text-gray-400">
					Solvency:{' '}
					<span className="font-bold text-teal-500">
						{team.solvency_score ?? 0}
					</span>
				</p>
				<p className="text-gray-400">
					IT-score:{' '}
					<span className="font-bold text-teal-500">{team.IT_score ?? 0}</span>
				</p>
				<p className="text-gray-400">
					Capaciteit score:{' '}
					<span className="font-bold text-teal-500">
						{team.capacity_score ?? 0}
					</span>
				</p>
			</div>

			<div className="mt-4">
				<TeamBoard
					key={team.id}
					currentRound={currentRound}
					team={team}
					isAdminView={true}
					handleSelectChoice={(teamId, roundId, choice) => {
						handleSelectChoice(teamId, roundId, choice);
					}}
					currentRoundchoices={currentRoundChoices ?? []}
				/>
			</div>
		</div>
	);
}
