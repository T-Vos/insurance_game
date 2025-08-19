import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Insurance Game',
	description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
				<footer className="text-center text-gray-500 mt-8">
					<p className="text-xs mt-2">
						© 2025 - {new Date().getFullYear()}{' '}
						<a href="https://www.linkedin.com/in/t-vos/">Thomas Vos</a>
					</p>
				</footer>
			</body>
		</html>
	);
}
