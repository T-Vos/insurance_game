'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
	const [darkMode, setDarkMode] = useState(false);

	useEffect(() => {
		const root = document.documentElement; // <html>
		const saved = localStorage.getItem('theme');

		if (saved === 'dark') {
			setDarkMode(true);
			root.classList.add('dark');
		} else if (saved === 'light') {
			setDarkMode(false);
			root.classList.remove('dark');
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			setDarkMode(true);
			root.classList.add('dark');
		}
	}, []);

	const toggleTheme = () => {
		const root = document.documentElement;
		const newMode = !darkMode;
		setDarkMode(newMode);
		localStorage.setItem('theme', newMode ? 'dark' : 'light');
		root.classList.toggle('dark', newMode);
	};

	return (
		<></>
		// <button onClick={() => toggleTheme} className="p-2 border rounded">
		// 	Toggle Theme
		// </button>
	);
}
