import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ThemeToggle from '@/components/ThemeToggle';
import DNBLogo from '@/components/dnb';
import AuthSync from '@/lib/firebase/auth-sync';

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
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<AuthSync />
				<div className="flex flex-col">
					<main className="flex-1 min-h-screen">{children}</main>

					<footer className="border-t-8 border-blue-900 px-6 py-8">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center md:text-left">
							<div className="sm:order-last md:order-1 flex justify-center md:justify-end">
								<DNBLogo />
							</div>
							<div className="order-2 flex flex-col items-center">
								<p className="text-xs mb-2">
									© 2025 - {new Date().getFullYear()}{' '}
									<a href="https://www.linkedin.com/in/t-vos/">Thomas Vos</a>
								</p>
							</div>
							<div className="sm:order-1 md:order-last">
								<ThemeToggle />
							</div>
						</div>
					</footer>
				</div>
			</body>
		</html>
	);
}
