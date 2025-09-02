export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import * as admin from 'firebase-admin';

export async function POST(req: NextRequest) {
	console.log('Runtime:', process.env.NEXT_RUNTIME);
	try {
		const { gameCode, teamName } = await req.json();

		if (!gameCode || !teamName) {
			return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
		}

		const snapshot = await adminDb
			.collection('insurance_game')
			.where('key', '==', gameCode.toUpperCase())
			.get();

		if (snapshot.empty) {
			return NextResponse.json({ error: 'Game not found' }, { status: 404 });
		}

		const gameDoc = snapshot.docs[0];
		const gameId = gameDoc.id;
		const teamId = crypto.randomUUID();

		await gameDoc.ref.update({
			teams: admin.firestore.FieldValue.arrayUnion({
				id: teamId,
				teamName,
				choices: [],
				expected_profit_score: 0,
				liquidity_score: 0,
				solvency_score: 0,
				IT_score: 0,
				capacity_score: 0,
			}),
		});

		return NextResponse.json({ teamId, gameId });
	} catch (err) {
		console.error('Error in join API:', err);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
