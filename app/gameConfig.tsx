import { useState } from 'react';
import { Round } from './types';

type GameConfigProps = {
	roundChoices: Round[];
	currentRoundIndex: number;
	handleUpdateRound: (updatedRound: Round) => void;
};

const GameConfig = ({
	roundChoices,
	currentRoundIndex,
	handleUpdateRound,
}: GameConfigProps) => {
	const currentRound = roundChoices[currentRoundIndex];
	const [isEditing, setIsEditing] = useState(false);
	const [editingName, setEditingName] = useState(
		currentRound?.round_name || ''
	);

	if (!currentRound) {
		return (
			<div className="text-center text-gray-400">
				<p className="text-lg">No round selected or available.</p>
			</div>
		);
	}

	const finishEditing = () => {
		if (editingName.trim() !== currentRound.round_name) {
			handleUpdateRound({
				...currentRound,
				round_name: editingName.trim(),
			});
		}
		setIsEditing(false);
	};

	return (
		<>
			<div
				key={currentRound.round_id}
				className="bg-gray-800 rounded-xl p-6 shadow-2xl mb-8"
			>
				{isEditing ? (
					<input
						type="text"
						value={editingName}
						onChange={(e) => setEditingName(e.target.value)}
						onBlur={finishEditing}
						onKeyDown={(e) => {
							if (e.key === 'Enter') finishEditing();
							if (e.key === 'Escape') {
								setEditingName(currentRound.round_name);
								setIsEditing(false);
							}
						}}
						autoFocus
						className="text-2xl font-semibold text-orange-300 bg-gray-700 rounded px-2 py-1 w-full"
					/>
				) : (
					<h2
						className="text-2xl font-semibold mb-4 text-orange-300 cursor-pointer"
						onClick={() => setIsEditing(true)}
						title="Click to edit round name"
					>
						{currentRound.round_name}
					</h2>
				)}

				{/* Placeholder for future round editing config */}
				<div className="space-y-4">
					<p className="text-gray-400 italic">You can now rename the round.</p>
				</div>
			</div>
		</>
	);
};

export default GameConfig;
