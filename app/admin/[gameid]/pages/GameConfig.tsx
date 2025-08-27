'use client';
import { useState, useEffect } from 'react';
import { Round, Choice, Game } from '@/lib/types';
import { generateGameKey } from '@/lib/generate_game_key';
import { cardstyle, title, title_changeable } from '../components/styling';
import clsx from 'clsx';
import { ChoicesList } from '../components/ChoicesList';
import GameConfigHeader from '../components/gameConfigHeader';
import {
	LucideHandCoins,
	LucideDroplet,
	LucidePiggyBank,
	LucideComputer,
	LucideUsersRound,
} from 'lucide-react';

type GameConfigProps = {
	roundChoices: Round[];
	currentRoundIndex: number;
	handleUpdateRound: (updatedRound: Round) => void;
	handleAddRound: () => void;
	gameData: Game | null;
};

const GameConfig = ({
	roundChoices,
	currentRoundIndex,
	handleUpdateRound,
	handleAddRound,
	gameData,
}: GameConfigProps) => {
	const currentRound = roundChoices[currentRoundIndex];
	const [isEditingName, setIsEditingName] = useState(false);
	const [editingName, setEditingName] = useState(
		currentRound?.round_name || ''
	);
	const [editingChoices, setEditingChoices] = useState<Choice[]>([]);

	useEffect(() => {
		if (currentRound) {
			setEditingName(currentRound.round_name);
			setEditingChoices(currentRound.choices);
		}
	}, [currentRound]);

	if (!currentRound) {
		return (
			<GameConfigHeader
				handleAddRound={handleAddRound}
				gameData={gameData}
				onUpdateGameConfig={function (key: keyof Game, value: string): void {
					throw new Error('Function not implemented.');
				}}
			/>
		);
	}

	const saveAllChanges = () => {
		handleUpdateRound({
			...currentRound,
			round_name: editingName.trim(),
			choices: editingChoices,
		});
	};

	const handleUpdateChoice = (
		choiceIndex: number,
		newChoiceData: Partial<Choice>
	) => {
		setEditingChoices((prevChoices) =>
			prevChoices.map((choice, index) =>
				index === choiceIndex ? { ...choice, ...newChoiceData } : choice
			)
		);
	};

	const handleAddChoice = () => {
		const newChoiceId = generateGameKey(14);
		const newChoice: Choice = {
			id: newChoiceId,
			description: 'Nieuwe keuze',
			reveals: [],
			interactionEffects: [],
			capacity_score: 0,
			expected_profit_score: 0,
			IT_score: 0,
			liquidity_score: 0,
			solvency_score: 0,
			blockeding_circumstances: [],
		};
		setEditingChoices((prevChoices) => [...prevChoices, newChoice]);
	};

	const handleRemoveChoice = (choiceId: string) => {
		// TODO remove from database
		setEditingChoices((prevChoices) =>
			prevChoices.filter((choice) => choice.id !== choiceId)
		);
	};

	return (
		<div className="flex flex-col gap-3">
			<GameConfigHeader
				handleAddRound={handleAddRound}
				gameData={gameData}
				onUpdateGameConfig={function (key: keyof Game, value: string): void {
					throw new Error('Function not implemented.');
				}}
			/>
			<div className={cardstyle}>
				<RoundHeader
					isEditingName={isEditingName}
					setIsEditingName={setIsEditingName}
					editingName={editingName}
					setEditingName={setEditingName}
					currentRoundName={currentRound.round_name}
					finishEditingName={saveAllChanges}
				/>
				<RoundConditions />
				<ChoicesList
					editingChoices={editingChoices}
					handleUpdateChoice={handleUpdateChoice}
					handleRemoveChoice={handleRemoveChoice}
					handleAddChoice={handleAddChoice}
					roundChoices={roundChoices}
				/>
			</div>
		</div>
	);
};

export default GameConfig;

type RoundHeaderProps = {
	isEditingName: boolean;
	setIsEditingName: (isEditing: boolean) => void;
	editingName: string;
	setEditingName: (name: string) => void;
	currentRoundName: string;
	finishEditingName: () => void;
};

const RoundHeader = ({
	isEditingName,
	setIsEditingName,
	editingName,
	setEditingName,
	currentRoundName,
	finishEditingName,
}: RoundHeaderProps) => {
	return (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
			<div className="flex-1 min-w-0">
				{isEditingName ? (
					<input
						type="text"
						value={editingName}
						onChange={(e) => setEditingName(e.target.value)}
						onBlur={finishEditingName}
						onKeyDown={(e) => {
							if (e.key === 'Enter') finishEditingName();
							if (e.key === 'Escape') {
								setEditingName(currentRoundName);
								setIsEditingName(false);
							}
						}}
						autoFocus
						className={clsx(title, 'bg-gray-700 rounded px-2 py-1 w-full')}
					/>
				) : (
					<h2
						className={clsx(title_changeable, 'cursor-pointer')}
						onClick={() => setIsEditingName(true)}
						title="Click to edit round name"
					>
						{currentRoundName}
					</h2>
				)}
			</div>
		</div>
	);
};

type RoundConditionsProps = {
	round: Round;
};
const RoundConditions = ({ round }: RoundConditionsProps) => {
	const handleScoreChange = (scoreKey: keyof Round, value: string) => {
		const newValue = parseFloat(value);
	};
	return (
		<>
			<h3 className="text-xl font-bold text-gray-300 mb-4">Round Conditions</h3>
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
						value={round?.round_schock_expected_profit_score || 0}
						onChange={(e) =>
							handleScoreChange(
								'round_schock_expected_profit_score',
								e.target.value
							)
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
						value={round?.round_schock_liquidity_score || 0}
						onChange={(e) =>
							handleScoreChange('round_schock_liquidity_score', e.target.value)
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
						value={round?.round_schock_solvency_score || 0}
						onChange={(e) =>
							handleScoreChange('round_schock_solvency_score', e.target.value)
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
						value={round?.round_schock_IT_score || 0}
						onChange={(e) =>
							handleScoreChange('round_schock_IT_score', e.target.value)
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
						value={round?.round_schock_capacity_score || 0}
						onChange={(e) =>
							handleScoreChange('round_schock_capacity_score', e.target.value)
						}
						className="w-full text-center bg-gray-900 text-white rounded-md px-2 py-1 focus:ring-2 focus:ring-pink-400 focus:outline-none"
					/>
				</div>
			</div>
		</>
	);
};
