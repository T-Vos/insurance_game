'use client';

import { useRef, useEffect } from 'react';
import clsx from 'clsx';

interface GameCodeInputProps {
	value: string;
	disabled?: boolean;
	onChange: (val: string) => void;
}

export default function GameCodeInput({
	value,
	onChange,
	disabled,
}: GameCodeInputProps) {
	const inputsRef = useRef<HTMLInputElement[]>([]);

	useEffect(() => {
		if (inputsRef.current[0]) inputsRef.current[0].focus();
	}, []);

	const handleChange = (index: number, val: string) => {
		const chars = value.split('');
		chars[index] = val.toUpperCase().slice(-1);
		const newVal = chars.join('').padEnd(6, '');
		onChange(newVal);

		if (val && index < 5) {
			inputsRef.current[index + 1].focus();
		}
	};

	const handleKeyDown = (
		index: number,
		e: React.KeyboardEvent<HTMLInputElement>
	) => {
		if (e.key === 'Backspace' && !value[index] && index > 0) {
			inputsRef.current[index - 1].focus();
		}
	};

	return (
		<div className="flex gap-2 justify-center">
			{Array.from({ length: 6 }).map((_, i) =>
				disabled ? (
					// Skeleton block
					<div
						key={i}
						className={clsx('w-12 h-12 rounded-lg bg-gray-200 animate-pulse')}
						style={{ animationDelay: `${i * 0.15}s` }}
					></div>
				) : (
					<input
						key={i}
						ref={(el) => {
							inputsRef.current[i] = el!;
						}}
						type="text"
						maxLength={1}
						required
						value={value[i] ?? ''}
						onChange={(e) => handleChange(i, e.target.value)}
						onKeyDown={(e) => handleKeyDown(i, e)}
						className="w-12 h-12 text-center text-xl font-bold border rounded-lg focus:ring-2 focus:ring-blue-500"
					/>
				)
			)}
		</div>
	);
}
