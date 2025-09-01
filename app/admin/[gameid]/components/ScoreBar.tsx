import { Scores } from '@/lib/types';
import {
	LucideHandCoins,
	LucideDroplet,
	LucidePiggyBank,
	LucideComputer,
	LucideUsersRound,
} from 'lucide-react';

type scoreBarProps = {
	editingScores: Scores;
	handleScoreChange: (scoreKey: keyof Scores, value: string | number) => void;
	saveScoreChange: (scoreKey: keyof Scores) => void;
};

const ScoreBar = ({
	editingScores: editingScores,
	handleScoreChange: handleScoreChange,
	saveScoreChange: saveScoreChange,
}: scoreBarProps) => {
	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
			<div className="flex flex-col items-center gap-2 bg-gray-700 rounded-lg p-3">
				<LucideHandCoins size={24} className="text-yellow-400" />
				<span
					title="Expected Profit"
					className="text-sm font-medium text-gray-400"
				>
					Profit
				</span>
				<input
					type="number"
					value={editingScores.expected_profit_score}
					onChange={(e) =>
						handleScoreChange('expected_profit_score', e.target.value)
					}
					onBlur={() => saveScoreChange('expected_profit_score')}
					className="w-full text-center bg-gray-900 text-white rounded-md px-2 py-1 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
				/>
			</div>
			<div className="flex flex-col items-center gap-2 bg-gray-700 rounded-lg p-3">
				<LucideDroplet size={24} className="text-blue-400" />
				<span title="Liquidity" className="text-sm font-medium text-gray-400">
					Liquidity
				</span>
				<input
					type="number"
					value={editingScores.liquidity_score}
					onChange={(e) => handleScoreChange('liquidity_score', e.target.value)}
					onBlur={() => saveScoreChange('liquidity_score')}
					className="w-full text-center bg-gray-900 text-white rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
				/>
			</div>
			<div className="flex flex-col items-center gap-2 bg-gray-700 rounded-lg p-3">
				<LucidePiggyBank size={24} className="text-green-400" />
				<span title="Solvency" className="text-sm font-medium text-gray-400">
					Solvency (%)
				</span>
				<input
					type="number"
					value={editingScores.solvency_score}
					onChange={(e) => handleScoreChange('solvency_score', e.target.value)}
					onBlur={() => saveScoreChange('solvency_score')}
					className="w-full text-center bg-gray-900 text-white rounded-md px-2 py-1 focus:ring-2 focus:ring-green-400 focus:outline-none"
				/>
			</div>
			<div className="flex flex-col items-center gap-2 bg-gray-700 rounded-lg p-3">
				<LucideComputer size={24} className="text-purple-400" />
				<span title="IT Score" className="text-sm font-medium text-gray-400">
					IT (%)
				</span>
				<input
					type="number"
					value={editingScores.IT_score}
					onChange={(e) => handleScoreChange('IT_score', e.target.value)}
					onBlur={() => saveScoreChange('IT_score')}
					className="w-full text-center bg-gray-900 text-white rounded-md px-2 py-1 focus:ring-2 focus:ring-purple-400 focus:outline-none"
				/>
			</div>
			<div className="flex flex-col items-center gap-2 bg-gray-700 rounded-lg p-3">
				<LucideUsersRound size={24} className="text-pink-400" />
				<span title="Capacity" className="text-sm font-medium text-gray-400">
					Capacity (%)
				</span>
				<input
					type="number"
					value={editingScores.capacity_score}
					onChange={(e) => handleScoreChange('capacity_score', e.target.value)}
					onBlur={() => saveScoreChange('capacity_score')}
					className="w-full text-center bg-gray-900 text-white rounded-md px-2 py-1 focus:ring-2 focus:ring-pink-400 focus:outline-none"
				/>
			</div>
		</div>
	);
};

export default ScoreBar;
