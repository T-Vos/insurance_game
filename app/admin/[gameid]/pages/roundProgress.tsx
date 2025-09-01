import { Round } from '@/lib/types';
import { CheckCircle, Circle } from 'lucide-react';

interface RoundsProgressProps {
	rounds: Round[];
	currentRoundIndex: number;
}

const RoundsProgress: React.FC<RoundsProgressProps> = ({
	rounds,
	currentRoundIndex,
}) => {
	return (
		<div className="flex items-center justify-between w-full mb-6">
			{rounds.map((round, index) => {
				const isCompleted = index < currentRoundIndex;
				const isActive = index === currentRoundIndex;

				return (
					<div
						key={`RoundProgress_${round.round_id}`}
						className="flex-1 flex flex-col items-center relative"
					>
						<div
							className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 
              ${
								isActive
									? 'border-purple-500 bg-purple-600 text-white'
									: isCompleted
									? 'border-green-500 bg-green-500 text-white'
									: 'border-gray-500 bg-gray-800 text-gray-300'
							}`}
						>
							{isCompleted ? <CheckCircle size={18} /> : <Circle size={18} />}
						</div>

						<span
							className={`mt-2 text-sm font-medium text-center ${
								isActive ? 'text-purple-400' : 'text-gray-400'
							}`}
						>
							{round.round_name}
						</span>

						{index < rounds.length - 1 && (
							<div
								className={`absolute top-5 left-1/2 w-full h-0.5 
                ${isCompleted ? 'bg-green-500' : 'bg-gray-600'}`}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default RoundsProgress;
