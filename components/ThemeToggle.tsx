'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
	const [darkMode, setDarkMode] = useState(false);

	useEffect(() => {
		const saved = localStorage.getItem('theme');
		if (saved === 'dark') {
			setDarkMode(true);
			document.body.classList.add('dark');
		} else if (saved === 'light') {
			setDarkMode(false);
			document.body.classList.remove('dark');
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			setDarkMode(true);
			document.body.classList.add('dark');
		}
	}, []);

	const toggleTheme = () => {
		const newMode = !darkMode;
		setDarkMode(newMode);
		localStorage.setItem('theme', newMode ? 'dark' : 'light');
		document.body.classList.toggle('dark', newMode);
	};

	return (
		<button
			onClick={toggleTheme}
			className="mt-2 px-3 py-1 border rounded dark:border-gray-300 dark:text-white text-sm"
		>
			{darkMode ? 'Light Mode' : 'Dark Mode'}
		</button>
	);
}
