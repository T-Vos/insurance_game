'use client';
import { useState, useEffect } from 'react';
import { Round, Choice, Game, Scores } from '@/lib/types';
import { generateGameKey } from '@/lib/generate_game_key';
import clsx from 'clsx';
// All components and styling are now defined within this file to fix the compilation error
// The following imports were removed due to the compilation error:
// import { cardstyle, title, title_changeable } from '../components/styling';
// import { ChoicesList } from '../components/ChoicesList';
// import GameConfigHeader from '../components/gameConfigHeader';

import {
	LucideHandCoins,
	LucideDroplet,
	LucidePiggyBank,
	LucideComputer,
	LucideUsersRound,
	LucidePenTool,
	LucidePlus,
} from 'lucide-react';
import { title } from 'process';
import { cardstyle, title_changeable } from '../components/styling';
import { ChoicesList } from '../components/ChoicesList';

// --- Type Definitions ---
// Define a type for the component's props
type GameConfigProps = {
	roundChoices: Round[];
	currentRoundIndex: number;
	handleUpdateRound: (updatedRound: Round) => void;
	handleAddRound: () => void;
	handleUpdateGameConfig: (key: keyof Game, value: string | number) => void;
	gameData: Game | null;
};

const GameConfig = ({
	roundChoices,
	currentRoundIndex,
	handleUpdateRound,
	handleAddRound,
	handleUpdateGameConfig,
	gameData,
}: GameConfigProps) => {
	// Determine the current round from the roundChoices array
	const currentRound = roundChoices[currentRoundIndex];

	// If there is no current round, display the header to add a new one
	if (!currentRound) {
		return (
			<GameConfigHeader
				handleAddRound={handleAddRound}
				gameData={gameData}
				onUpdateGameConfig={handleUpdateGameConfig}
			/>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<h3 className="text-lg font-semibold text-gray-400">Spel settings</h3>
			<GameConfigHeader
				handleAddRound={handleAddRound}
				gameData={gameData}
				onUpdateGameConfig={handleUpdateGameConfig}
			/>

			<h3 className="text-lg font-semibold text-gray-400">Ronde settings</h3>
			<div className={cardstyle}>
				<RoundConfig
					roundData={currentRound}
					roundIndex={currentRoundIndex}
					handleUpdateRound={handleUpdateRound}
				/>
				<div className="border-t border-gray-400 dark:border-gray-600 my-8"></div>
				{/* <ChoicesList
					editingChoices={currentRound.choices}
					roundChoices={roundChoices}
				/> */}
			</div>
		</div>
	);
};

export default GameConfig;

// GameConfigHeader component (consolidated)
type GameConfigHeaderProps = {
	gameData: Game | null;
	handleAddRound: () => void;
	onUpdateGameConfig: (key: keyof Game, value: string | number) => void;
};

const GameConfigHeader = ({
	gameData,
	handleAddRound,
	onUpdateGameConfig,
}: GameConfigHeaderProps) => {
	// State for the editable game name
	const [isEditingName, setIsEditingName] = useState(false);
	const [editingName, setEditingName] = useState(gameData?.name || '');

	// State for the editable starting scores
	const [editingScores, setEditingScores] = useState<Scores>({
		expected_profit_score: gameData?.start_expected_profit_score || 0,
		liquidity_score: gameData?.start_liquidity_score || 0,
		solvency_score: gameData?.start_solvency_score || 0,
		IT_score: gameData?.start_IT_score || 0,
		capacity_score: gameData?.start_capacity_score || 0,
	});

	// Sync local state with props when gameData changes
	useEffect(() => {
		setEditingName(gameData?.name || '');
		setEditingScores({
			expected_profit_score: gameData?.start_expected_profit_score || 0,
			liquidity_score: gameData?.start_liquidity_score || 0,
			solvency_score: gameData?.start_solvency_score || 0,
			IT_score: gameData?.start_IT_score || 0,
			capacity_score: gameData?.start_capacity_score || 0,
		});
	}, [gameData]);

	const finishEditingName = () => {
		setIsEditingName(false);
		if (editingName.trim() !== (gameData?.name || '')) {
			onUpdateGameConfig('name', editingName.trim());
		}
	};

	// TODO: rewrite this to parse the int later
	const handleScoreChange = (
		scoreKey: keyof Scores,
		value: string | number
	) => {
		setEditingScores((prevScores) => ({
			...prevScores,
			[scoreKey]: typeof value === 'number' ? value : parseFloat(value) || 0,
		}));
	};

	const saveScoreChange = (scoreKey: keyof Scores) => {
		onUpdateGameConfig(`start_${scoreKey}`, editingScores[scoreKey]);
	};

	return (
		<div className={cardstyle}>
			<div className="flex flex-col justify-between sm:flex-row gap-4 items-center">
				{isEditingName ? (
					<input
						type="text"
						value={editingName}
						onChange={(e) => setEditingName(e.target.value)}
						onBlur={finishEditingName}
						onKeyDown={(e) => {
							if (e.key === 'Enter') finishEditingName();
							if (e.key === 'Escape') {
								setEditingName(gameData?.name || '');
								setIsEditingName(false);
							}
						}}
						autoFocus
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
				<button
					onClick={handleAddRound}
					className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md transform hover:scale-105 active:scale-95"
				>
					<LucidePlus size={18} />
					<span>Add New Round</span>
				</button>
			</div>
			<div className="border-t border-gray-600 my-8"></div>
			<h3 className="text-xl font-bold text-gray-300 mb-4">Start Conditions</h3>
			<ScoreBar
				handleScoreChange={handleScoreChange}
				saveScoreChange={saveScoreChange}
				editingScores={editingScores}
			/>
		</div>
	);
};

// RoundConfig component to handle a single round's name and shocks
type RoundConfigProps = {
	roundData: Round;
	roundIndex: number;
	handleUpdateRound: (updatedRound: Round) => void;
};

const RoundConfig = ({
	roundData,
	roundIndex,
	handleUpdateRound,
}: RoundConfigProps) => {
	// State to manage the editable round name
	const [isEditingName, setIsEditingName] = useState(false);
	const [editingName, setEditingName] = useState(roundData.round_name);

	// State to manage the editable round shock scores
	const [editingShocks, setEditingShocks] = useState({
		expected_profit_score: roundData.round_schock_expected_profit_score || 0,
		liquidity_score: roundData.round_schock_liquidity_score || 0,
		solvency_score: roundData.round_schock_solvency_score || 0,
		IT_score: roundData.round_schock_IT_score || 0,
		capacity_score: roundData.round_schock_capacity_score || 0,
	});

	// Sync local state with props when roundData changes
	useEffect(() => {
		setEditingName(roundData.round_name);
		setEditingShocks({
			expected_profit_score: roundData.round_schock_expected_profit_score || 0,
			liquidity_score: roundData.round_schock_liquidity_score || 0,
			solvency_score: roundData.round_schock_solvency_score || 0,
			IT_score: roundData.round_schock_IT_score || 0,
			capacity_score: roundData.round_schock_capacity_score || 0,
		});
	}, [roundData]);

	// Handler to save the new round name to the parent component's state
	const finishEditingName = () => {
		setIsEditingName(false);
		if (editingName.trim() !== roundData.round_name) {
			handleUpdateRound({
				...roundData,
				round_name: editingName.trim(),
			});
		}
	};

	// Handler for updating a score field in local state
	const handleShockChange = (
		shockKey: keyof typeof editingShocks,
		value: string | number
	) => {
		setEditingShocks((prevShocks) => ({
			...prevShocks,
			[shockKey]: typeof value === 'number' ? value : parseFloat(value) || 0,
		}));
	};

	// Handler to save the score field to the database when the input loses focus
	const saveShockChange = (shockKey: keyof typeof editingShocks) => {
		const fullShockKey = `round_schock_${shockKey}` as keyof Round;
		handleUpdateRound({
			...roundData,
			[fullShockKey]: editingShocks[shockKey],
		});
	};

	return (
		<>
			{/* Round Header Section */}
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
									setEditingName(roundData.round_name);
									setIsEditingName(false);
								}
							}}
							autoFocus
							className={clsx(title, 'bg-gray-700 rounded px-2 py-1 w-full')}
						/>
					) : (
						<h2
							className={clsx(
								title_changeable,
								'cursor-pointer flex items-center gap-2'
							)}
							onClick={() => setIsEditingName(true)}
							title="Click to edit round name"
						>
							Round {roundIndex + 1}: {roundData.round_name}
							<LucidePenTool size={18} className="text-gray-400" />
						</h2>
					)}
				</div>
			</div>
			<div className="border-t border-gray-600 my-4"></div>
			{/* Round Shock Conditions Section */}
			<h4 className="text-lg font-semibold text-gray-400 mb-4">Round Shocks</h4>
			<ScoreBar
				handleScoreChange={handleShockChange}
				saveScoreChange={saveShockChange}
				editingScores={editingShocks}
			/>
		</>
	);
};

type scoreBarProps = {
	editingScores: Scores;
	handleScoreChange: (scoreKey: keyof Scores, value: string | number) => void;
	saveScoreChange: (scoreKey: keyof Scores) => void;
};

const ScoreBar = ({
	editingScores: editingScores,
	handleScoreChange: handleScoreChange,
	saveScoreChange: saveScoreChange,
}: scoreBarProps) => {
	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
			<div className="flex flex-col items-center gap-2 bg-gray-700 rounded-lg p-3">
				<LucideHandCoins size={24} className="text-yellow-400" />
				<span
					title="Expected Profit"
					className="text-sm font-medium text-gray-400"
				>
					Profit
				</span>
				<input
					type="number"
					value={editingScores.expected_profit_score}
					onChange={(e) =>
						handleScoreChange('expected_profit_score', e.target.value)
					}
					onBlur={() => saveScoreChange('expected_profit_score')}
					className="w-full text-center bg-gray-900 text-white rounded-md px-2 py-1 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
				/>
			</div>
			<div className="flex flex-col items-center gap-2 bg-gray-700 rounded-lg p-3">
				<LucideDroplet size={24} className="text-blue-400" />
				<span title="Liquidity" className="text-sm font-medium text-gray-400">
					Liquidity
				</span>
				<input
					type="number"
					value={editingScores.liquidity_score}
					onChange={(e) => handleScoreChange('liquidity_score', e.target.value)}
					onBlur={() => saveScoreChange('liquidity_score')}
					className="w-full text-center bg-gray-900 text-white rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
				/>
			</div>
			<div className="flex flex-col items-center gap-2 bg-gray-700 rounded-lg p-3">
				<LucidePiggyBank size={24} className="text-green-400" />
				<span title="Solvency" className="text-sm font-medium text-gray-400">
					Solvency (%)
				</span>
				<input
					type="number"
					value={editingScores.solvency_score}
					onChange={(e) => handleScoreChange('solvency_score', e.target.value)}
					onBlur={() => saveScoreChange('solvency_score')}
					className="w-full text-center bg-gray-900 text-white rounded-md px-2 py-1 focus:ring-2 focus:ring-green-400 focus:outline-none"
				/>
			</div>
			<div className="flex flex-col items-center gap-2 bg-gray-700 rounded-lg p-3">
				<LucideComputer size={24} className="text-purple-400" />
				<span title="IT Score" className="text-sm font-medium text-gray-400">
					IT (%)
				</span>
				<input
					type="number"
					value={editingScores.IT_score}
					onChange={(e) => handleScoreChange('IT_score', e.target.value)}
					onBlur={() => saveScoreChange('IT_score')}
					className="w-full text-center bg-gray-900 text-white rounded-md px-2 py-1 focus:ring-2 focus:ring-purple-400 focus:outline-none"
				/>
			</div>
			<div className="flex flex-col items-center gap-2 bg-gray-700 rounded-lg p-3">
				<LucideUsersRound size={24} className="text-pink-400" />
				<span title="Capacity" className="text-sm font-medium text-gray-400">
					Capacity (%)
				</span>
				<input
					type="number"
					value={editingScores.capacity_score}
					onChange={(e) => handleScoreChange('capacity_score', e.target.value)}
					onBlur={() => saveScoreChange('capacity_score')}
					className="w-full text-center bg-gray-900 text-white rounded-md px-2 py-1 focus:ring-2 focus:ring-pink-400 focus:outline-none"
				/>
			</div>
		</div>
	);
};
