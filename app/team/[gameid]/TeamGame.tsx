'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import {
	collection,
	doc,
	getDoc,
	getDocs,
	onSnapshot,
	query,
	where,
} from 'firebase/firestore';
import { getTeamSession } from '@/lib/session';
import TeamBoard from '@/components/TeamBoard';
import {
	TeamChoice,
	Game,
	Round,
	Team,
	RevealMessage,
	Choice,
	roleType,
} from '@/lib/types';
import { useSelectChoice } from '@/app/hooks/useSelectChoice';
import { cardstyle } from '@/app/admin/[gameid]/components/styling';
import MessageBubble from '@/components/messageBubble';
export default function TeamGame({ gameid: gameid }: { gameid: string }) {
	const [teamId, setTeamId] = useState<string | null>(null);
	const [memberId, setMemberId] = useState<string | null>(null); // NEW: State for memberId
	const [game, setGame] = useState<Game | null>(null);
	const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
	const [currentUserRole, setCurrentUserRole] = useState<roleType | null>(null);
	const [currentRound, setCurrentRound] = useState<Round | null>(null);
	const [currentRoundChoices, setCurrentRoundChoices] = useState<Choice[]>([]);
	const [choicesMadeDetails, setChoicesMadeDetails] = useState<Choice[]>([]);
	const [revealedMessages, setRevealedMessages] = useState<RevealMessage[]>([]);
	const [isBlocked, setIsBlocked] = useState<boolean>(false);

	useEffect(() => {
		const getTeamSession = () => {
			const cookies = document.cookie
				.split('; ')
				.find((row) => row.startsWith('teamSession='));
			if (!cookies) return null;
			try {
				return JSON.parse(cookies.split('=')[1]);
			} catch (e) {
				return null;
			}
		};
		const session = getTeamSession();
		if (!session?.teamId || !session?.memberId) {
			alert('You are not logged in as a team. Please join the game first.');
			return;
		}
		setTeamId(session.teamId);
		setMemberId(session.memberId);
	}, []);

	useEffect(() => {
		if (!gameid || !teamId) return;

		// Game listener
		const unsubscribeGame = onSnapshot(
			doc(db, 'insurance_game', gameid),
			(snapshot) => {
				if (snapshot.exists()) setGame(snapshot.data() as Game);
				else setGame(null);
			}
		);

		// Team listener
		const unsubscribeTeam = onSnapshot(
			doc(db, 'insurance_game', gameid, 'teams', teamId),
			(snapshot) => {
				if (snapshot.exists()) setCurrentTeam(snapshot.data() as Team);
				else setCurrentTeam(null);
			}
		);

		return () => {
			unsubscribeGame();
			unsubscribeTeam();
		};
	}, [gameid, teamId]);
	useEffect(() => {
		if (!currentTeam || !memberId || !currentTeam.members) return;
		const currentUser = currentTeam.members.find(
			(member) => member.id === memberId
		);
		setCurrentUserRole(currentUser?.role || null);
	}, [currentTeam, memberId]);
	useEffect(() => {
		if (!game || !game.currentRoundId) return;
		const currentRoundId = game.currentRoundId;

		const roundRef = doc(
			db,
			'insurance_game',
			game.id,
			'rounds',
			currentRoundId?.toString()
		);
		const unsubscribeRound = onSnapshot(roundRef, (snapshot) => {
			if (snapshot.exists()) {
				const roundData = snapshot.data() as Round;
				setCurrentRound(roundData);

				// This is the correct way to get choices for a round with a single query
				const choicesRef = collection(db, 'insurance_game', game.id, 'choices');
				const choicesQuery = query(
					choicesRef,
					where('round_id', '==', roundData.round_id)
				);
				getDocs(choicesQuery).then((choicesSnapshot) => {
					const choices = choicesSnapshot.docs.map(
						(doc) => doc.data() as Choice
					);
					setCurrentRoundChoices(choices);
				});
			} else {
				setCurrentRound(null);
				setCurrentRoundChoices([]);
			}
		});
		return () => unsubscribeRound();
	}, [game]);

	useEffect(() => {
		if (
			!currentTeam ||
			!currentTeam.choices ||
			currentTeam.choices.length === 0
		) {
			setChoicesMadeDetails([]);
			return;
		}
		const fetchChoiceDetails = async () => {
			const choiceIds = currentTeam?.choices?.map((c) => c.choice_id) ?? [];
			const choiceDocs = await getDocs(
				query(
					collection(db, `insurance_game/${gameid}/choices`),
					where('id', 'in', choiceIds)
				)
			);
			const fetchedChoices = choiceDocs.docs.map((doc) => doc.data() as Choice);
			setChoicesMadeDetails(fetchedChoices);
		};
		fetchChoiceDetails();
	}, [currentTeam, gameid]);

	useEffect(() => {
		const messages: RevealMessage[] = [];
		if (!game || !currentTeam || !choicesMadeDetails || !currentUserRole) {
			setRevealedMessages([]);
			return;
		}

		for (const chosenItem of currentTeam.choices ?? []) {
			const originalChoice = choicesMadeDetails.find(
				(c) => c.id === chosenItem.choice_id
			);
			if (!originalChoice?.reveals) continue;

			const time = new Date();
			const newMessages = originalChoice.reveals
				.filter(
					(reveal) =>
						chosenItem.roundIndex + reveal.revealedInRounds ===
						game.currentRoundIndex
				)
				.filter(
					(reveal) =>
						!reveal.revealdForRoles ||
						reveal.revealdForRoles.some((x) => x === currentUserRole)
				)
				.map((revealMessage) => ({
					...revealMessage,
					time: `${time.getHours()} : ${time.getMinutes()}`,
				}));

			messages.push(...newMessages);
		}
		setRevealedMessages(messages);
	}, [game, currentTeam, choicesMadeDetails, currentUserRole]);

	const handleSaveChoice = async (
		teamId: Team['id'],
		roundId: Round['round_id']
	) => {
		const res = await fetch(`/api/game/${gameid}/save-choice`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ gameId: gameid, teamId, roundId }),
		});

		const data = await res.json();
		if (!res.ok) {
			alert(data.error || 'Failed to save choice');
		}
	};
	const { handleSelectChoice } = useSelectChoice(game);

	if (!teamId) return <div>Loading.</div>;
	if (!game) return <div>Loading..</div>;
	if (!currentTeam) return <div>Loading...</div>;
	if (!currentRound) return <div>Loading....</div>;
	if (!currentRoundChoices) return <div>Loading.......</div>;

	return (
		<div className="flex items-center justify-center flex-col min-h-screen px-4">
			<div className="w-full max-w-md space-y-6 mb-3">
				<div className={cardstyle}>
					<h3 className="font-semibold mt-3">{currentRound.round_name}</h3>
				</div>

				{revealedMessages.map((msg, index) => (
					<MessageBubble
						key={index}
						name={msg.message_sender}
						time={msg.time}
						text={msg.text}
						image={'/portrait.jpg'}
						// image={msg.message_sender_image?.toString() ?? './portrait.jpg'}
						sent={false}
					/>
				))}

				<div className={cardstyle}>
					{currentRound.round_started_at ? (
						<TeamBoard
							team={currentTeam}
							currentRound={currentRound}
							currentRoundchoices={currentRoundChoices}
							handleSelectChoice={(...args) =>
								handleSelectChoice(game.id, ...args)
							}
							handleSaveChoice={(teamId, roundId) =>
								handleSaveChoice(teamId, roundId)
							}
							disabled={isBlocked}
						/>
					) : (
						<div className="text-center animate-pulse text-gray-600">
							⏳ Wacht tot de ronde gestart wordt
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
