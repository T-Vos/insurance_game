import { useEffect, useRef, useState } from 'react';
import { LucideCheckSquare, LucideSquare } from 'lucide-react';
import { Choice, Round, Team } from '@/lib/types';
import TeamBoard from '@/components/TeamBoard';

type GameRoundsProps = {
	teams: Team[];
	roundChoices: Round[];
	currentRoundIndex: number;
	handleSelectChoice: (
		teamId: number | string,
		roundId: number | string,
		choice: Choice
	) => void;
};

const GameRounds = ({
	teams,
	roundChoices,
	currentRoundIndex,
	handleSelectChoice,
}: GameRoundsProps) => {
	const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
	const prevRoundIndex = useRef(currentRoundIndex);

	useEffect(() => {
		if (currentRoundIndex > prevRoundIndex.current) {
			setDirection('forward');
		} else if (currentRoundIndex < prevRoundIndex.current) {
			setDirection('backward');
		}
		prevRoundIndex.current = currentRoundIndex;
	}, [currentRoundIndex]);

	const currentRound = roundChoices[currentRoundIndex];

	return (
		<div className="space-y-6 overflow-hidden">
			<div className="text-center">
				<h2 className="text-3xl font-bold text-teal-400 transition-opacity duration-300">
					{currentRound.round_name}
				</h2>
				<p className="mt-2 text-gray-400">
					Select a choice for each team to update their score.
				</p>
			</div>

			<div className="relative h-fit">
				<div
					key={currentRound.round_id}
					className={`transition-transform duration-500 ease-in-out
					${
						direction === 'forward'
							? 'animate-slide-in-forward'
							: 'animate-slide-in-backward'
					}`}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{teams.map((team) => (
							<div
								key={team.id}
								className="bg-gray-800 rounded-2xl p-6 shadow-xl border-t-4 border-gray-700"
							>
								<h3 className="text-2xl font-semibold text-teal-300">
									{team.teamName}
								</h3>
								<div className="mt-1 flex justify-between text-sm font-medium">
									<p className="text-gray-400">
										Score:{' '}
										<span className="font-bold text-teal-500">
											{team.score}
										</span>
									</p>
									<p className="text-gray-400">
										Capacity:{' '}
										<span className="font-bold text-orange-500">
											{team.capacity}
										</span>
									</p>
								</div>

								<div className="mt-4">
									<TeamBoard
										key={team.id}
										currentRound={currentRound}
										team={team}
										handleSelectChoice={(teamId, roundId, choice) => {
											handleSelectChoice(teamId, roundId, choice);
										}}
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default GameRounds;
