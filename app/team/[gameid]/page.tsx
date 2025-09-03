import TeamGamePage from './TeamGame';

export default async function Page({
	params,
}: {
	params: Promise<{ gameid: string }>;
}) {
	const { gameid } = await params;

	return (
		<main>
			<div className="py-3">
				<TeamGamePage gameid={gameid} />
			</div>
		</main>
	);
}
