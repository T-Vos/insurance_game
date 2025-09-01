import React from 'react';
import GameControl from './gameControl';

export default async function Page({
	params,
}: {
	params: Promise<{ gameid: string }>;
}) {
	const { gameid } = await params;
	if (!gameid) return <div>Invalid game code</div>;
	return <GameControl key={'GameControl'} gameId={gameid} />;
}
