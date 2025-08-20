'use client';

import { useRef, useEffect } from 'react';

interface GameCodeInputProps {
	value: string;
	onChange: (val: string) => void;
}

export default function GameCodeInput({ value, onChange }: GameCodeInputProps) {
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
			{Array.from({ length: 6 }).map((_, i) => (
				<input
					key={i}
					ref={(el) => {
						inputsRef.current[i] = el!;
					}}
					type="text"
					maxLength={1}
					value={value[i] ?? ''}
					onChange={(e) => handleChange(i, e.target.value)}
					onKeyDown={(e) => handleKeyDown(i, e)}
					className="w-12 h-12 text-center text-xl font-bold border rounded-lg focus:ring-2 focus:ring-blue-500"
				/>
			))}
		</div>
	);
}
