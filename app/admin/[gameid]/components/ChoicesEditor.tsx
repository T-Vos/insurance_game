import {
	Choice,
	Round,
	RevealMessage,
	InteractionEffect,
	Scores,
	delayedEffect,
} from '@/lib/types';
import { ChevronDown, LucideTrash, LucidePlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import ScoreBar from './ScoreBar';

type ChoiceEditorProps = {
	choice: Choice;
	choiceIndex: Choice['choice_index'];
	handleUpdateChoice: (
		choiceIndex: Choice['choice_index'],
		newChoiceData: Partial<Choice>
	) => void;
	handleRemoveChoice: (choiceId: string) => void;
	roundChoices: Round[];
	handleSaveChoice: () => void;
};

export const ChoiceEditor = ({
	choice,
	choiceIndex,
	handleUpdateChoice,
	handleRemoveChoice,
	roundChoices,
	handleSaveChoice,
}: ChoiceEditorProps) => {
	const [isOpened, setIsOpened] = useState(false);
	const toggleCollapse = () => setIsOpened(!isOpened);

	const [editingScores, setEditingScores] = useState<Scores>({
		expected_profit_score: choice?.expected_profit_score || 0,
		liquidity_score: choice?.liquidity_score || 0,
		solvency_score: choice?.solvency_score || 0,
		IT_score: choice?.IT_score || 0,
		capacity_score: choice?.capacity_score || 0,
	});

	const [editingDuration, setEditingDuration] = useState<number | string>(
		choice?.duration || 0
	);

	useEffect(() => {
		if (!editingScores || Object.keys(editingScores).length === 0) {
			setEditingScores({
				expected_profit_score: choice?.expected_profit_score || 0,
				liquidity_score: choice?.liquidity_score || 0,
				solvency_score: choice?.solvency_score || 0,
				IT_score: choice?.IT_score || 0,
				capacity_score: choice?.capacity_score || 0,
			});
		}
	}, [choice]);

	const handleUpdateReveal = (
		revealIndex: number,
		field: keyof RevealMessage,
		value: string | number
	) => {
		const updatedReveals = [...(choice.reveals || [])];
		const parsedValue =
			field === 'revealedInRounds' ? parseInt(value as string, 10) : value;

		updatedReveals[revealIndex] = {
			...updatedReveals[revealIndex],
			[field]: parsedValue,
		};
		handleUpdateChoice(choiceIndex, { reveals: updatedReveals });
	};

	const handleAddReveal = () => {
		const newReveal: RevealMessage = { text: '', revealedInRounds: 1 };
		const updatedReveals = [...(choice.reveals || []), newReveal];
		handleUpdateChoice(choiceIndex, { reveals: updatedReveals });
	};

	const handleRemoveReveal = (revealIndex: number) => {
		const updatedReveals = (choice.reveals || []).filter(
			(_, index) => index !== revealIndex
		);
		handleUpdateChoice(choiceIndex, { reveals: updatedReveals });
	};

	const handleUpdateInteraction = (
		interactionIndex: number,
		field: keyof InteractionEffect,
		value: string | number
	) => {
		const updatedInteractions = [...(choice.interactionEffects || [])];
		const parsedValue =
			field === 'targetChoiceId' || field === 'bonusScore'
				? parseInt(value as string, 10)
				: value;

		updatedInteractions[interactionIndex] = {
			...updatedInteractions[interactionIndex],
			[field]: parsedValue,
		};
		handleUpdateChoice(choiceIndex, {
			interactionEffects: updatedInteractions,
		});
	};

	const handleAddInteraction = () => {
		const newInteraction: InteractionEffect = {
			targetChoiceId:
				roundChoices[0] &&
				Array.isArray(roundChoices[0].choices) &&
				roundChoices[0].choices[0]
					? roundChoices[0].choices[0].id
					: '',
			roundId: roundChoices[0]?.round_id || '',
			bonusScore: 0,
		};
		const updatedInteractions = [
			...(choice.interactionEffects || []),
			newInteraction,
		];
		handleUpdateChoice(choiceIndex, {
			interactionEffects: updatedInteractions,
		});
	};

	const handleRemoveInteraction = (interactionIndex: number) => {
		const updatedInteractions = (choice.interactionEffects || []).filter(
			(_, index) => index !== interactionIndex
		);
		handleUpdateChoice(choiceIndex, {
			interactionEffects: updatedInteractions,
		});
	};
	const handleScoreChange = (
		scoreKey: keyof Scores,
		value: string | number
	) => {
		setEditingScores((prevScores) => ({
			...prevScores,
			[scoreKey]: value,
		}));
	};
	const saveScoreChange = (scoreKey: keyof Scores) => {
		const _score =
			typeof editingScores[scoreKey] === 'number'
				? editingScores[scoreKey]
				: parseFloat(editingScores[scoreKey]) || 0;
		handleUpdateChoice(choiceIndex, { [scoreKey]: _score });
		handleSaveChoice();
	};

	const handleDurationChange = (value: string | number) => {
		setEditingDuration(value);
	};

	const saveDurationChange = () => {
		const _duration =
			typeof editingDuration === 'number'
				? editingDuration
				: parseFloat(editingDuration) || 0;

		handleUpdateChoice(choiceIndex, {
			['duration']: _duration,
		});
		handleSaveChoice();
	};

	const handleAddDelayedEffect = () => {
		const newEffect: delayedEffect = {
			effective_round: roundChoices[0]?.round_id || '',
			expected_profit_score: 0,
			liquidity_score: 0,
			solvency_score: 0,
			IT_score: 0,
			capacity_score: 0,
		};
		const updatedEffects = [...(choice.delayedEffect || []), newEffect];
		handleUpdateChoice(choiceIndex, { delayedEffect: updatedEffects });
	};

	const handleUpdateDelayedEffect = (
		effectIndex: number,
		field: keyof delayedEffect,
		value: string | number
	) => {
		console.log('update');
		const updatedEffects = [...(choice.delayedEffect || [])];
		let parsedValue = value;
		if (field != 'effective_round') {
			parsedValue = typeof value === 'number' ? value : parseFloat(value) || 0;
		}

		updatedEffects[effectIndex] = {
			...updatedEffects[effectIndex],
			[field]: parsedValue,
		};

		handleUpdateChoice(choiceIndex, { delayedEffect: updatedEffects });
	};

	const handleRemoveDelayedEffect = (effectIndex: number) => {
		const updatedEffects = (choice.delayedEffect || []).filter(
			(_, index) => index !== effectIndex
		);
		handleUpdateChoice(choiceIndex, { delayedEffect: updatedEffects });
		handleSaveChoice();
	};

	return (
		<div className="bg-gray-900 rounded-xl p-6 shadow-2xl mb-6 border-l-4 border-teal-500">
			<div className="flex gap-4 items-center mb-4">
				<button
					onClick={toggleCollapse}
					className="text-gray-400 hover:text-gray-200 transition"
				>
					<div
						className={`transition-transform duration-300 ${
							isOpened ? 'rotate-180' : ''
						}`}
					>
						<ChevronDown size={20} />
					</div>
				</button>
				<div className="grow">
					<input
						type="text"
						value={choice.description}
						onChange={(e) =>
							handleUpdateChoice(choiceIndex, {
								description: e.target.value,
							})
						}
						onBlur={handleSaveChoice}
						className="w-full bg-gray-700 text-white rounded px-3 py-2"
					/>
				</div>
				<button
					onClick={() => handleRemoveChoice(choice.id)}
					className="text-red-400 cursor-pointer hover:text-red-300 transition duration-200"
				>
					<LucideTrash size={20} />
				</button>
			</div>

			<div
				className={`overflow-hidden transition-all duration-300 ${
					isOpened ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
				}`}
			>
				<div className="pt-4">
					<ScoreBar
						editingScores={editingScores}
						handleScoreChange={handleScoreChange}
						saveScoreChange={saveScoreChange}
					/>

					<RevealMessages
						reveals={choice.reveals}
						handleUpdateReveal={handleUpdateReveal}
						handleRemoveReveal={handleRemoveReveal}
						handleAddReveal={handleAddReveal}
						handleSaveReveal={handleSaveChoice}
					/>

					<InteractionEffects
						interactionEffects={choice.interactionEffects}
						roundChoices={roundChoices}
						handleUpdateInteraction={handleUpdateInteraction}
						handleRemoveInteraction={handleRemoveInteraction}
						handleAddInteraction={handleAddInteraction}
						handleSaveInteraction={handleSaveChoice}
					/>
					<DurationEffect
						editingDuration={editingDuration}
						handleDurationChange={handleDurationChange}
						saveDurationChange={handleSaveChoice}
					/>
					<DelayedEffects
						delayedEffects={choice.delayedEffect}
						roundChoices={roundChoices}
						handleUpdateDelayedEffect={handleUpdateDelayedEffect}
						handleRemoveDelayedEffect={handleRemoveDelayedEffect}
						handleAddDelayedEffect={handleAddDelayedEffect}
						handleSaveEffect={handleSaveChoice}
					/>
				</div>
			</div>
		</div>
	);
};

type DelayedEffectsProps = {
	delayedEffects?: delayedEffect[];
	roundChoices: Round[];
	handleUpdateDelayedEffect: (
		effectIndex: number,
		field: keyof delayedEffect,
		value: string | number
	) => void;
	handleRemoveDelayedEffect: (effectIndex: number) => void;
	handleAddDelayedEffect: () => void;
	handleSaveEffect: () => void;
};

const DelayedEffects = ({
	delayedEffects,
	roundChoices,
	handleUpdateDelayedEffect,
	handleRemoveDelayedEffect,
	handleAddDelayedEffect,
	handleSaveEffect,
}: DelayedEffectsProps) => {
	const scoreKeys: (keyof Scores)[] = [
		'expected_profit_score',
		'liquidity_score',
		'solvency_score',
		'IT_score',
		'capacity_score',
	];

	return (
		<div className="mt-6">
			<h4 className="text-lg font-bold text-gray-300 mb-2">Delayed Effects</h4>
			{(delayedEffects || []).map((effect, effectIndex) => (
				<div key={effectIndex} className="bg-gray-800 p-4 rounded-lg mb-2">
					<div className="flex items-center justify-between mb-4">
						<div className="grow mr-4">
							<label className="block text-gray-400 text-sm font-bold mb-1">
								Effective Round
							</label>
							<select
								value={effect.effective_round}
								onChange={(e) =>
									handleUpdateDelayedEffect(
										effectIndex,
										'effective_round',
										e.target.value
									)
								}
								onBlur={handleSaveEffect}
								className="w-full bg-gray-700 text-white rounded px-3 py-2"
							>
								<option value="" disabled>
									Select a round
								</option>
								{roundChoices.map((round) => (
									<option key={round.round_id} value={round.round_id}>
										{round.round_name}
									</option>
								))}
							</select>
						</div>
						<button
							onClick={() => handleRemoveDelayedEffect(effectIndex)}
							className="text-red-400 hover:text-red-300 transition duration-200"
						>
							<LucideTrash size={18} />
						</button>
					</div>

					{/* Score inputs for the delayed effect */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{scoreKeys.map((scoreKey) => (
							<div key={scoreKey}>
								<label className="block text-gray-400 text-sm font-bold mb-1">
									{scoreKey.replace(/_/g, ' ').replace('score', '')}
								</label>
								<input
									type="number"
									value={effect[scoreKey]}
									onChange={(e) =>
										handleUpdateDelayedEffect(
											effectIndex,
											scoreKey,
											e.target.value
										)
									}
									onBlur={handleSaveEffect}
									className="w-full bg-gray-700 text-white rounded px-3 py-2"
								/>
							</div>
						))}
					</div>
				</div>
			))}
			<button
				onClick={handleAddDelayedEffect}
				className="flex items-center space-x-2 text-teal-400 hover:text-teal-300 transition duration-200 mt-2"
			>
				<LucidePlus size={18} />
				<span>Add Delayed Effect</span>
			</button>
		</div>
	);
};

type RevealMessagesProps = {
	reveals?: RevealMessage[];
	handleUpdateReveal: (
		revealIndex: number,
		field: keyof RevealMessage,
		value: string | number
	) => void;
	handleRemoveReveal: (revealIndex: number) => void;
	handleAddReveal: () => void;
	handleSaveReveal: () => void;
};

const RevealMessages = ({
	reveals,
	handleUpdateReveal,
	handleRemoveReveal,
	handleAddReveal,
	handleSaveReveal,
}: RevealMessagesProps) => {
	return (
		<div className="mt-6">
			<h4 className="text-lg font-bold text-gray-300 mb-2">Reveal Messages</h4>
			{(reveals || []).map((reveal, revealIndex) => (
				<div key={revealIndex} className="flex items-center space-x-2 mb-2">
					<textarea
						value={reveal.text}
						rows={5}
						placeholder="Reveal message text"
						onChange={(e) =>
							handleUpdateReveal(revealIndex, 'text', e.target.value)
						}
						onBlur={handleSaveReveal}
						className="flex-grow dark:bg-gray-700 text-white rounded px-3 py-2"
					/>
					<input
						type="number"
						value={reveal.revealedInRounds}
						placeholder="Rounds"
						onChange={(e) =>
							handleUpdateReveal(
								revealIndex,
								'revealedInRounds',
								e.target.value
							)
						}
						onBlur={handleSaveReveal}
						className="w-20 bg-gray-700 text-white rounded px-3 py-2"
					/>
					<button
						onClick={() => handleRemoveReveal(revealIndex)}
						className="text-red-400 hover:text-red-300 transition duration-200"
					>
						<LucideTrash size={18} />
					</button>
				</div>
			))}
			<button
				onClick={handleAddReveal}
				className="flex items-center space-x-2 text-teal-400 hover:text-teal-300 transition duration-200 mt-2"
			>
				<LucidePlus size={18} />
				<span>Add Reveal Message</span>
			</button>
		</div>
	);
};

type InteractionEffectsProps = {
	interactionEffects?: InteractionEffect[];
	roundChoices: Round[];
	handleUpdateInteraction: (
		interactionIndex: number,
		field: keyof InteractionEffect,
		value: string | number
	) => void;
	handleRemoveInteraction: (interactionIndex: number) => void;
	handleAddInteraction: () => void;
	handleSaveInteraction: () => void;
};

const InteractionEffects = ({
	interactionEffects,
	roundChoices,
	handleUpdateInteraction,
	handleRemoveInteraction,
	handleAddInteraction,
	handleSaveInteraction,
}: InteractionEffectsProps) => {
	return (
		<div className="mt-6">
			<h4 className="text-lg font-bold text-gray-300 mb-2">
				Interaction Effects
			</h4>
			{(interactionEffects || []).map((interaction, interactionIndex) => (
				<div
					key={interactionIndex}
					className="flex flex-wrap items-center space-x-2 mb-2"
				>
					<div className="grow">
						<label className="block text-gray-400 text-sm font-bold mb-1">
							Target Round
						</label>
						<select
							value={interaction.roundId}
							onChange={(e) =>
								handleUpdateInteraction(
									interactionIndex,
									'roundId',
									e.target.value
								)
							}
							className="w-full bg-gray-700 text-white rounded px-3 py-2 mb-2 sm:mb-0"
						>
							{roundChoices.map((round) => (
								<option key={round.round_id} value={round.round_id}>
									{round.round_name}
								</option>
							))}
						</select>
					</div>
					<div className="grow">
						<label className="block text-gray-400 text-sm font-bold mb-1">
							Target Choice
						</label>
						<select
							value={interaction.targetChoiceId}
							onChange={(e) =>
								handleUpdateInteraction(
									interactionIndex,
									'targetChoiceId',
									e.target.value
								)
							}
							className="w-full bg-gray-700 text-white rounded px-3 py-2 mb-2 sm:mb-0"
						>
							<option value="" disabled>
								Select a choice
							</option>
							{(
								roundChoices.find((r) => r.round_id === interaction.roundId)
									?.choices ?? []
							).map((targetChoice) => (
								<option key={targetChoice.id} value={targetChoice.id}>
									{targetChoice.description}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-gray-400 text-sm font-bold mb-1">
							Bonus Score
						</label>
						<input
							type="number"
							value={interaction.bonusScore}
							placeholder="Bonus Score"
							onChange={(e) =>
								handleUpdateInteraction(
									interactionIndex,
									'bonusScore',
									e.target.value
								)
							}
							className="w-28 bg-gray-700 text-white rounded px-3 py-2 mb-2 sm:mb-0"
						/>
					</div>
					<div className="self-end mb-2">
						<button
							onClick={() => handleRemoveInteraction(interactionIndex)}
							className="text-red-400 hover:text-red-300 transition duration-200"
						>
							<LucideTrash size={18} />
						</button>
					</div>
				</div>
			))}
			<button
				onClick={handleAddInteraction}
				className="flex items-center space-x-2 text-teal-400 hover:text-teal-300 transition duration-200 mt-2"
			>
				<LucidePlus size={18} />
				<span>Add Interaction Effect</span>
			</button>
		</div>
	);
};

type DurationEffectProps = {
	editingDuration?: number | string | null;
	handleDurationChange: (value: string | number) => void;
	saveDurationChange: () => void;
};

const DurationEffect = ({
	editingDuration,
	handleDurationChange,
	saveDurationChange,
}: DurationEffectProps) => {
	return (
		<div className="">
			<h4 className="text-lg font-bold text-gray-300 mb-2">Duration effect</h4>
			<input
				type="number"
				value={editingDuration || 0}
				onChange={(e) => handleDurationChange(e.target.value)}
				onBlur={() => saveDurationChange()}
				className="w-full bg-gray-700 text-white rounded px-3 py-2"
			/>
		</div>
	);
};
