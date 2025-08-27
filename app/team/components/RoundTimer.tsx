'use client';
import { Check, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RoundTimerProps {
	roundStartedAt: number | null | string; // UNIX timestamp in seconds
	roundDuration: number | null; // total duration in seconds
	confirmed?: boolean;
}

export default function RoundTimer({
	roundStartedAt,
	roundDuration,
	confirmed = false,
}: RoundTimerProps) {
	const [timeLeft, setTimeLeft] = useState<number>(roundDuration || 0);

	const _roundStart: number =
		typeof roundStartedAt == 'string'
			? parseInt(roundStartedAt)
			: roundStartedAt || 0;

	useEffect(() => {
		// Only start the timer if the round has started
		if (!roundStartedAt || !roundDuration) {
			return;
		}

		const interval = setInterval(() => {
			const now = Math.floor(Date.now() / 1000); // current UNIX timestamp in seconds
			const elapsed = now - _roundStart;
			const remaining = Math.max(roundDuration - elapsed, 0);
			setTimeLeft(remaining);
		}, 1000);

		return () => clearInterval(interval);
	}, [roundStartedAt, roundDuration]);

	// If the round has started and is not confirmed, calculate progress for the timer
	if (roundStartedAt && roundDuration && !confirmed) {
		const progress = ((roundDuration - timeLeft) / roundDuration) * 100;
		const radius = 50;
		const circumference = 2 * Math.PI * radius;
		const strokeDashoffset = circumference - (progress / 100) * circumference;

		return (
			<div className="flex items-center justify-center my-4 relative">
				<>
					<svg className="w-32 h-32 transform -rotate-90">
						<circle
							cx="64"
							cy="64"
							r={radius}
							stroke="gray"
							strokeWidth="6"
							fill="transparent"
							opacity="0.3"
						/>
						<circle
							cx="64"
							cy="64"
							r={radius}
							stroke="blue"
							strokeWidth="6"
							fill="transparent"
							strokeDasharray={circumference}
							strokeDashoffset={strokeDashoffset}
							strokeLinecap="round"
							className="transition-all duration-1000 ease-linear"
						/>
					</svg>
					{timeLeft <= 30 && (
						<div className="absolute text-2xl font-bold text-red-600">
							{timeLeft}
						</div>
					)}
				</>
			</div>
		);
	}

	if (confirmed) {
		return (
			<div className="flex items-center justify-center my-4 relative">
				<Check className="text-green-500" size={48} />
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center my-4 relative">
			<Clock className="text-gray-400" size={48} />
		</div>
	);
}
