import {
	Choice,
	Round,
	RevealMessage,
	InteractionEffect,
	Scores,
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
};

export const ChoiceEditor = ({
	choice,
	choiceIndex,
	handleUpdateChoice,
	handleRemoveChoice,
	roundChoices,
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

	useEffect(() => {
		setEditingScores({
			expected_profit_score: choice?.expected_profit_score || 0,
			liquidity_score: choice?.liquidity_score || 0,
			solvency_score: choice?.solvency_score || 0,
			IT_score: choice?.IT_score || 0,
			capacity_score: choice?.capacity_score || 0,
		});
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
			targetChoiceId: roundChoices[0]?.choices[0]?.id || '',
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
			[scoreKey]: typeof value === 'number' ? value : parseFloat(value) || 0,
		}));
	};
	const saveScoreChange = (scoreKey: keyof Scores) => {
		handleUpdateChoice(choiceIndex, { [scoreKey]: editingScores[scoreKey] });
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
					/>

					<InteractionEffects
						interactionEffects={choice.interactionEffects}
						roundChoices={roundChoices}
						handleUpdateInteraction={handleUpdateInteraction}
						handleRemoveInteraction={handleRemoveInteraction}
						handleAddInteraction={handleAddInteraction}
					/>
				</div>
			</div>
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
};

const RevealMessages = ({
	reveals,
	handleUpdateReveal,
	handleRemoveReveal,
	handleAddReveal,
}: RevealMessagesProps) => {
	return (
		<div className="mt-6">
			<h4 className="text-lg font-bold text-gray-300 mb-2">Reveal Messages</h4>
			{(reveals || []).map((reveal, revealIndex) => (
				<div key={revealIndex} className="flex items-center space-x-2 mb-2">
					<input
						type="text"
						value={reveal.text}
						placeholder="Reveal message text"
						onChange={(e) =>
							handleUpdateReveal(revealIndex, 'text', e.target.value)
						}
						className="flex-grow bg-gray-700 text-white rounded px-3 py-2"
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
};

const InteractionEffects = ({
	interactionEffects,
	roundChoices,
	handleUpdateInteraction,
	handleRemoveInteraction,
	handleAddInteraction,
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
							{roundChoices
								.find((r) => r.round_id === interaction.roundId)
								?.choices.map((targetChoice) => (
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
