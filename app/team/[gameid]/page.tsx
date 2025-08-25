import React from 'react';
import TeamGame from './TeamGame';

export default async function TeamGamePage({
	params,
}: {
	params: Promise<{ gameId: string }>;
}) {
	const { gameId } = await params;
	if (!gameId) return <div>Invalid game code</div>;
	return <TeamGame gameId={gameId} />;
}
