import { Scores, scoreTypes } from '@/lib/types';

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
			{scoreTypes.map(({ name, label, title, icon: Icon, color }) => (
				<div
					key={name}
					className="flex flex-col items-center gap-2 bg-gray-700 rounded-lg p-3"
				>
					<Icon size={24} className={`text-${color}`} />
					<span title={title} className="text-sm font-medium text-gray-400">
						{label}
					</span>
					<input
						type="number"
						value={editingScores[name]}
						onChange={(e) => handleScoreChange(name, e.target.value)}
						onBlur={() => saveScoreChange(name)}
						className={`w-full text-center bg-gray-900 text-white rounded-md px-2 py-1 
					focus:ring-2 focus:ring-${color} focus:outline-none`}
					/>
				</div>
			))}
		</div>
	);
};

export default ScoreBar;
