import TeamGame from './client';

export default function TeamGamePage({
	params,
}: {
	params: { gameId?: string };
}) {
	const _GAMEID = params.gameId;
	if (!_GAMEID) return <div>Invalid game code</div>;
	return <TeamGame gameId={_GAMEID} />;
}
