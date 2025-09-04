import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { TeamChoice } from '@/lib/types';

export const runtime = 'nodejs';

const TEAMS_COLLECTION_NAME = 'teams';

export async function POST(req: NextRequest) {
	try {
		const { gameId, teamId, roundId } = await req.json();

		if (!gameId || !teamId || !roundId) {
			return NextResponse.json(
				{ error: 'Missing fields: gameId, teamId, or roundId' },
				{ status: 400 }
			);
		}

		const teamRef = adminDb
			.collection('insurance_game')
			.doc(gameId)
			.collection(TEAMS_COLLECTION_NAME)
			.doc(teamId);

		// Use a transaction for an atomic read-update-write operation
		await adminDb.runTransaction(async (transaction) => {
			const teamDoc = await transaction.get(teamRef);

			if (!teamDoc.exists) {
				throw new Error('Team not found');
			}

			const teamData = teamDoc.data();
			if (!teamData || !Array.isArray(teamData.choices)) {
				throw new Error('Team data or choices array is malformed');
			}

			const updatedChoices = teamData.choices.map((c: TeamChoice) => {
				if (c.round_id === roundId) {
					return { ...c, saved: true };
				}
				return c;
			});

			transaction.update(teamRef, { choices: updatedChoices });
		});

		return NextResponse.json({
			success: true,
			message: `Choice for round ${roundId} saved successfully for team ${teamId}.`,
		});
	} catch (err) {
		console.error('Error saving choice:', err);
		return NextResponse.json(
			{ error: `Internal server error: ${err}` },
			{ status: 500 }
		);
	}
}
