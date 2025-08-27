import React, { useState, useRef, useEffect } from 'react';
import {
	LucidePlus,
	LucidePenTool,
	LucideUsersRound,
	LucideComputer,
	LucideHandCoins,
	LucidePiggyBank,
	LucideDroplet,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Game } from '@/lib/types';
import { cardstyle, title_changeable } from './styling';

export type GameConfigHeaderProps = {
	gameData: Game | null;
	handleAddRound: () => void;
	onUpdateGameConfig: (key: keyof Game, value: string | number) => void;
};

export const GameConfigHeader = ({
	gameData,
	handleAddRound,
	onUpdateGameConfig,
}: GameConfigHeaderProps) => {
	const [isEditingName, setIsEditingName] = useState(false);
	const [editingName, setEditingName] = useState<string>(
		gameData?.name ?? 'Game name'
	);
	const nameInputRef = useRef<HTMLInputElement>(null);

	// Effect to focus the input field when editing starts
	useEffect(() => {
		if (isEditingName && nameInputRef.current) {
			nameInputRef.current.focus();
		}
	}, [isEditingName]);

	const finishEditingName = () => {
		setIsEditingName(false);
		if (editingName.trim() !== gameData?.name) {
			onUpdateGameConfig('name', editingName.trim());
		}
	};

	// Handler for updating the score inputs
	const handleScoreChange = (scoreKey: keyof Game, value: string) => {
		const newValue = parseFloat(value);
		if (!isNaN(newValue)) {
			onUpdateGameConfig(scoreKey, newValue);
		}
	};

	return (
		<div className={cardstyle}>
			<div className="flex flex-col justify-between sm:flex-row gap-4 items-center">
				{/* Editable Game Title Section */}
				{isEditingName ? (
					<input
						ref={nameInputRef}
						type="text"
						value={editingName}
						onChange={(e) => setEditingName(e.target.value)}
						onBlur={finishEditingName}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								finishEditingName();
							}
							if (e.key === 'Escape') {
								setEditingName(gameData?.name ?? '');
								setIsEditingName(false);
							}
						}}
						className={clsx(
							title_changeable,
							'bg-gray-700 rounded-lg px-3 py-1 w-full sm:w-auto min-w-[200px]'
						)}
					/>
				) : (
					<h2
						className={clsx(
							title_changeable,
							'cursor-pointer flex items-center gap-2'
						)}
						onClick={() => setIsEditingName(true)}
						title="Click to edit game name"
					>
						{gameData?.name || 'Game Title'}
						<LucidePenTool size={18} className="text-gray-400" />
					</h2>
				)}

				{/* Add Round Button */}
				<button
					onClick={handleAddRound}
					className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md transform hover:scale-105 active:scale-95"
				>
					<LucidePlus size={18} />
					<span>Add New Round</span>
				</button>
			</div>

			<div className="border-t border-gray-600 my-8"></div>

			{/* Start Conditions Section */}
			<h3 className="text-xl font-bold text-gray-300 mb-4">Start Conditions</h3>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
				{/* Expected Profit Input */}
				<div className="flex flex-col items-center gap-2 bg-gray-700 rounded-lg p-3">
					<LucideHandCoins className="text-yellow-400" />
					<span
						title="Expected Profit"
						className="text-sm font-medium text-gray-400"
					>
						Profit
					</span>
					<input
						type="number"
						value={gameData?.start_expected_profit_score || 0}
						onChange={(e) =>
							handleScoreChange('start_expected_profit_score', e.target.value)
						}
						className="w-full text-center bg-gray-900 text-white rounded-md px-2 py-1 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
					/>
				</div>
				{/* Liquidity Input */}
				<div className="flex flex-col items-center gap-2 bg-gray-700 rounded-lg p-3">
					<LucideDroplet className="text-blue-400" />
					<span title="Liquidity" className="text-sm font-medium text-gray-400">
						Liquidity
					</span>
					<input
						type="number"
						value={gameData?.start_liquidity_score || 0}
						onChange={(e) =>
							handleScoreChange('start_liquidity_score', e.target.value)
						}
						className="w-full text-center bg-gray-900 text-white rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
					/>
				</div>
				{/* Solvency Input */}
				<div className="flex flex-col items-center gap-2 bg-gray-700 rounded-lg p-3">
					<LucidePiggyBank className="text-green-400" />
					<span title="Solvency" className="text-sm font-medium text-gray-400">
						Solvency (%)
					</span>
					<input
						type="number"
						value={gameData?.start_solvency_score || 0}
						onChange={(e) =>
							handleScoreChange('start_solvency_score', e.target.value)
						}
						className="w-full text-center bg-gray-900 text-white rounded-md px-2 py-1 focus:ring-2 focus:ring-green-400 focus:outline-none"
					/>
				</div>
				{/* IT Score Input */}
				<div className="flex flex-col items-center gap-2 bg-gray-700 rounded-lg p-3">
					<LucideComputer className="text-purple-400" />
					<span title="IT Score" className="text-sm font-medium text-gray-400">
						IT (%)
					</span>
					<input
						type="number"
						value={gameData?.start_IT_score || 0}
						onChange={(e) =>
							handleScoreChange('start_IT_score', e.target.value)
						}
						className="w-full text-center bg-gray-900 text-white rounded-md px-2 py-1 focus:ring-2 focus:ring-purple-400 focus:outline-none"
					/>
				</div>
				{/* Capacity Input */}
				<div className="flex flex-col items-center gap-2 bg-gray-700 rounded-lg p-3">
					<LucideUsersRound className="text-pink-400" />
					<span title="Capacity" className="text-sm font-medium text-gray-400">
						Capacity (%)
					</span>
					<input
						type="number"
						value={gameData?.start_capacity_score || 0}
						onChange={(e) =>
							handleScoreChange('start_capacity_score', e.target.value)
						}
						className="w-full text-center bg-gray-900 text-white rounded-md px-2 py-1 focus:ring-2 focus:ring-pink-400 focus:outline-none"
					/>
				</div>
			</div>
		</div>
	);
};

export default GameConfigHeader;
