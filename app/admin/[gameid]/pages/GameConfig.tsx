'use client';
import { useState, useEffect } from 'react';
import { Round, Game, Scores, Choice } from '@/lib/types';
import clsx from 'clsx';
import { LucidePenTool, LucidePlus } from 'lucide-react';
import { title } from 'process';
import { cardstyle, title_changeable } from '../components/styling';
import { ChoicesList } from '../components/ChoicesList';
import { generateGameKey } from '@/lib/generate_game_key';
import ScoreBar from '../components/ScoreBar';

type GameConfigProps = {
	roundChoices: Round[];
	currentRoundIndex: Game['currentRoundIndex'];
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
	const currentRound = roundChoices[currentRoundIndex];
	const [editingChoices, setEditingChoices] = useState<Choice[]>([]);

	useEffect(() => {
		if (currentRound) {
			setEditingChoices(currentRound.choices);
		}
	}, [currentRound]);

	useEffect(() => {
		if (editingChoices.length > 0) {
			handleUpdateRound({
				...currentRound,
				choices: editingChoices,
			});
		}
	}, [editingChoices]);

	if (!currentRound) {
		return (
			<GameConfigHeader
				handleAddRound={handleAddRound}
				gameData={gameData}
				onUpdateGameConfig={handleUpdateGameConfig}
			/>
		);
	}

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
			description: 'New choice',
			duration: 1,
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
		setEditingChoices((prevChoices) =>
			prevChoices.filter((choice) => choice.id !== choiceId)
		);
	};

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
				<ChoicesList
					editingChoices={editingChoices}
					roundChoices={roundChoices}
					handleAddChoice={handleAddChoice}
					handleRemoveChoice={handleRemoveChoice}
					handleUpdateChoice={handleUpdateChoice}
					key={'ChoicesList'}
				/>
			</div>
		</div>
	);
};

export default GameConfig;

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
	const [isEditingName, setIsEditingName] = useState(false);
	const [editingName, setEditingName] = useState(gameData?.name || '');

	const [editingScores, setEditingScores] = useState<Scores>({
		expected_profit_score: gameData?.start_expected_profit_score || 0,
		liquidity_score: gameData?.start_liquidity_score || 0,
		solvency_score: gameData?.start_solvency_score || 0,
		IT_score: gameData?.start_IT_score || 0,
		capacity_score: gameData?.start_capacity_score || 0,
	});

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
	const [isEditingName, setIsEditingName] = useState(false);
	const [editingName, setEditingName] = useState(roundData.round_name);

	const [editingShocks, setEditingShocks] = useState({
		expected_profit_score: roundData.round_schock_expected_profit_score || 0,
		liquidity_score: roundData.round_schock_liquidity_score || 0,
		solvency_score: roundData.round_schock_solvency_score || 0,
		IT_score: roundData.round_schock_IT_score || 0,
		capacity_score: roundData.round_schock_capacity_score || 0,
	});

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

	const finishEditingName = () => {
		setIsEditingName(false);
		if (editingName.trim() !== roundData.round_name) {
			handleUpdateRound({
				...roundData,
				round_name: editingName.trim(),
			});
		}
	};

	const handleShockChange = (
		shockKey: keyof typeof editingShocks,
		value: string | number
	) => {
		setEditingShocks((prevShocks) => ({
			...prevShocks,
			[shockKey]: typeof value === 'number' ? value : parseFloat(value) || 0,
		}));
	};

	const saveShockChange = (shockKey: keyof typeof editingShocks) => {
		const fullShockKey = `round_schock_${shockKey}` as keyof Round;
		handleUpdateRound({
			...roundData,
			[fullShockKey]: editingShocks[shockKey],
		});
	};

	return (
		<>
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
			<h4 className="text-lg font-semibold text-gray-400 mb-4">Round Shocks</h4>
			<ScoreBar
				handleScoreChange={handleShockChange}
				saveScoreChange={saveShockChange}
				editingScores={editingShocks}
			/>
		</>
	);
};
