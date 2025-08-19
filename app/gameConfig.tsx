'use client';
import { useState, useEffect } from 'react';
import { Round, Choice, RevealMessage, InteractionEffect } from './types';
import {
	ChevronDown,
	ChevronRight,
	LucideTrash,
	LucidePlus,
	LucideSave,
} from 'lucide-react';

type GameConfigProps = {
	roundChoices: Round[];
	currentRoundIndex: number;
	handleUpdateRound: (updatedRound: Round) => void;
	handleAddRound: () => void;
};

const GameConfig = ({
	roundChoices,
	currentRoundIndex,
	handleUpdateRound,
	handleAddRound,
}: GameConfigProps) => {
	const [openedChoices, setOpenedOptions] = useState<number[]>([]);

	const toggleCollapse = (choiceId: number) => {
		setOpenedOptions((prev) =>
			prev.includes(choiceId)
				? prev.filter((id) => id !== choiceId)
				: [...prev, choiceId]
		);
	};
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
			<div className="text-center text-gray-400">
				<p className="text-lg">No round selected or available.</p>
				<button
					onClick={handleAddRound}
					className="mt-4 flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
				>
					<LucidePlus size={18} />
					<span>Add New Round</span>
				</button>
			</div>
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
		const newChoiceId = Math.max(...editingChoices.map((c) => c.id), 0) + 1;
		const newChoice: Choice = {
			id: newChoiceId,
			description: 'New choice',
			score: 0,
			capacity: 0,
			duration: 1,
			reveals: [],
			interactionEffects: [],
		};
		setEditingChoices((prevChoices) => [...prevChoices, newChoice]);
	};

	const handleRemoveChoice = (choiceId: number) => {
		setEditingChoices((prevChoices) =>
			prevChoices.filter((choice) => choice.id !== choiceId)
		);
	};

	const handleAddReveal = (choiceIndex: number) => {
		const newReveal: RevealMessage = { text: '', revealedInRounds: 1 };
		const updatedChoices = [...editingChoices];
		updatedChoices[choiceIndex].reveals = [
			...(updatedChoices[choiceIndex].reveals || []),
			newReveal,
		];
		setEditingChoices(updatedChoices);
	};

	const handleUpdateReveal = (
		choiceIndex: number,
		revealIndex: number,
		field: keyof RevealMessage,
		value: string | number
	) => {
		const updatedChoices = [...editingChoices];
		const newReveals = [...(updatedChoices[choiceIndex].reveals || [])];
		if (field === 'revealedInRounds') {
			newReveals[revealIndex] = {
				...newReveals[revealIndex],
				[field]: parseInt(value as string, 10),
			};
		} else {
			newReveals[revealIndex] = { ...newReveals[revealIndex], [field]: value };
		}
		updatedChoices[choiceIndex].reveals = newReveals;
		setEditingChoices(updatedChoices);
	};

	const handleRemoveReveal = (choiceIndex: number, revealIndex: number) => {
		const updatedChoices = [...editingChoices];
		updatedChoices[choiceIndex].reveals = updatedChoices[
			choiceIndex
		].reveals?.filter((_, index) => index !== revealIndex);
		setEditingChoices(updatedChoices);
	};

	const handleAddInteraction = (choiceIndex: number) => {
		const newInteraction: InteractionEffect = {
			targetChoiceId: 0,
			roundId: roundChoices[0]?.round_id || '',
			bonusScore: 0,
		};
		const updatedChoices = [...editingChoices];
		updatedChoices[choiceIndex].interactionEffects = [
			...(updatedChoices[choiceIndex].interactionEffects || []),
			newInteraction,
		];
		setEditingChoices(updatedChoices);
	};

	const handleUpdateInteraction = (
		choiceIndex: number,
		interactionIndex: number,
		field: keyof InteractionEffect,
		value: string | number
	) => {
		const updatedChoices = [...editingChoices];
		const newInteractions = [
			...(updatedChoices[choiceIndex].interactionEffects || []),
		];
		// Parse the value as an integer for targetChoiceId and bonusScore
		const parsedValue =
			field === 'targetChoiceId' || field === 'bonusScore'
				? parseInt(value as string, 10)
				: value;

		newInteractions[interactionIndex] = {
			...newInteractions[interactionIndex],
			[field]: parsedValue,
		};
		updatedChoices[choiceIndex].interactionEffects = newInteractions;
		setEditingChoices(updatedChoices);
	};

	const handleRemoveInteraction = (
		choiceIndex: number,
		interactionIndex: number
	) => {
		const updatedChoices = [...editingChoices];
		updatedChoices[choiceIndex].interactionEffects = updatedChoices[
			choiceIndex
		].interactionEffects?.filter((_, index) => index !== interactionIndex);
		setEditingChoices(updatedChoices);
	};

	const finishEditingName = () => {
		if (editingName.trim() !== currentRound.round_name) {
			handleUpdateRound({
				...currentRound,
				round_name: editingName.trim(),
				choices: editingChoices,
			});
		}
		setIsEditingName(false);
	};

	const saveAllChanges = () => {
		handleUpdateRound({
			...currentRound,
			round_name: editingName.trim(),
			choices: editingChoices,
		});
	};

	return (
		<>
			<div className="bg-gray-800 rounded-xl p-6 shadow-2xl mb-8">
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
										setEditingName(currentRound.round_name);
										setIsEditingName(false);
									}
								}}
								autoFocus
								className="text-2xl font-semibold text-orange-300 bg-gray-700 rounded px-2 py-1 w-full"
							/>
						) : (
							<h2
								className="text-2xl font-semibold text-orange-300 cursor-pointer"
								onClick={() => setIsEditingName(true)}
								title="Click to edit round name"
							>
								{currentRound.round_name}
							</h2>
						)}
					</div>
					<div className="flex flex-col sm:flex-row gap-2">
						<button
							onClick={saveAllChanges}
							className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
						>
							<LucideSave size={18} />
							<span>Save Changes</span>
						</button>
						<button
							onClick={handleAddRound}
							className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
						>
							<LucidePlus size={18} />
							<span>Add New Round</span>
						</button>
					</div>
				</div>

				<div className="mt-8">
					<div className="flex justify-between items-center mb-4">
						<h3 className="text-xl font-bold text-gray-300">
							Choices for this Round
						</h3>
						<button
							onClick={handleAddChoice}
							className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
						>
							<LucidePlus size={18} />
							<span>Add Choice</span>
						</button>
					</div>

					{editingChoices.map((choice, choiceIndex) => {
						const isOpened = openedChoices.includes(choice.id);
						return (
							<div
								key={choice.id}
								className="bg-gray-900 rounded-xl p-6 shadow-2xl mb-6 border-l-4 border-teal-500"
							>
								<div className="flex gap-4 items-center mb-4">
									<button
										onClick={() => toggleCollapse(choice.id)}
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
										className="text-red-400 hover:text-red-300 transition duration-200"
									>
										<LucideTrash size={20} />
									</button>
								</div>

								{/* Collapsible Content */}
								<div
									className={`overflow-hidden transition-all duration-300 ${
										isOpened ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
									}`}
								>
									<div className="pt-4">
										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 items-end">
											<div className="grow">
												<label className="block text-gray-400 text-sm font-bold mb-1">
													Score
												</label>
												<input
													type="number"
													value={choice.score}
													onChange={(e) =>
														handleUpdateChoice(choiceIndex, {
															score: parseInt(e.target.value, 10),
														})
													}
													className="w-full bg-gray-700 text-white rounded px-3 py-2"
												/>
											</div>
											<div className="grow">
												<label className="block text-gray-400 text-sm font-bold mb-1">
													Capacity
												</label>
												<input
													type="number"
													value={choice.capacity}
													onChange={(e) =>
														handleUpdateChoice(choiceIndex, {
															capacity: parseInt(e.target.value, 10),
														})
													}
													className="w-full bg-gray-700 text-white rounded px-3 py-2"
												/>
											</div>
											<div className="grow">
												<label className="block text-gray-400 text-sm font-bold mb-1">
													Duration
												</label>
												<input
													type="number"
													value={choice.duration}
													onChange={(e) =>
														handleUpdateChoice(choiceIndex, {
															duration: parseInt(e.target.value, 10),
														})
													}
													className="w-full bg-gray-700 text-white rounded px-3 py-2"
												/>
											</div>
										</div>

										<div className="mt-6">
											<h4 className="text-lg font-bold text-gray-300 mb-2">
												Reveal Messages
											</h4>
											{(choice.reveals || []).map((reveal, revealIndex) => (
												<div
													key={revealIndex}
													className="flex items-center space-x-2 mb-2"
												>
													<input
														type="text"
														value={reveal.text}
														placeholder="Reveal message text"
														onChange={(e) =>
															handleUpdateReveal(
																choiceIndex,
																revealIndex,
																'text',
																e.target.value
															)
														}
														className="flex-grow bg-gray-700 text-white rounded px-3 py-2"
													/>
													<input
														type="number"
														value={reveal.revealedInRounds}
														placeholder="Rounds"
														onChange={(e) =>
															handleUpdateReveal(
																choiceIndex,
																revealIndex,
																'revealedInRounds',
																e.target.value
															)
														}
														className="w-20 bg-gray-700 text-white rounded px-3 py-2"
													/>
													<button
														onClick={() =>
															handleRemoveReveal(choiceIndex, revealIndex)
														}
														className="text-red-400 hover:text-red-300 transition duration-200"
													>
														<LucideTrash size={18} />
													</button>
												</div>
											))}
											<button
												onClick={() => handleAddReveal(choiceIndex)}
												className="flex items-center space-x-2 text-teal-400 hover:text-teal-300 transition duration-200 mt-2"
											>
												<LucidePlus size={18} />
												<span>Add Reveal Message</span>
											</button>
										</div>

										<div className="mt-6">
											<h4 className="text-lg font-bold text-gray-300 mb-2">
												Interaction Effects
											</h4>
											{(choice.interactionEffects || []).map(
												(interaction, interactionIndex) => (
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
																		choiceIndex,
																		interactionIndex,
																		'roundId',
																		e.target.value
																	)
																}
																className="w-full bg-gray-700 text-white rounded px-3 py-2 mb-2 sm:mb-0"
															>
																{roundChoices.map((round) => (
																	<option
																		key={round.round_id}
																		value={round.round_id}
																	>
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
																		choiceIndex,
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
																	.find(
																		(r) => r.round_id === interaction.roundId
																	)
																	?.choices.map((targetChoice) => (
																		<option
																			key={targetChoice.id}
																			value={targetChoice.id}
																		>
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
																		choiceIndex,
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
																onClick={() =>
																	handleRemoveInteraction(
																		choiceIndex,
																		interactionIndex
																	)
																}
																className="text-red-400 hover:text-red-300 transition duration-200"
															>
																<LucideTrash size={18} />
															</button>
														</div>
													</div>
												)
											)}
											<button
												onClick={() => handleAddInteraction(choiceIndex)}
												className="flex items-center space-x-2 text-teal-400 hover:text-teal-300 transition duration-200 mt-2"
											>
												<LucidePlus size={18} />
												<span>Add Interaction Effect</span>
											</button>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</>
	);
};

export default GameConfig;
