'use client';
import React from 'react';
import { LucideCheckSquare, LucideSquare } from 'lucide-react';
import { Round, Team } from '@/lib/types';

interface TeamBoardProps {
	team: Team;
	currentRound: Round;
	handleSelectChoice: (teamId: string, roundId: string, choice: any) => void;
	handleSaveChoice: (teamId: string, roundId: string) => void;
}

export default function TeamBoard({
	team,
	currentRound,
	handleSelectChoice,
	handleSaveChoice,
}: TeamBoardProps) {
	if (!team || !currentRound) return <div>Loading team data...</div>;

	// Find the selected choice for this round
	const selectedChoice = team.choices.find(
		(c: any) => c.round_id === currentRound.round_id
	);

	const saved = selectedChoice?.saved ?? false;

	return (
		<div className="rounded-2xl p-6 shadow-xl border-t-4 border-gray-700 bg-white">
			{/* <h3 className="text-2xl font-semibold text-teal-300">{team.teamName}</h3> */}
			{/* <div className="mt-1 flex justify-between text-sm font-medium">
				<p className="text-gray-400">
					Score: <span className="font-bold text-teal-500">{team.score}</span>
				</p>
				<p className="text-gray-400">
					Capacity:{' '}
					<span className="font-bold text-orange-500">{team.capacity}</span>
				</p>
			</div> */}

			<div className="mt-4 space-y-3">
				{currentRound.choices.map((choice: any) => {
					const isSelected = selectedChoice?.choice_id === choice.id;

					const buttonClasses = `
			relative w-full text-left py-3 px-4 rounded-lg transition-all duration-200
			flex justify-between items-center group
			${isSelected ? 'text-white shadow-md' : 'text-gray-900 dark:text-gray-200'}
			${saved ? 'opacity-50 cursor-not-allowed' : ''}
		  `;

					const CheckIcon = isSelected ? LucideCheckSquare : LucideSquare;

					return (
						<button
							key={choice.id}
							onClick={() =>
								handleSelectChoice(team.id, currentRound.round_id, choice)
							}
							className={buttonClasses}
							disabled={saved}
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
								{/* <p className="text-sm font-bold opacity-80">
									{choice.score >= 0 ? '+' : ''}
									{choice.score}
								</p> */}
								{/* {choice.duration > 1 && (
									<p className="text-xs text-orange-400 font-semibold mt-1">
										{choice.duration} rounds
									</p>
								)} */}
							</div>
						</button>
					);
				})}
			</div>

			{/* Accept/Save Choice Button */}
			<div className="mt-4">
				<button
					onClick={() => handleSaveChoice(team.id, currentRound.round_id)}
					disabled={!selectedChoice || saved}
					className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-all ${
						saved
							? 'bg-gray-500 cursor-not-allowed'
							: 'bg-green-600 hover:bg-green-700'
					}`}
				>
					{saved ? 'Choice Saved' : 'Accept Choice'}
				</button>
			</div>
		</div>
	);
}
