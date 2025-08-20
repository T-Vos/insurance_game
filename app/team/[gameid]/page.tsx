'use client';
import TeamGame from './TeamGame';

export default function TeamGamePage({
	params,
}: {
	params: { gameId: string };
}) {
	const { gameId } = params;
	if (!gameId) return <div>Invalid game code</div>;
	return <TeamGame gameId={gameId} />;
}
