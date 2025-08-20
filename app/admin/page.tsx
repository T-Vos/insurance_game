'use client';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/config';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Game } from '@/lib/types';

export default function AdminDashboard() {
	const [games, setGames] = useState<Game[]>([]);
	const [loading, setLoading] = useState(true);
	const [userId, setUserId] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		const auth = getAuth();
		const currentUser = auth.currentUser;

		if (!currentUser) {
			alert('You must be logged in as admin');
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
	}, []);

	const handleCreateGame = async () => {
		if (!userId) return;

		const name = prompt('Enter new game name');
		if (!name) return;

		const newGame = {
			name,
			key: `G-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
			rounds: [],
			teams: [],
			admin_user_ids: [userId],
		};

		const gamesRef = collection(db, 'insurance_game');
		const docRef = await addDoc(gamesRef, newGame);

		router.push(`/admin/${docRef.id}`);
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

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{games.map((game) => (
					<div
						key={game.id}
						className="bg-gray-800 p-4 rounded-xl cursor-pointer hover:bg-gray-700 transition"
						onClick={() => router.push(`/admin/${game.id}`)}
					>
						<h2 className="font-bold text-xl">{game.name}</h2>
						<p className="text-sm text-gray-400">Key: {game.key}</p>
					</div>
				))}
			</div>
		</div>
	);
}
