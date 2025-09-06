import {
	Choice,
	Round,
	RevealMessage,
	InteractionEffect,
	Scores,
	delayedEffect,
	roleType,
	roleTypes,
} from '@/lib/types';
import { ChevronDown, LucideTrash, LucidePlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import ScoreBar from './ScoreBar'; // Assuming ScoreBar exists and is fine
import { delete_button, input_box } from './styling';
import clsx from 'clsx';

type ChoiceEditorProps = {
	choice: Choice;
	allChoices: Choice[]; // Use a flat list of all choices for interactions
	allRounds: Round[]; // Use a flat list of all rounds for delayed effects
	onSave: (updatedChoice: Choice) => void;
	onRemove: (choiceId: string) => void;
};

export const ChoiceEditor = ({
	choice,
	allChoices,
	allRounds,
	onSave,
	onRemove,
}: ChoiceEditorProps) => {
	const [isOpened, setIsOpened] = useState(false);
	const toggleCollapse = () => setIsOpened(!isOpened);

	const [localChoice, setLocalChoice] = useState<Choice>(choice);

	useEffect(() => {
		setLocalChoice(choice);
	}, [choice]);

	const handleUpdateLocalChoice = (field: keyof Choice, value: unknown) => {
		setLocalChoice((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleUpdateReveal = (
		revealIndex: number,
		field: keyof RevealMessage,
		value: string | number | roleType[]
	) => {
		const updatedReveals = [...(localChoice.reveals || [])];
		const parsedValue =
			field === 'revealedInRounds' ? parseInt(value as string, 10) : value;

		updatedReveals[revealIndex] = {
			...updatedReveals[revealIndex],
			[field]: parsedValue,
		};
		handleUpdateLocalChoice('reveals', updatedReveals);
	};

	const handleAddReveal = () => {
		const randomFirstNames = ['HR', 'NOS', 'NRC', 'Random Name', 'Foo Bar'];
		const randomNumber = Math.ceil(Math.random() * 3);
		const newReveal: RevealMessage = {
			id: crypto.randomUUID(),
			text: '',
			revealedInRounds: 1,
			message_sender: randomFirstNames[randomNumber],
			message_sender_image: '/portrait.jpg',
		};
		const updatedReveals = [...(localChoice.reveals || []), newReveal];
		handleUpdateLocalChoice('reveals', updatedReveals);
	};

	const handleRemoveReveal = (revealIndex: number) => {
		const updatedReveals = (localChoice.reveals || []).filter(
			(_, index) => index !== revealIndex
		);
		const newChoice = {
			...localChoice,
			reveals: updatedReveals,
		};

		setLocalChoice(newChoice);
		onSave(newChoice);
	};

	const handleUpdateInteraction = (
		interactionIndex: number,
		field: keyof InteractionEffect,
		value: string | number
	) => {
		const updatedInteractions = [...(localChoice.interactionEffects || [])];
		const parsedValue =
			field === 'bonusScore' ? parseInt(value as string, 10) : value;

		updatedInteractions[interactionIndex] = {
			...updatedInteractions[interactionIndex],
			[field]: parsedValue,
		};
		handleUpdateLocalChoice('interactionEffects', updatedInteractions);
	};

	const handleAddInteraction = () => {
		const newInteraction: InteractionEffect = {
			targetChoiceId: allChoices[0]?.id || '',
			bonusScore: 0,
			roundId: allRounds[0]?.round_id || '',
			effectType: 'bonusScore',
		};
		const updatedInteractions = [
			...(localChoice.interactionEffects || []),
			newInteraction,
		];
		handleUpdateLocalChoice('interactionEffects', updatedInteractions);
	};

	const handleRemoveInteraction = (interactionIndex: number) => {
		const updatedInteractions = (localChoice.interactionEffects || []).filter(
			(_, index) => index !== interactionIndex
		);
		handleUpdateLocalChoice('interactionEffects', updatedInteractions);
	};

	const handleScoreChange = (
		scoreKey: keyof Scores,
		value: string | number
	) => {
		const _score =
			typeof value === 'number' ? value : parseFloat(value as string) || 0;
		setLocalChoice((prev) => ({
			...prev,
			[scoreKey]: _score,
		}));
	};

	const handleDurationChange = (value: string | number) => {
		const _duration =
			typeof value === 'number' ? value : parseFloat(value as string) || 0;
		handleUpdateLocalChoice('duration', _duration);
	};

	const handleAddDelayedEffect = () => {
		const newEffect: delayedEffect = {
			effective_round: allRounds[0]?.round_id || '',
			expected_profit_score: 0,
			liquidity_score: 0,
			solvency_score: 0,
			IT_score: 0,
			capacity_score: 0,
		};
		const updatedEffects = [...(localChoice.delayedEffect || []), newEffect];
		handleUpdateLocalChoice('delayedEffect', updatedEffects);
	};

	const handleUpdateDelayedEffect = (
		effectIndex: number,
		field: keyof delayedEffect,
		value: string | number
	) => {
		const updatedEffects = [...(localChoice.delayedEffect || [])];
		let parsedValue = value;
		if (field != 'effective_round') {
			parsedValue =
				typeof value === 'number' ? value : parseFloat(value as string) || 0;
		}

		updatedEffects[effectIndex] = {
			...updatedEffects[effectIndex],
			[field]: parsedValue,
		};

		handleUpdateLocalChoice('delayedEffect', updatedEffects);
	};

	const handleRemoveDelayedEffect = (effectIndex: number) => {
		const updatedEffects = (localChoice.delayedEffect || []).filter(
			(_, index) => index !== effectIndex
		);
		handleUpdateLocalChoice('delayedEffect', updatedEffects);
	};

	const handleSaveAndClose = () => {
		onSave(localChoice);
		setIsOpened(false);
	};

	// The main component renders the sub-components
	return (
		<div className="bg-gray-900 rounded-xl p-6 shadow-2xl mb-6 border-l-4 border-teal-500">
			<div className="flex gap-4 items-center mb-4">
				<button
					onClick={toggleCollapse}
					className="text-gray-400 hover:text-gray-200 transition"
				>
					<div
						className={`transition-transform duration-300 ${
							isOpened ? '' : 'rotate-180'
						}`}
					>
						<ChevronDown size={20} />
					</div>
				</button>
				<div className="grow">
					<input
						type="text"
						value={localChoice.description}
						onChange={(e) =>
							handleUpdateLocalChoice('description', e.target.value)
						}
						onBlur={() => onSave(localChoice)}
						className="w-full bg-gray-700 text-white rounded px-3 py-2"
					/>
				</div>
				<button
					onClick={() => onRemove(localChoice.id)}
					className="text-red-400 cursor-pointer hover:text-red-300 transition duration-200"
				>
					<LucideTrash size={20} />
				</button>
			</div>
			<span className="font-extralight">Choice id: {localChoice.id}</span>
			<div
				className={`overflow-hidden transition-all duration-300 ${
					isOpened ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
				}`}
			>
				<div className="pt-4">
					<ScoreBar
						editingScores={{
							expected_profit_score: localChoice.expected_profit_score,
							liquidity_score: localChoice.liquidity_score,
							solvency_score: localChoice.solvency_score,
							IT_score: localChoice.IT_score,
							capacity_score: localChoice.capacity_score,
						}}
						handleScoreChange={handleScoreChange}
						saveScoreChange={() => onSave(localChoice)}
					/>

					<RevealMessages
						reveals={localChoice.reveals}
						handleUpdateReveal={handleUpdateReveal}
						handleRemoveReveal={handleRemoveReveal}
						handleAddReveal={handleAddReveal}
						handleSaveReveal={() => onSave(localChoice)}
					/>

					<InteractionEffects
						interactionEffects={localChoice.interactionEffects}
						allChoices={allChoices} // Pass the correct prop
						handleUpdateInteraction={handleUpdateInteraction}
						handleRemoveInteraction={handleRemoveInteraction}
						handleAddInteraction={handleAddInteraction}
						handleSaveInteraction={() => onSave(localChoice)}
					/>
					<DurationEffect
						editingDuration={localChoice.duration}
						handleDurationChange={handleDurationChange}
						saveDurationChange={() => onSave(localChoice)}
					/>
					<DelayedEffects
						delayedEffects={localChoice.delayedEffect}
						allRounds={allRounds} // Pass the correct prop
						handleUpdateDelayedEffect={handleUpdateDelayedEffect}
						handleRemoveDelayedEffect={handleRemoveDelayedEffect}
						handleAddDelayedEffect={handleAddDelayedEffect}
						handleSaveEffect={() => onSave(localChoice)}
					/>
				</div>
			</div>
		</div>
	);
};

type DelayedEffectsProps = {
	delayedEffects?: delayedEffect[];
	allRounds: Round[]; // Use flat array
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
	allRounds,
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
				<div
					key={`Delay_effect_${effectIndex}`}
					className="bg-gray-800 p-4 rounded-lg mb-2"
				>
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
								{allRounds.map(
									(
										round // Use allRounds here
									) => (
										<option
											key={`Alle_rondes_select_delay_effects_${round.round_id}`}
											value={round.round_id}
										>
											{round.round_name}
										</option>
									)
								)}
							</select>
						</div>
						<button
							onClick={() => handleRemoveDelayedEffect(effectIndex)}
							className="text-red-400 hover:text-red-300 transition duration-200"
						>
							<LucideTrash size={18} />
						</button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{scoreKeys.map((scoreKey) => (
							<div key={`Scores_choices_${scoreKey}`}>
								<label className="block text-gray-400 text-sm font-bold mb-1">
									{scoreKey.replace(/_/g, ' ').replace('score', '')}
								</label>
								<input
									type="number"
									value={effect[scoreKey] || 0}
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
		value: string | number | roleType[]
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
			<h4 className="text-lg font-bold  text-gray-300 mb-2">Reveal Messages</h4>
			{(reveals || []).map((reveal, revealIndex) => (
				<div
					key={`reveal_message_editor${revealIndex}`}
					className="flex flex-col space-y-3 mb-4 bg-gray-800 p-4 rounded-lg"
				>
					<div className="flex-grow">
						<label className="block text-gray-400 text-sm font-bold mb-2">
							Bericht tekst
						</label>
						<textarea
							value={String(reveal.text)}
							rows={5}
							placeholder="Reveal message text"
							onChange={(e) =>
								handleUpdateReveal(revealIndex, 'text', e.target.value)
							}
							onBlur={handleSaveReveal}
							className="bg-gray-700 w-full text-white rounded px-3 py-2"
						/>
					</div>

					<div className="flex-grow">
						<label className="block text-gray-400 text-sm font-bold mb-2">
							Laten zien rondes later
						</label>
						<div className="flex items-center space-x-2">
							<input
								type="number"
								value={reveal.revealedInRounds || ''}
								placeholder="Rounds"
								onChange={(e) =>
									handleUpdateReveal(
										revealIndex,
										'revealedInRounds',
										e.target.value
									)
								}
								onBlur={handleSaveReveal}
								className="w-full bg-gray-700 text-white rounded px-3 py-2"
							/>

							{/* Remove button */}
							<button
								onClick={() => handleRemoveReveal(revealIndex)}
								className="text-red-400 hover:text-red-300 transition duration-200"
							>
								<LucideTrash size={18} />
							</button>
						</div>
					</div>

					<div>
						<label className="block text-gray-400 text-sm font-bold mb-2">
							Zichtbaar voor rollen
							<span className="text-gray-500 ml-2 text-xs">
								(leeg = iedereen)
							</span>
						</label>
						<div className="flex flex-wrap gap-3">
							{roleTypes.map((role) => {
								const isSelected =
									reveal.revealdForRoles?.includes(role.name) ?? false;
								return (
									<label
										key={`Rollen_selectie_${role.name}`}
										className="flex items-center space-x-2 cursor-pointer"
									>
										<input
											type="checkbox"
											checked={isSelected}
											onChange={(e) => {
												let updatedRoles = reveal.revealdForRoles || [];
												if (e.target.checked) {
													updatedRoles = [...updatedRoles, role.name];
												} else {
													updatedRoles = updatedRoles.filter(
														(r) => r !== role.name
													);
												}
												handleUpdateReveal(
													revealIndex,
													'revealdForRoles',
													updatedRoles
												);
											}}
											onBlur={handleSaveReveal}
											className="form-checkbox h-4 w-4 text-teal-400"
										/>
										<span className="text-gray-300"> {role.name}</span>
									</label>
								);
							})}
						</div>
					</div>
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
	allChoices: Choice[]; // Use flat array
	handleUpdateInteraction: (
		interactionIndex: number,
		field: keyof InteractionEffect,
		value: string | number
	) => void;
	handleRemoveInteraction: (interactionIndex: number) => void;
	handleAddInteraction: () => void;
	handleSaveInteraction: () => void;
};

interface GroupedChoices {
	[key: Round['round_id']]: Choice[];
}

const InteractionEffects = ({
	interactionEffects,
	allChoices, // Use the new prop
	handleUpdateInteraction,
	handleRemoveInteraction,
	handleAddInteraction,
	handleSaveInteraction,
}: InteractionEffectsProps) => {
	const [groupedChoices, setGroupedChoices] = useState<GroupedChoices>({});
	const [selectedRoundId, setSelectedRoundId] = useState<Round['round_id']>('');
	const [availableChoices, setAvailableChoices] = useState<Choice[]>([]);
	const [selectedRounds, setSelectedRounds] = useState<
		Record<number, Round['round_id']>
	>({});

	useEffect(() => {
		const choicesByRound = allChoices.reduce((acc: GroupedChoices, choice) => {
			const { round_id } = choice;
			if (!acc[round_id]) {
				acc[round_id] = [];
			}
			acc[round_id].push(choice);
			return acc;
		}, {});

		setGroupedChoices(choicesByRound);
	}, [allChoices]);
	useEffect(() => {
		const initialSelectedRounds: Record<number, Round['round_id']> = {};
		(interactionEffects || []).forEach((interaction, index) => {
			if (interaction.roundId) {
				initialSelectedRounds[index] = interaction.roundId;
			}
		});
		setSelectedRounds(initialSelectedRounds);
	}, [interactionEffects]);
	useEffect(() => {
		if (selectedRoundId && groupedChoices[selectedRoundId]) {
			setAvailableChoices(groupedChoices[selectedRoundId]);
		} else {
			setAvailableChoices([]);
		}
	}, [selectedRoundId, groupedChoices]);

	const handleRoundChange = (
		interactionIndex: number,
		roundId: Round['round_id']
	) => {
		// Update the local state for the selected round
		setSelectedRounds((prev) => ({
			...prev,
			[interactionIndex]: roundId,
		}));

		// Also update the parent state for the interaction effect
		handleUpdateInteraction(interactionIndex, 'roundId', roundId);

		// This is a key step: when the round changes, also reset the targetChoiceId
		// so the user can select a choice from the new round.
		handleUpdateInteraction(interactionIndex, 'targetChoiceId', '');
	};

	const getAvailableChoices = (interactionIndex: number) => {
		const roundId = selectedRounds[interactionIndex];
		return groupedChoices[roundId] || [];
	};
	return (
		<div className="mt-6">
			<h4 className="text-lg font-bold text-gray-300 mb-2">
				Interaction Effects
			</h4>
			{(interactionEffects || []).map((interaction, interactionIndex) => (
				<div
					key={`interaction_${interactionIndex}`}
					className="flex flex-wrap items-center space-x-2 mb-2"
				>
					{/* Round Selector */}
					<div className="grow flex-1">
						<label className="block text-gray-400 text-sm font-bold mb-1">
							Round
						</label>
						<select
							value={interaction.roundId || ''} // Use the prop value for persistence
							onChange={(e) =>
								handleRoundChange(interactionIndex, e.target.value)
							}
							className={clsx('w-full', input_box)}
						>
							<option value="" disabled>
								Select a round
							</option>
							{Object.keys(groupedChoices).map((roundId) => (
								<option
									key={`round_${roundId}`}
									value={roundId}
								>{`Round ${roundId}`}</option>
							))}
						</select>
					</div>

					{/* Target Choice Selector */}
					<div className="grow flex-1">
						<label className="block text-gray-400 text-sm font-bold mb-1">
							Target Choice
						</label>
						<select
							value={interaction.targetChoiceId || ''}
							onChange={(e) =>
								handleUpdateInteraction(
									interactionIndex,
									'targetChoiceId',
									e.target.value
								)
							}
							onBlur={handleSaveInteraction}
							className={clsx('w-full', input_box)}
							disabled={!interaction.roundId} // Disable until a round is selected
						>
							<option value="" disabled>
								Select a choice
							</option>
							{getAvailableChoices(interactionIndex).map((targetChoice) => (
								<option key={targetChoice.id} value={targetChoice.id}>
									{targetChoice.description}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-gray-400 text-sm font-bold mb-1">
							Target Choice
						</label>
						<select
							value={interaction.effectType}
							onChange={(e) => {
								handleUpdateInteraction(interactionIndex, 'bonusScore', 0);
								handleUpdateInteraction(
									interactionIndex,
									'effectType',
									e.target.value
								);
							}}
							onBlur={handleSaveInteraction}
							className={input_box}
						>
							<option value="bonusScore">Bonus score</option>
							<option value="allows">Mogelijk maken</option>
							<option value="disallows">Onmogelijk maken</option>
						</select>
					</div>
					<div>
						<label className="block text-gray-400 text-sm font-bold mb-1">
							Bonus Score
						</label>
						<input
							type="number"
							disabled={interaction.effectType !== 'bonusScore'}
							value={interaction.bonusScore || 0}
							placeholder="Bonus Score"
							onChange={(e) =>
								handleUpdateInteraction(
									interactionIndex,
									'bonusScore',
									e.target.value
								)
							}
							onBlur={handleSaveInteraction}
							className={clsx('w-28', input_box)}
						/>
					</div>
					<div className="self-end mb-2">
						<button
							onClick={() => handleRemoveInteraction(interactionIndex)}
							className={delete_button}
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
