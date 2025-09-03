import React from 'react';
import GameAdmin from './gameAdmin';

export default async function Page({
	params,
}: {
	params: Promise<{ gameid: string }>;
}) {
	const { gameid } = await params;
	if (!gameid) return <div>Invalid game code</div>;
	return <GameAdmin key={'GameControl'} gameId={gameid} />;
}
