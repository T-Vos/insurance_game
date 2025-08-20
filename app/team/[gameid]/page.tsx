import { db } from '@/lib/config';
import { doc, getDoc } from 'firebase/firestore';

export default async function TeamGamePage({
	params,
}: {
	params: { gameId: string };
}) {
	const gameRef = doc(db, 'games', params.gameId);
	const gameSnap = await getDoc(gameRef);

	if (!gameSnap.exists()) return <div>Game not found</div>;
	const game = gameSnap.data();

	return (
		<div className="p-6">
			<h1 className="text-xl font-bold">Game: {game.name}</h1>
			<p>Current Round: {game.currentRoundIndex + 1}</p>
			{/* Here you’d render questions/rounds for the team */}
		</div>
	);
}
