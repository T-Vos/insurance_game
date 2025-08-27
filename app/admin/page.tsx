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
import Link from 'next/link';
export default function AdminDashboard() {
	const [games, setGames] = useState<Game[]>([]);
	const [loading, setLoading] = useState(true);
	const [userId, setUserId] = useState<string | null>(null);
	const [QR_URL, setQR_URL] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		const auth = getAuth();
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				setUserId(user.uid);
				setLoading(true);
				try {
					const gamesRef = collection(db, 'insurance_game');
					const q = query(
						gamesRef,
						where('admin_user_ids', 'array-contains', user.uid)
					);
					const snapshot = await getDocs(q);
					const fetchedGames: Game[] = snapshot.docs.map(
						(doc) => ({ id: doc.id, ...doc.data() } as Game)
					);
					setGames(fetchedGames);
				} catch (error) {
					console.error('Failed to fetch games:', error);
				} finally {
					setLoading(false);
				}
			} else {
				console.error('No user session found. Redirecting...');
				setLoading(false);
				router.push('/admin/login');
			}
		});

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

	const button_class =
		'inline-flex items-center justify-center p-2 rounded hover:bg-gray-700 relative group cursor-pointer focus:outline-none';

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

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{games.map((game) => (
					<div
						key={game.id}
						className="bg-gray-800 flex flex-col justify-between lg:flex-row lg:items-center p-4 rounded-xl transition"
					>
						<div>
							<h2 className="font-bold text-xl">{game.name}</h2>
							<p className="text-sm text-gray-400">Key: {game.key}</p>
						</div>
						<div className="flex justify-end gap-2 mt-4">
							<Tooltip content="Share QR Code">
								<button
									onClick={() =>
										setQR_URL(
											`${window.location.origin}/team/join?code=${game.key}`
										)
									}
									className={button_class}
									aria-label="Share QR Code"
								>
									<QrCode className="w-5 h-5" />
								</button>
							</Tooltip>
							<Tooltip content="Copy rule set">
								<button
									onClick={() => copyRuleSet(game)}
									className={button_class}
									aria-label="Copy Rule Set"
								>
									<Paperclip className="w-5 h-5" />
								</button>
							</Tooltip>
							<Tooltip content="Change name">
								<button
									onClick={() => changeGameName(game)}
									className={button_class}
									aria-label="Change Name"
								>
									<Pencil className="w-5 h-5" />
								</button>
							</Tooltip>
							<Tooltip content="Go to dashboard">
								<Link
									href={`/admin/${game.id}`}
									className={button_class}
									aria-label="Go to Dashboard"
								>
									<ArrowRight className="w-5 h-5" />
								</Link>
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
