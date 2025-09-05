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

		const teamRef = adminDb
			.collection('insurance_game')
			.doc(gameId)
			.collection('teams')
			.doc(teamId);

		await adminDb.runTransaction(async (transaction) => {
			const teamDoc = await transaction.get(teamRef);

			if (!teamDoc.exists) {
				return NextResponse.json(
					{ error: 'Team document not found' },
					{ status: 404 }
				);
			}

			const teamData = teamDoc.data() as Team;

			const existingChoiceIndex = teamData.choices?.findIndex(
				(c: TeamChoice) => c.round_id === roundId
			);

			let updatedChoices;
			if (existingChoiceIndex !== -1) {
				updatedChoices = teamData.choices?.map((c: TeamChoice) =>
					c.round_id === roundId
						? { ...c, choice_id: choiceId, saved: false, roundIndex }
						: c
				);
			} else {
				updatedChoices = [
					...(teamData.choices ?? []),
					{
						round_id: roundId,
						choice_id: choiceId,
						roundIndex: roundIndex,
						saved: false,
					},
				];
			}

			transaction.update(teamRef, { choices: updatedChoices });
		});

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error('Error selecting choice:', err);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
