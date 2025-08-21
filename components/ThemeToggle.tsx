'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
	const [darkMode, setDarkMode] = useState(false);

	useEffect(() => {
		const root = document.documentElement;
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

		if (newMode) {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
	};

	return (
		<motion.button
			onClick={toggleTheme}
			aria-label="Toggle theme"
			className="mt-2 p-2 rounded-full flex items-center justify-center"
			animate={{
				backgroundColor: darkMode ? '#1e293b' : '#facc15', // slate-800 vs yellow-400
			}}
			transition={{ duration: 0.4 }}
		>
			<AnimatePresence mode="wait" initial={false}>
				{darkMode ? (
					<motion.div
						key="moon"
						initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
						animate={{ rotate: 0, opacity: 1, scale: 1 }}
						exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
						transition={{ duration: 0.3 }}
					>
						<Moon className="w-5 h-5 text-white" />
					</motion.div>
				) : (
					<motion.div
						key="sun"
						initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
						animate={{ rotate: 0, opacity: 1, scale: 1 }}
						exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
						transition={{ duration: 0.3 }}
					>
						<Sun className="w-5 h-5 text-black" />
					</motion.div>
				)}
			</AnimatePresence>
		</motion.button>
	);
}
