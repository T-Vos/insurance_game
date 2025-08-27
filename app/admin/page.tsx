'use client';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Game } from '@/lib/types';
import { generateUniqueGameKey } from '@/lib/generate_game_key';
import { ArrowRight, Paperclip, Pencil, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Tooltip from '@/components/Tooltip';

export default function AdminDashboard() {
	const [games, setGames] = useState<Game[]>([]);
	const [loading, setLoading] = useState(true);
	const [userId, setUserId] = useState<string | null>(null);
	const [QR_URL, setQR_URL] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		const auth = getAuth();
		// Listen for auth state changes to ensure the user is loaded
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				console.log('User session loaded. Fetching games for UID:', user.uid);
				setUserId(user.uid);
				setLoading(true);
				try {
					const gamesRef = collection(db, 'insurance_game');
					// This query now runs only when we are sure the user is available
					const q = query(
						gamesRef,
						where('admin_user_ids', 'array-contains', user.uid)
					);
					const snapshot = await getDocs(q);
					const fetchedGames: Game[] = snapshot.docs.map(
						(doc) => ({ id: doc.id, ...doc.data() } as Game)
					);
					console.log('Fetched games:', fetchedGames);
					setGames(fetchedGames);
				} catch (error) {
					console.error('Failed to fetch games:', error);
					// Handle error, e.g., show an error message
				} finally {
					setLoading(false);
				}
			} else {
				// No user found, redirect to login
				console.error('No user session found. Redirecting...');
				setLoading(false);
				router.push('/admin/login');
			}
		});

		// Cleanup the listener when the component unmounts
		return () => unsubscribe();
	}, [router]);

	const handleCreateGame = async () => {
		if (!userId) return;

		const name = prompt('Enter new game name');
		if (!name) return;

		const uniqueKey = await generateUniqueGameKey();

		const newGame = {
			name,
			key: uniqueKey,
			rounds: [],
			teams: [],
			admin_user_ids: [userId],
		};

		const gamesRef = collection(db, 'insurance_game');
		const docRef = await addDoc(gamesRef, newGame);

		router.push(`/admin/${docRef.id}`);
	};

	const copyRuleSet = (game: Game) => {
		console.log('Change game name for:', game);
	};

	const changeGameName = (game: Game) => {
		console.log('Change game name for:', game);
	};

	if (loading) return <div>Loading games...</div>;

	return (
		<div className="min-h-screen bg-gray-900 text-white p-8">
			<h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

			<button
				onClick={handleCreateGame}
				className="bg-teal-500 px-4 py-2 rounded-lg mb-4 hover:bg-teal-400"
			>
				+ Create New Game
			</button>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 grid-">
				{games.map((game) => (
					<div key={game.id} className="bg-gray-800 p-4 rounded-xl  transition">
						<h2 className="font-bold text-xl">{game.name}</h2>
						<p className="text-sm text-gray-400">Key: {game.key}</p>
						<div className="flex gap-2 mt-4">
							<Tooltip content="Share QR Code">
								<button
									onClick={() =>
										setQR_URL(
											`${window.location.origin}/team/join?code=${game.key}`
										)
									}
									className="p-2 rounded hover:bg-gray-700 relative group"
									aria-label="Share QR Code"
								>
									<QrCode className="w-5 h-5" />
								</button>
							</Tooltip>
							<Tooltip content="Copy rule set">
								<button
									onClick={() => copyRuleSet(game)}
									className="p-2 rounded hover:bg-gray-700 relative group"
									aria-label="Copy Rule Set"
								>
									<Paperclip className="w-5 h-5" />
								</button>
							</Tooltip>
							<Tooltip content="Change name">
								<button
									onClick={() => changeGameName(game)}
									className="p-2 rounded hover:bg-gray-700 relative group"
									aria-label="Change Name"
								>
									<Pencil className="w-5 h-5" />
								</button>
							</Tooltip>
							<Tooltip content="Go to dashboard">
								<button
									onClick={() => router.push(`/admin/${game.id}`)}
									className="p-2 rounded hover:bg-gray-700 relative group"
									aria-label="Go to Dashboard"
								>
									<ArrowRight className="w-5 h-5" />
								</button>
							</Tooltip>
						</div>
					</div>
				))}
				{QR_URL && (
					<div className="mt-4 flex justify-center">
						<QRCodeSVG value={QR_URL} size={200} />
					</div>
				)}
			</div>
		</div>
	);
}
