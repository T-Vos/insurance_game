'use client';

import { useState, useRef } from 'react';

export default function GameCodeInput({
	value,
	onChange,
}: {
	value: string;
	onChange: (val: string) => void;
}) {
	const inputs = Array.from({ length: 6 });
	const refs = inputs.map(() => useRef<HTMLInputElement>(null));

	const handleChange = (index: number, char: string) => {
		const chars = value.split('');
		chars[index] = char.toUpperCase().slice(-1); // enforce 1 char uppercase
		const newVal = chars.join('');
		onChange(newVal);

		// auto move to next
		if (char && index < 5) {
			refs[index + 1].current?.focus();
		}
	};

	const handleKeyDown = (
		index: number,
		e: React.KeyboardEvent<HTMLInputElement>
	) => {
		if (e.key === 'Backspace' && !value[index] && index > 0) {
			refs[index - 1].current?.focus();
		}
	};

	return (
		<div className="flex gap-2 justify-center">
			{inputs.map((_, i) => (
				<input
					key={i}
					ref={refs[i]}
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
