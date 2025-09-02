'use client';

import React from 'react';
import TeamGame from './TeamGame';

import { use } from 'react';

export default function TeamGamePage({
	params,
}: {
	params: Promise<{ gameid: string }>;
}) {
	const { gameid } = use(params);

	// We can now safely check the gameId directly.
	if (!gameid) {
		// The console logs will now show the correct values.
		console.log('GAME ID: ' + gameid);
		console.log('Params: ' + JSON.stringify(params));
		return <div>Invalid game code</div>;
	}

	return <TeamGame gameId={gameid} />;
}
