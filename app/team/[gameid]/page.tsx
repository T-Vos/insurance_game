import TeamGamePage from './TeamGame';

export default async function Page({
	params,
}: {
	params: Promise<{ gameid: string }>;
}) {
	const { gameid } = await params;

	return <TeamGamePage gameid={gameid} />;
}
