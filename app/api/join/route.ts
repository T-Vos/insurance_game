// app/api/join/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import * as admin from 'firebase-admin';
import { Team, TeamMembers } from '@/lib/types';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
	console.log('Runtime:', process.env.NEXT_RUNTIME);
	try {
		const { gameCode, teamCode, userName, role } = await req.json();
		console.log(gameCode, teamCode, userName, role);

		if (!gameCode || !teamCode || !userName || !role) {
			return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
		}

		// 1. Find the game document
		const gameSnapshot = await adminDb
			.collection('insurance_game')
			.where('key', '==', gameCode.toUpperCase())
			.get();

		if (gameSnapshot.empty) {
			return NextResponse.json({ error: 'Game not found' }, { status: 404 });
		}

		const gameDoc = gameSnapshot.docs[0];
		const gameId = gameDoc.id;

		// 2. Find the team document using the teamCode
		const teamSnapshot = await gameDoc.ref
			.collection('teams')
			.where('team_code', '==', teamCode.toUpperCase())
			.limit(1)
			.get();

		if (teamSnapshot.empty) {
			return NextResponse.json({ error: 'Team not found' }, { status: 404 });
		}

		const teamDoc = teamSnapshot.docs[0];
		const teamId = teamDoc.id;
		const teamData = teamDoc.data() as Team;

		// 3. Check if the role is already taken
		const roleIsTaken =
			(teamData.members &&
				teamData.members.length > 0 &&
				teamData.members.some((member: TeamMembers) => member.role === role)) ||
			false;

		if (roleIsTaken) {
			return NextResponse.json(
				{ error: `The role "${role}" is already taken.` },
				{ status: 409 }
			);
		}

		// 4. Create the new member object
		const newMember: TeamMembers = {
			id: crypto.randomUUID(),
			role,
			role_code: role.toUpperCase().substring(0, 3), // Optional: Generate role code
			name: userName,
		};

		// 5. Add the new member to the team's 'members' array
		await teamDoc.ref.update({
			members: admin.firestore.FieldValue.arrayUnion(newMember),
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
