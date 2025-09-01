'use client';
import React from 'react';
import { LucideCheckSquare, LucideSquare } from 'lucide-react';
import { Choice, TeamChoice, Round, Team } from '@/lib/types';
import clsx from 'clsx';

interface TeamBoardProps {
	team: Team;
	currentRound: Round;
	isAdminView?: boolean;
	handleSelectChoice: (
		teamId: Team['id'],
		roundId: Round['round_id'],
		choice: Choice
	) => void;
	handleSaveChoice?: (teamId: Team['id'], roundId: Round['round_id']) => void;
}
export default function TeamBoard({
	team,
	currentRound,
	isAdminView = false,
	handleSelectChoice,
	handleSaveChoice,
}: TeamBoardProps) {
	if (!team || !currentRound) return <div>Loading team data...</div>;
	if (!currentRound.choices) return <div>Geen keuzes beschikbaar</div>;
	const selectedChoice = team.choices.find(
		(c: TeamChoice) => c.round_id === currentRound.round_id
	);

	const _Disabled: boolean = isAdminView
		? false
		: selectedChoice?.saved ?? false;

	return (
		<div className="">
			<div className="mt-4 space-y-3">
				{currentRound.choices.map((choice: Choice) => {
					const isSelected = selectedChoice?.choice_id === choice.id;
					return choiceButton(choice, isSelected);
				})}
			</div>
			{handleSaveChoice && (
				<div className="mt-4">
					<button
						onClick={() => handleSaveChoice(team.id, currentRound.round_id)}
						disabled={
							!selectedChoice || _Disabled || !currentRound.round_started_at
						}
						className={clsx(
							'w-full py-3 enebled:cursor-pointer px-6 rounded-lg text-white font-semibold transition-all',
							_Disabled ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'
						)}
					>
						{_Disabled ? 'Keuze opgeslagen' : 'Bevestig keuze'}
					</button>
				</div>
			)}
		</div>
	);

	function choiceButton(
		choice: Choice,
		isSelected: boolean
	): React.JSX.Element {
		const buttonClasses = clsx(
			'relative w-full text-left py-3 px-4 rounded-lg transition-all duration-200 flex justify-between items-center group',
			'enabled:hover:bg-gray-100 enabled:cursor-pointer',
			'dark:text-gray-200 dark:hover:bg-gray-600 dark:bg-gray-700 enabled:dark:hover:bg-gray-600',
			isSelected && 'shadow-md',
			_Disabled && 'opacity-50'
		);

		const CheckIcon = isSelected ? LucideCheckSquare : LucideSquare;

		return (
			<button
				key={choice.id}
				onClick={() =>
					handleSelectChoice(team.id, currentRound.round_id, choice)
				}
				className={buttonClasses}
				disabled={_Disabled}
			>
				<div className="flex items-center space-x-3">
					<CheckIcon
						className={clsx(
							'h-5 w-5',
							isSelected
								? 'text-gray-800 dark:text-gray-200'
								: 'text-gray-800 dark:text-gray-200'
						)}
					/>
					<span
						className={clsx('font-medium text-gray-800 dark:text-gray-200')}
					>
						{choice.description}
					</span>
				</div>
				{/* <div className="flex-shrink-0 text-right"> */}
				{/* <p className="text-sm font-bold opacity-80">
            {choice.score >= 0 ? '+' : ''}
            {choice.score}
        </p> */}
				{/* {choice.duration > 1 && (
            <p className="text-xs text-orange-400 font-semibold mt-1">
                {choice.duration} rounds
            </p>
        )} */}
				{/* </div> */}
			</button>
		);
	}
}
