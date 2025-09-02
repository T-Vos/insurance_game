import React from 'react';
import TeamGame from './TeamGame';

export default async function TeamGamePage({
	params,
}: {
	params: { gameId: string };
}) {
	const { gameId } = await params;

	if (!gameId) {
		console.log('GAME ID' + gameId);
		console.log('Paramas' + params);
		return <div>Invalid game code</div>;
	}

	return <TeamGame gameId={gameId} />;
}
