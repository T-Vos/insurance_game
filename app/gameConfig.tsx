const GameConfig = ({ roundChoices, currentRoundIndex }) => {
	const currentRound = roundChoices[currentRoundIndex];
	if (!currentRound) {
		return (
			<div className="text-center text-gray-400">
				<p className="text-lg">No round selected or available.</p>
			</div>
		);
	}

	return (
		<>
			<div
				key={currentRound.round_id}
				className="bg-gray-800 rounded-xl p-6 shadow-2xl mb-8"
			>
				<h2 className="text-2xl font-semibold mb-4 text-orange-300">
					{currentRound.round_name}
				</h2>
				<div className="space-y-4">
					{/* {currentRound.choices.map((choice, index) => (
						<div
							key={choice.id}
							className="bg-gray-700 rounded-lg p-3 flex justify-between items-center"
						>
							<p className="text-white">
								{index + 1}. {choice.description}
							</p>
							<p className="text-sm text-gray-400">Score: {choice.score}</p>
						</div>
					))} */}
				</div>
			</div>
		</>
	);
};
export default GameConfig;
