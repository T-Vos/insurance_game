'use client';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/config';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Game } from '@/lib/types';
import { generateUniqueGameKey } from '@/lib/generate_game_key';
import { ArrowRight, Paperclip, Pencil, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Tooltip from '@/components/tooltip';

export default function AdminDashboard() {
	const [games, setGames] = useState<Game[]>([]);
	const [loading, setLoading] = useState(true);
	const [userId, setUserId] = useState<string | null>(null);
	const [QR_URL, setQR_URL] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		if (process.env.NEXT_PUBLIC_DEVELOPMENT === 'TRUE') {
			console.log('Development mode detected. Showing all games.');
			setUserId('dev_admin_user_123');

			const fetchAllGames = async () => {
				setLoading(true);
				const gamesRef = collection(db, 'insurance_game');
				const snapshot = await getDocs(gamesRef);
				const fetchedGames: Game[] = snapshot.docs.map(
					(doc) => ({ id: doc.id, ...doc.data() } as Game)
				);
				setGames(fetchedGames);
				setLoading(false);
			};

			fetchAllGames();
			return;
		}

		const auth = getAuth();
		const currentUser = auth.currentUser;

		if (!currentUser) {
			alert('You must be logged in as admin');
			router.push('/login');
			return;
		}

		setUserId(currentUser.uid);

		const fetchGames = async () => {
			setLoading(true);
			const gamesRef = collection(db, 'insurance_game');
			const q = query(
				gamesRef,
				where('admin_user_ids', 'array-contains', currentUser.uid)
			);

			const snapshot = await getDocs(q);
			const fetchedGames: Game[] = snapshot.docs.map(
				(doc) => ({ id: doc.id, ...doc.data() } as Game)
			);
			setGames(fetchedGames);
			setLoading(false);
		};

		fetchGames();
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
