import clsx from 'clsx';
import {
	LucideChevronLeft,
	LucideChevronRight,
	LucidePlay,
	LucideSquare,
} from 'lucide-react';

type HeaderProps = {
	isGameRunning: boolean;
	handleStartGame: () => void;
	handleNextRound: () => void;
	handleStopGame: () => void;
	currentRoundIndex: number;
	isLastRound: boolean;
	handlePreviousRound: () => void;
};

const PlayControls = ({
	isGameRunning,
	handleStartGame,
	handleNextRound,
	handleStopGame,
	currentRoundIndex = 0,
	isLastRound = false,
	handlePreviousRound,
}: HeaderProps) => {
	return (
		<div className="mt-6 border-t border-gray-400 dark:border-gray-600 pt-4 flex flex-col space-y-2">
			{!isGameRunning && (
				<button
					onClick={handleStartGame}
					className="px-4 py-2 flex items-center justify-center space-x-2 rounded-lg font-medium transition duration-300 bg-green-500 text-white hover:bg-green-600"
				>
					<LucidePlay size={18} />
					<span>Start Game</span>
				</button>
			)}
			{isGameRunning && (
				<>
					<button
						onClick={handleNextRound}
						disabled={isLastRound}
						className={`px-4 py-2 flex cursor-pointer items-center justify-center space-x-2 rounded-lg font-medium transition duration-300 ${
							isLastRound
								? 'bg-gray-300 text-gray-400 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed'
								: 'bg-blue-500 text-white hover:bg-blue-600'
						}`}
					>
						<span>Volgende ronde</span>
						<LucideChevronRight size={18} />
					</button>
					<button
						onClick={handlePreviousRound}
						disabled={currentRoundIndex == 0}
						className={clsx(
							`px-4 py-2 flex cursor-pointer items-center justify-center space-x-2 rounded-lg font-medium transition duration-300`,
							currentRoundIndex == 0
								? 'bg-gray-300 text-gray-400 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed'
								: 'bg-blue-500 text-white hover:bg-blue-600'
						)}
					>
						<span>Vorige ronde</span>
						<LucideChevronLeft size={18} />
					</button>
				</>
			)}
			{isGameRunning && (
				<button
					onClick={handleStopGame}
					className="px-4 py-2 flex items-center justify-center space-x-2 rounded-lg font-medium transition duration-300 bg-red-500 text-white hover:bg-red-600"
				>
					<LucideSquare size={18} />
					<span>Stop Game</span>
				</button>
			)}
		</div>
	);
};

export default PlayControls;
