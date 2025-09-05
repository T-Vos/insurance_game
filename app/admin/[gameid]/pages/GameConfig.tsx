'use client';
import {
	useState,
	useEffect,
	ForwardRefExoticComponent,
	RefAttributes,
} from 'react';
import {
	Round,
	Game,
	Scores,
	Choice,
	ScoreType,
	scoreTypes,
} from '@/lib/types';
import clsx from 'clsx';
import {
	ChevronDown,
	LucideChartNoAxesColumnIncreasing,
	LucideCircleAlert,
	LucideIcon,
	LucidePenTool,
	LucidePlus,
	LucideProps,
	LucideSkull,
	LucideTrash,
} from 'lucide-react';
import { title } from 'process';
import {
	cardstyle,
	delete_button,
	title_changeable,
	title_subtle,
} from '../components/styling';
import { ChoicesList } from '../components/ChoicesList';
import { generateGameKey } from '@/lib/generate_game_key';
import ScoreBar from '../components/ScoreBar';
import Tooltip from '@/components/Tooltip';

type GameConfigProps = {
	allRounds: Round[];
	allChoices: Choice[];
	currentRoundIndex: Game['currentRoundIndex'];
	handleUpdateRound: (updatedRound: Round) => void;
	handleAddRound: () => void;
	handleUpdateGameConfig: (key: keyof Game, value: string | number) => void;
	handleRemoveRound: (RoundId: Round['round_id']) => void;
	gameData: Game | null;
	onAddChoice: (roundId: Round['round_id']) => void;
	onRemoveChoice: (choiceId: string) => void;
	onSaveChoice: (updatedChoice: Choice) => void;
};

const GameConfig = ({
	allRounds,
	allChoices,
	currentRoundIndex,
	handleUpdateRound,
	handleAddRound,
	handleUpdateGameConfig,
	handleRemoveRound,
	gameData,
	onAddChoice,
	onRemoveChoice,
	onSaveChoice,
}: GameConfigProps) => {
	const currentRound = allRounds[currentRoundIndex];

	// Filter the choices relevant to the current round
	const choicesForCurrentRound = allChoices.filter(
		(choice) => choice.round_id === currentRound?.round_id
	);

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
			<h3 className={title_subtle}>Spel settings</h3>
			<GameConfigHeader
				handleAddRound={handleAddRound}
				gameData={gameData}
				onUpdateGameConfig={handleUpdateGameConfig}
			/>

			<h3 className={title_subtle}>Ronde settings</h3>
			<div className={cardstyle}>
				<RoundConfig
					roundData={currentRound}
					roundIndex={currentRoundIndex}
					handleUpdateRound={handleUpdateRound}
					handleRemoveRound={handleRemoveRound}
				/>
				<div className="border-t border-gray-400 dark:border-gray-600 my-8"></div>
				<ChoicesList
					editingChoices={choicesForCurrentRound}
					allRounds={allRounds}
					allChoices={allChoices}
					onAddChoice={() => onAddChoice(currentRound.round_id)}
					onRemoveChoice={onRemoveChoice}
					onSaveChoice={onSaveChoice}
				/>
			</div>
		</div>
	);
};

export default GameConfig;

// The GameConfigHeader and RoundConfig components remain unchanged.
// The code for those components is not repeated here for brevity.
// You can keep them as they were in your original file.

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

	const [isOpened, setIsOpened] = useState(false);
	const toggleCollapse = () => setIsOpened(!isOpened);

	type ConditionType = 'start' | 'critical' | 'gameover';

	type ScoresByCondition = {
		[key in ConditionType]: Scores;
	};

	type CriticalTexts = {
		[key in ScoreType as `critical_${key}_text`]: string;
	};

	const [editingScores, setEditingScores] = useState<ScoresByCondition>({
		start: {
			expected_profit_score: gameData?.start_expected_profit_score || 0,
			liquidity_score: gameData?.start_liquidity_score || 0,
			solvency_score: gameData?.start_solvency_score || 0,
			IT_score: gameData?.start_IT_score || 0,
			capacity_score: gameData?.start_capacity_score || 0,
		},
		critical: {
			expected_profit_score: gameData?.critical_expected_profit_score || 0,
			liquidity_score: gameData?.critical_liquidity_score || 0,
			solvency_score: gameData?.critical_solvency_score || 0,
			IT_score: gameData?.critical_IT_score || 0,
			capacity_score: gameData?.critical_capacity_score || 0,
		},
		gameover: {
			expected_profit_score: gameData?.gameover_expected_profit_score || 0,
			liquidity_score: gameData?.gameover_liquidity_score || 0,
			solvency_score: gameData?.gameover_solvency_score || 0,
			IT_score: gameData?.gameover_IT_score || 0,
			capacity_score: gameData?.gameover_capacity_score || 0,
		},
	});

	const [editingCriticalText, setEditingCriticalText] = useState<CriticalTexts>(
		{
			critical_expected_profit_score_text:
				gameData?.critical_expected_profit_score_text || '',
			critical_liquidity_score_text:
				gameData?.critical_liquidity_score_text || '',
			critical_solvency_score_text:
				gameData?.critical_solvency_score_text || '',
			critical_IT_score_text: gameData?.critical_IT_score_text || '',
			critical_capacity_score_text:
				gameData?.critical_capacity_score_text || '',
		}
	);

	useEffect(() => {
		if (!gameData) return;

		setEditingScores({
			start: {
				expected_profit_score: gameData.start_expected_profit_score || 0,
				liquidity_score: gameData.start_liquidity_score || 0,
				solvency_score: gameData.start_solvency_score || 0,
				IT_score: gameData.start_IT_score || 0,
				capacity_score: gameData.start_capacity_score || 0,
			},
			critical: {
				expected_profit_score: gameData.critical_expected_profit_score || 0,
				liquidity_score: gameData.critical_liquidity_score || 0,
				solvency_score: gameData.critical_solvency_score || 0,
				IT_score: gameData.critical_IT_score || 0,
				capacity_score: gameData.critical_capacity_score || 0,
			},
			gameover: {
				expected_profit_score: gameData.gameover_expected_profit_score || 0,
				liquidity_score: gameData.gameover_liquidity_score || 0,
				solvency_score: gameData.gameover_solvency_score || 0,
				IT_score: gameData.gameover_IT_score || 0,
				capacity_score: gameData.gameover_capacity_score || 0,
			},
		});

		setEditingCriticalText({
			critical_expected_profit_score_text:
				gameData.critical_expected_profit_score_text || '',
			critical_liquidity_score_text:
				gameData.critical_liquidity_score_text || '',
			critical_solvency_score_text: gameData.critical_solvency_score_text || '',
			critical_IT_score_text: gameData.critical_IT_score_text || '',
			critical_capacity_score_text: gameData.critical_capacity_score_text || '',
		});
	}, [gameData]);

	const finishEditingName = () => {
		setIsEditingName(false);
		if (editingName.trim() !== (gameData?.name || '')) {
			onUpdateGameConfig('name', editingName.trim());
		}
	};

	const handleScoreChange = (
		condition: ConditionType,
		scoreKey: keyof Scores,
		value: string | number
	) => {
		setEditingScores((prev) => ({
			...prev,
			[condition]: {
				...prev[condition],
				[scoreKey]: value,
			},
		}));
	};

	const saveScoreChange = (
		condition: ConditionType,
		scoreKey: keyof Scores
	) => {
		const val = editingScores[condition][scoreKey];
		onUpdateGameConfig(
			`${condition}_${scoreKey}`,
			typeof val === 'number' ? val : parseFloat(String(val)) || 0
		);
	};

	const handleCriticalTextChange = (
		textKey: keyof CriticalTexts,
		value: string
	) => {
		setEditingCriticalText((prev) => ({
			...prev,
			[textKey]: value,
		}));
	};

	const saveCriticalTextChange = (textKey: keyof CriticalTexts) => {
		onUpdateGameConfig(textKey, editingCriticalText[textKey]);
	};

	return (
		<div className={cardstyle}>
			<div className="flex flex-col justify-between sm:flex-row gap-4 items-center">
				<button
					onClick={toggleCollapse}
					className="text-gray-400 cursor-pointer shrink hover:text-gray-200 transition"
				>
					<div
						className={`transition-transform duration-300 ${
							isOpened ? '' : 'rotate-180'
						}`}
					>
						<ChevronDown size={20} />
					</div>
				</button>
				<div className="grow flex flex-col w-full">
					<div className="grow w-full">
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
									'cursor-pointer flex-grow flex items-center gap-2'
								)}
								onClick={() => setIsEditingName(true)}
								title="Click to edit game name"
							>
								{gameData?.name || 'Game Title'}
								<LucidePenTool size={18} className="text-gray-400" />
							</h2>
						)}
					</div>
					<span className="font-light">Game key: {gameData?.key}</span>
				</div>
				<button
					onClick={handleAddRound}
					className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md transform hover:scale-105 active:scale-95"
				>
					<LucidePlus size={18} />
					<span>Add New Round</span>
				</button>
			</div>
			<div
				className={`overflow-hidden transition-all duration-300 ${
					isOpened ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
				}`}
			>
				<div className="border-t border-gray-600 my-8"></div>
				<ScoreTable
					editingCriticalText={editingCriticalText}
					editingScores={editingScores}
					handleCriticalTextChange={handleCriticalTextChange}
					saveCriticalTextChange={saveCriticalTextChange}
					handleScoreChange={handleScoreChange}
					saveScoreChange={saveScoreChange}
				/>
			</div>
		</div>
	);
};

interface ScoreTableProps {
	editingScores: {
		start: Record<ScoreType, number>;
		critical: Record<ScoreType, number>;
		gameover: Record<ScoreType, number>;
	};
	handleScoreChange: (
		condition: 'start' | 'critical' | 'gameover',
		scoreKey: ScoreType,
		value: string | number
	) => void;
	saveScoreChange: (
		condition: 'start' | 'critical' | 'gameover',
		scoreKey: ScoreType
	) => void;
	editingCriticalText: Record<`critical_${ScoreType}_text`, string>;
	handleCriticalTextChange: (
		textKey: `critical_${ScoreType}_text`,
		value: string
	) => void;
	saveCriticalTextChange: (textKey: `critical_${ScoreType}_text`) => void;
}

export function ScoreTable({
	editingScores,
	handleScoreChange,
	saveScoreChange,
	editingCriticalText,
	handleCriticalTextChange,
	saveCriticalTextChange,
}: ScoreTableProps) {
	const conditions: {
		key: 'start' | 'critical' | 'gameover';
		label: string;
		Icon?: LucideIcon;
	}[] = [
		{ key: 'start', label: 'Start' },
		{ key: 'critical', label: 'Critical', Icon: LucideCircleAlert },
		{ key: 'gameover', label: 'Game Over', Icon: LucideSkull },
	];

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-sm text-gray-300 border-collapse">
				<thead>
					<tr className="dark:bg-gray-800 text-left">
						<th className="p-3">Score Type</th>
						{conditions.map(({ key, label, Icon }) => (
							<th key={key} className="p-3">
								<div className="flex flex-row items-center gap-2 flex-1">
									{Icon && <Icon className="mr-1" size={16} />}
									{label}
								</div>
							</th>
						))}
						<th className="p-3">Critical Message</th>
					</tr>
				</thead>
				<tbody>
					{scoreTypes.map(({ name, label, icon: Icon, color }) => {
						const textKey =
							`critical_${name}_text` as `critical_${ScoreType}_text`;
						return (
							<tr key={name} className="border-b border-gray-700">
								{/* Score Type & Icon */}
								<td className="p-3 flex items-center gap-2">
									<Icon size={20} className={`text-${color}`} />
									<span>{label}</span>
								</td>

								{/* Scores for each condition */}
								{conditions.map(({ key }) => (
									<td key={key} className="p-3">
										<input
											type="number"
											value={editingScores[key][name]}
											onChange={(e) =>
												handleScoreChange(key, name, e.target.value)
											}
											onBlur={() => saveScoreChange(key, name)}
											className={clsx(
												'w-24 text-center dark:bg-gray-900 dark:text-white rounded-md px-2 py-1 focus:outline-none focus:ring-2',
												`focus:ring-${color}`
											)}
										/>
									</td>
								))}

								{/* Critical Text */}
								<td className="p-3">
									<textarea
										value={editingCriticalText[textKey]}
										onChange={(e) =>
											handleCriticalTextChange(textKey, e.target.value)
										}
										onBlur={() => saveCriticalTextChange(textKey)}
										className={clsx(
											'w-full dark:bg-gray-900 dark:text-white rounded-md px-3 py-2 resize-none focus:ring-2  focus:outline-none',
											`focus:ring-${color}`
										)}
										placeholder={`Enter critical message for ${label}`}
									/>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

type RoundConfigProps = {
	roundData: Round;
	roundIndex: number;
	handleUpdateRound: (updatedRound: Round) => void;
	handleRemoveRound: (roundDelete: Round['round_id']) => void;
};

const RoundConfig = ({
	roundData,
	handleUpdateRound,
	handleRemoveRound,
}: RoundConfigProps) => {
	const [isEditingName, setIsEditingName] = useState(false);
	const [editingName, setEditingName] = useState(roundData.round_name);
	const [editingShowScore, setShowScore] = useState(
		roundData.round_show_scores || false
	);

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
		setShowScore(roundData.round_show_scores || false);
	}, [roundData]);

	const finishEditingName = () => {
		console.log('Finish');
		setIsEditingName(false);
		if (editingName.trim() !== roundData.round_name) {
			handleUpdateRound({
				...roundData,
				round_name: editingName.trim(),
			});
		}
	};

	const handleShowScore = () => {
		const newShow = !editingShowScore;
		setShowScore(!editingShowScore);
		handleUpdateRound({
			...roundData,
			round_show_scores: newShow,
		});
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
				: parseFloat(String(editingShocks[shockKey])) || 0;
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
						className={clsx(
							title_changeable,
							'bg-gray-700 grow rounded px-2 py-1 w-full'
						)}
					/>
				) : (
					<h2
						className={clsx(
							title_changeable,
							'cursor-pointer grow flex items-center gap-2'
						)}
						onClick={() => setIsEditingName(true)}
						title="Click to edit round name"
					>
						{roundData.round_name}
						<LucidePenTool size={18} className="text-gray-400" />
					</h2>
				)}
				<Tooltip
					content={
						roundData.round_show_scores
							? 'Laat de tussenstand niet meer zien'
							: 'Laat de tussenstand zien deze ronde'
					}
				>
					<button
						onClick={handleShowScore}
						className={clsx(
							'flex shrink cursor-pointer space-x-2  text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md transform hover:scale-105 active:scale-95',
							roundData.round_show_scores
								? 'bg-yellow-500 hover:bg-yellow-200'
								: 'bg-yellow-200 hover:bg-yellow-500'
						)}
					>
						<LucideChartNoAxesColumnIncreasing
							className={clsx(
								roundData.round_show_scores
									? 'text-gray-100 hover:text-gray-500'
									: 'text-gray-500 hover:text-gray-100'
							)}
							size={18}
						/>
					</button>
				</Tooltip>
				<Tooltip content="Verwijder ronde">
					<button
						onClick={() => handleRemoveRound(roundData.round_id)}
						className={delete_button}
					>
						<LucideTrash size={18} />
					</button>
				</Tooltip>
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
