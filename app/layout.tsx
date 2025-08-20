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
				<footer className="border-t-8 border-blue-900 bg-white p-4 flex flex-row">
					<div className="flex-1 flex items-center justify-center">
						<img src="/dnb_logo.svg" />
					</div>
					<div className="flex-1 flex items-center justify-center">
						<p className="text-xs mt-2 text-gray-700">
							© 2025 - {new Date().getFullYear()}{' '}
							<a href="https://www.linkedin.com/in/t-vos/">Thomas Vos</a>
						</p>
					</div>
				</footer>
			</body>
		</html>
	);
}
