'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function JoinTeamPage() {
	const searchParams = useSearchParams();
	const [gameId, setGameId] = useState('');
	const [teamName, setTeamName] = useState('');
	const router = useRouter();

	useEffect(() => {
		const queryGameId = searchParams.get('gameId');
		if (queryGameId) {
			setGameId(queryGameId);
		}
	}, [searchParams]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Handle join logic here, e.g., call API or navigate
		alert(`Joining game ${gameId} as team "${teamName}"`);
		// Example: router.push(`/game/${gameId}/team/${teamName}`);
	};

	return (
		<main
			style={{
				maxWidth: 400,
				margin: '2rem auto',
				padding: 24,
				border: '1px solid #ddd',
				borderRadius: 8,
			}}
		>
			<h1>Join a Game</h1>
			<form
				onSubmit={handleSubmit}
				style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
			>
				<label>
					Game ID:
					<input
						type="text"
						value={gameId}
						onChange={(e) => setGameId(e.target.value)}
						placeholder="Enter Game ID"
						required
						style={{ width: '100%', padding: 8, marginTop: 4 }}
					/>
				</label>
				<label>
					Team Name:
					<input
						type="text"
						value={teamName}
						onChange={(e) => setTeamName(e.target.value)}
						placeholder="Enter Team Name"
						required
						style={{ width: '100%', padding: 8, marginTop: 4 }}
					/>
				</label>
				<button
					type="submit"
					style={{
						padding: 10,
						background: '#0070f3',
						color: '#fff',
						border: 'none',
						borderRadius: 4,
					}}
				>
					Join Game
				</button>
			</form>
		</main>
	);
}
