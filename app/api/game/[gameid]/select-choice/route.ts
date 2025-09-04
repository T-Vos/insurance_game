export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Team, TeamChoice } from '@/lib/types';

export async function POST(req: NextRequest) {
	try {
		console.log('Start save');
		const { gameId, teamId, roundId, choiceId, roundIndex } = await req.json();
		console.log(gameId, teamId, roundId, choiceId, roundIndex);
		if (
			!gameId ||
			!teamId ||
			!roundId ||
			!choiceId ||
			roundIndex === undefined
		) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
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
				// Find if a choice for this round already exists
				const existingChoiceIndex = team.choices?.findIndex(
					(c: TeamChoice) => c.round_id === roundId
				);

				let updatedChoices;
				if (!existingChoiceIndex || existingChoiceIndex > -1) {
					// Update existing choice
					updatedChoices = team.choices?.map((c: TeamChoice) =>
						c.round_id === roundId
							? { ...c, choice_id: choiceId, saved: false, roundIndex }
							: c
					);
				} else {
					updatedChoices = [
						...(team.choices ?? []),
						{
							round_id: roundId,
							choice_id: choiceId,
							roundIndex: roundIndex,
							saved: false,
						},
					];
				}

				return { ...team, choices: updatedChoices };
			}
			return team;
		});

		await gameRef.update({ teams: updatedTeams });

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error('Error selecting choice:', err);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
