'use client';
import { useState, useEffect } from 'react';
import { Round, Game, Scores, Choice } from '@/lib/types';
import clsx from 'clsx';
import {
	LucideCircleAlert,
	LucidePenTool,
	LucidePlus,
	LucideSkull,
	LucideTrash,
} from 'lucide-react';
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
	handleRemoveRound: (RoundId: Round['round_id']) => void;
	gameData: Game | null;
};

const GameConfig = ({
	roundChoices,
	currentRoundIndex,
	handleUpdateRound,
	handleAddRound,
	handleUpdateGameConfig,
	handleRemoveRound,
	gameData,
}: GameConfigProps) => {
	const currentRound = roundChoices[currentRoundIndex];
	const [editingChoices, setEditingChoices] = useState<Choice[]>([]);

	useEffect(() => {
		if (
			currentRound &&
			JSON.stringify(currentRound.choices) !== JSON.stringify(editingChoices)
		) {
			setEditingChoices(currentRound.choices || []);
		}
	}, [currentRound]);

	const saveChoices = () => {
		console.log('SAVE CHOICE');
		handleUpdateRound({
			...currentRound,
			choices: editingChoices,
		});
	};

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
		choiceIndex: Choice['choice_index'],
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
			choice_index: editingChoices.length || 0 + 1,
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
			delayedEffect: [],
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
					handleRemoveRound={handleRemoveRound}
				/>
				<div className="border-t border-gray-400 dark:border-gray-600 my-8"></div>
				<ChoicesList
					editingChoices={editingChoices}
					roundChoices={roundChoices}
					handleAddChoice={handleAddChoice}
					handleRemoveChoice={handleRemoveChoice}
					handleUpdateChoice={handleUpdateChoice}
					handleSaveChoice={saveChoices}
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

	const [editingStartingScores, setEditingStartingScores] = useState<Scores>({
		expected_profit_score: gameData?.start_expected_profit_score || 0,
		liquidity_score: gameData?.start_liquidity_score || 0,
		solvency_score: gameData?.start_solvency_score || 0,
		IT_score: gameData?.start_IT_score || 0,
		capacity_score: gameData?.start_capacity_score || 0,
	});

	const [editingCriticalScores, setEditingCriticalScores] = useState<Scores>({
		expected_profit_score: gameData?.critical_expected_profit_score || 0,
		liquidity_score: gameData?.critical_liquidity_score || 0,
		solvency_score: gameData?.critical_solvency_score || 0,
		IT_score: gameData?.critical_IT_score || 0,
		capacity_score: gameData?.critical_capacity_score || 0,
	});

	const [editingGameOverScores, setEditingGameOverScores] = useState<Scores>({
		expected_profit_score: gameData?.gameover_expected_profit_score || 0,
		liquidity_score: gameData?.gameover_liquidity_score || 0,
		solvency_score: gameData?.gameover_solvency_score || 0,
		IT_score: gameData?.gameover_IT_score || 0,
		capacity_score: gameData?.gameover_capacity_score || 0,
	});

	useEffect(() => {
		if (
			!editingStartingScores ||
			Object.keys(editingStartingScores).length === 0
		) {
			setEditingName(gameData?.name || '');
			setEditingStartingScores({
				expected_profit_score: gameData?.start_expected_profit_score || 0,
				liquidity_score: gameData?.start_liquidity_score || 0,
				solvency_score: gameData?.start_solvency_score || 0,
				IT_score: gameData?.start_IT_score || 0,
				capacity_score: gameData?.start_capacity_score || 0,
			});
		}
		if (
			!editingCriticalScores ||
			Object.keys(editingCriticalScores).length === 0
		) {
			setEditingCriticalScores({
				expected_profit_score: gameData?.critical_expected_profit_score || 0,
				liquidity_score: gameData?.critical_liquidity_score || 0,
				solvency_score: gameData?.critical_solvency_score || 0,
				IT_score: gameData?.critical_IT_score || 0,
				capacity_score: gameData?.critical_capacity_score || 0,
			});
		}
		if (
			!editingGameOverScores ||
			Object.keys(editingGameOverScores).length === 0
		) {
			setEditingGameOverScores({
				expected_profit_score: gameData?.gameover_expected_profit_score || 0,
				liquidity_score: gameData?.gameover_liquidity_score || 0,
				solvency_score: gameData?.gameover_solvency_score || 0,
				IT_score: gameData?.gameover_IT_score || 0,
				capacity_score: gameData?.gameover_capacity_score || 0,
			});
		}
	}, [gameData]);

	const finishEditingName = () => {
		setIsEditingName(false);
		if (editingName.trim() !== (gameData?.name || '')) {
			onUpdateGameConfig('name', editingName.trim());
		}
	};

	const handleScoreChange = (
		scoreKey: keyof Scores,
		value: string | number
	) => {
		setEditingStartingScores((prevScores) => ({
			...prevScores,
			[scoreKey]: value,
		}));
	};
	const handleCriticalScoreChange = (
		scoreKey: keyof Scores,
		value: string | number
	) => {
		setEditingCriticalScores((prevScores) => ({
			...prevScores,
			[scoreKey]: value,
		}));
	};
	const handleGameOverScoreChange = (
		scoreKey: keyof Scores,
		value: string | number
	) => {
		setEditingGameOverScores((prevScores) => ({
			...prevScores,
			[scoreKey]: value,
		}));
	};

	const saveScoreChange = (scoreKey: keyof Scores) => {
		onUpdateGameConfig(
			`start_${scoreKey}`,
			typeof editingStartingScores[scoreKey] === 'number'
				? editingStartingScores[scoreKey]
				: parseFloat(editingStartingScores[scoreKey]) || 0
		);
	};
	const saveCriticalScoreChange = (scoreKey: keyof Scores) => {
		onUpdateGameConfig(
			`critical_${scoreKey}`,
			typeof editingCriticalScores[scoreKey] === 'number'
				? editingCriticalScores[scoreKey]
				: parseFloat(editingCriticalScores[scoreKey]) || 0
		);
	};
	const saveGameOverScoreChange = (scoreKey: keyof Scores) => {
		onUpdateGameConfig(
			`gameover_${scoreKey}`,
			typeof editingGameOverScores[scoreKey] === 'number'
				? editingGameOverScores[scoreKey]
				: parseFloat(editingGameOverScores[scoreKey]) || 0
		);
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
				editingScores={editingStartingScores}
			/>
			<div className="my-8">
				<h3 className="text-xl flex flex-row justify-start items-center font-bold text-gray-300 mb-4">
					<LucideCircleAlert className="mr-3" /> Critical conditions
				</h3>
				<ScoreBar
					handleScoreChange={handleCriticalScoreChange}
					saveScoreChange={saveCriticalScoreChange}
					editingScores={editingCriticalScores}
				/>
			</div>
			<div className="my-8">
				<h3 className="text-xl font-bold flex flex-row justify-start items-center text-gray-300 mb-4">
					<LucideSkull className="mr-3" /> Game over Conditions
				</h3>
				<ScoreBar
					handleScoreChange={handleGameOverScoreChange}
					saveScoreChange={saveGameOverScoreChange}
					editingScores={editingGameOverScores}
				/>
			</div>
		</div>
	);
};

type RoundConfigProps = {
	roundData: Round;
	roundIndex: number;
	handleUpdateRound: (updatedRound: Round) => void;
	handleRemoveRound: (roundDelete: Round['round_id']) => void;
};

const RoundConfig = ({
	roundData,
	roundIndex,
	handleUpdateRound,
	handleRemoveRound,
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
			[shockKey]: value,
		}));
	};

	const saveShockChange = (shockKey: keyof typeof editingShocks) => {
		const fullShockKey = `round_schock_${shockKey}` as keyof Round;
		const _value =
			typeof editingShocks[shockKey] === 'number'
				? editingShocks[shockKey]
				: parseFloat(editingShocks[shockKey]) || 0;
		handleUpdateRound({
			...roundData,
			[fullShockKey]: _value,
		});
	};

	return (
		<>
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
						{roundData.round_name}
						<LucidePenTool size={18} className="text-gray-400" />
					</h2>
				)}
				<button
					onClick={() => handleRemoveRound(roundData.round_id)}
					className="flex items-center cursor-pointer space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md transform hover:scale-105 active:scale-95"
				>
					<LucideTrash size={18} />
					<span>Ronde verwijderen</span>
				</button>
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
