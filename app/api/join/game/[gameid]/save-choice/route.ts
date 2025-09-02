export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Team, TeamChoice } from '@/lib/types';

export async function POST(req: NextRequest) {
	try {
		const { gameId, teamId, roundId } = await req.json();
		if (!gameId || !teamId || !roundId) {
			return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
		}

		const gameRef = adminDb.collection('insurance_game').doc(gameId);
		const gameDoc = await gameRef.get();

		if (!gameDoc.exists) {
			return NextResponse.json({ error: 'Game not found' }, { status: 404 });
		}

		const gameData = gameDoc.data();
		if (!gameData?.teams) {
			return NextResponse.json({ error: 'No teams in game' }, { status: 400 });
		}

		const updatedTeams = gameData.teams.map((team: Team) => {
			if (team.id === teamId) {
				const updatedChoices = team.choices.map((c: TeamChoice) =>
					c.round_id === roundId ? { ...c, saved: true } : c
				);
				return { ...team, choices: updatedChoices };
			}
			return team;
		});
		console.log(
			'Attempting to update game:',
			gameId,
			'for team:',
			teamId,
			'and round:',
			roundId
		);
		console.log('Updated teams data:', JSON.stringify(updatedTeams));
		await gameRef.update({ teams: updatedTeams });
		console.log('Update successful');

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error('Error saving choice:', err);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
