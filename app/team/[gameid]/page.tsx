import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/config';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

type Props = {
	params: { gameid: string };
};

export default async function TeamPage({ params }: Props) {
	const { gameid } = params;
	const auth = getAuth(app);
	const db = getFirestore(app);

	// Get user from session cookie (Next.js server component)
	const sessionCookie = cookies().get('__session')?.value;
	if (!sessionCookie) {
		redirect('/login');
	}

	// Verify session cookie with Firebase Admin SDK (pseudo, needs server action)
	// Here, you would verify the session and get the userId
	// For demo, assume userId is extracted from session
	const userId = 'demoUserId'; // Replace with real verification

	// Fetch user's team
	const userDoc = await getDoc(doc(db, 'users', userId));
	if (!userDoc.exists()) {
		redirect('/login');
	}
	const userData = userDoc.data();
	const teamId = userData?.teamId;
	if (!teamId) {
		redirect('/join-team');
	}

	// Fetch team and check if participating in the round
	const teamDoc = await getDoc(doc(db, 'teams', teamId));
	if (!teamDoc.exists()) {
		redirect('/join-team');
	}
	const teamData = teamDoc.data();
	const participatingGames: string[] = teamData?.participatingGames || [];
	if (!participatingGames.includes(gameid)) {
		redirect('/not-participating');
	}

	// Fetch round/game info if needed
	const gameDoc = await getDoc(doc(db, 'games', gameid));
	if (!gameDoc.exists()) {
		redirect('/not-found');
	}
	const gameData = gameDoc.data();

	return (
		<main>
			<h1>Welcome, {userData?.displayName || 'Team Member'}</h1>
			<h2>Team: {teamData?.name}</h2>
			<h3>Participating in Game: {gameData?.name || gameid}</h3>
			{/* Add more UI here */}
		</main>
	);
}
