import { LucideCheckSquare, LucideSquare } from 'lucide-react';

const GameRounds = ({
	teams,
	roundChoices,
	currentRoundIndex,
	handleSelectChoice,
}) => {
	const currentRound = roundChoices[currentRoundIndex];

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-3xl font-bold text-teal-400">
					{currentRound.round_name}
				</h2>
				<p className="mt-2 text-gray-400">
					Select a choice for each team to update their score.
				</p>
			</div>

			{/* Container for team scorecards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{teams.map((team) => (
					<div
						key={team.id}
						className="bg-gray-800 rounded-2xl p-6 shadow-xl border-t-4 border-gray-700"
					>
						<h3 className="text-2xl font-semibold text-teal-300">
							{team.teamName}
						</h3>
						<p className="text-sm font-medium text-gray-400 mt-1">
							Current Score:{' '}
							<span className="font-bold text-teal-500">{team.score}</span>
						</p>

						{/* List of choices for the current round */}
						<div className="mt-4 space-y-3">
							{currentRound.choices.map((choice) => {
								const isSelected = team.choices.some(
									(c) =>
										c.round_id === currentRound.round_id &&
										c.choice_id === choice.id
								);
								const buttonClasses = `
                  relative w-full text-left py-3 px-4 rounded-lg transition-all duration-200
                  flex justify-between items-center group
                  ${
										isSelected
											? 'bg-teal-600 text-white shadow-md'
											: 'bg-gray-700 text-gray-200 hover:bg-gray-600'
									}
                `;

								// Icon to indicate selection status
								const CheckIcon = isSelected ? LucideCheckSquare : LucideSquare;

								return (
									<button
										key={choice.id}
										onClick={() =>
											handleSelectChoice(team.id, currentRound.round_id, choice)
										}
										className={buttonClasses}
										title={
											isSelected ? 'Deselect this choice' : 'Select this choice'
										}
									>
										<div className="flex items-center space-x-3">
											<CheckIcon
												className={`h-5 w-5 ${
													isSelected
														? 'text-white'
														: 'text-gray-400 group-hover:text-teal-300'
												}`}
											/>
											<span className="font-medium">{choice.description}</span>
										</div>
										<div className="flex-shrink-0 text-right">
											<p className="text-sm font-bold opacity-80">
												+{choice.score}
											</p>
											<p className="text-xs opacity-60">
												Capacity: {choice.capacity}
											</p>
										</div>
									</button>
								);
							})}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
export default GameRounds;
