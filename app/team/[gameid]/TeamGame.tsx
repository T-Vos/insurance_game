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
	const [game, setGame] = useState<Game | null>(null);
	const [currentRound, setCurrentRound] = useState<Round | null>(null);
	const [currentRoundChoices, setCurrentRoundChoices] = useState<Choice[]>([]);
	const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
	const [revealedMessages, setRevealedMessages] = useState<RevealMessage[]>([]);
	const [teamId, setTeamId] = useState<string | null>(null);
	const [isBlocked, setIsBlocked] = useState<boolean>(false);
	const [choicesMadeDetails, setChoicesMadeDetails] = useState<Choice[]>([]);
	const { handleSelectChoice } = useSelectChoice(game);
	const [currentUserRole, setCurrentUserRole] = useState<roleType | null>(null);

	useEffect(() => {
		if (!gameid || !teamId) return;
		const session = getTeamSession();
		if (!session) {
			alert('You are not logged in as a team. Please join the game first.');
			return;
		}
		console.log(session);
		if (!session?.memberId || !session?.teamId) return;
		setTeamId(session.teamId);
		setCurrentUserRole(session.role || 'CEO');

		const gameRef = doc(db, 'insurance_game', gameid);
		const unsubscribeGame = onSnapshot(gameRef, (snapshot) => {
			if (snapshot.exists()) setGame(snapshot.data() as Game);
			else setGame(null);
		});

		const teamRef = doc(db, 'insurance_game', gameid, 'teams', teamId);
		const unsubscribeTeam = onSnapshot(teamRef, (snapshot) => {
			if (snapshot.exists()) setCurrentTeam(snapshot.data() as Team);
			else setCurrentTeam(null);
		});

		return () => {
			unsubscribeGame();
			unsubscribeTeam();
		};
	}, [gameid]);

	useEffect(() => {
		if (!game) return;
		const currentRoundId = `round_${game.currentRoundIndex}`;
		const roundRef = doc(
			db,
			'insurance_game',
			game.id,
			'rounds',
			currentRoundId
		);
		const unsubscribeRound = onSnapshot(roundRef, (snapshot) => {
			if (snapshot.exists()) {
				const roundData = snapshot.data() as Round;
				setCurrentRound(roundData);
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
			if (!currentTeam.choices) {
				setChoicesMadeDetails([]);
				return;
			}
			const fetchPromises = currentTeam.choices.map(async (teamChoice) => {
				const choiceRef = doc(
					db,
					'insurance_game',
					gameid,
					'choices',
					teamChoice.choice_id
				);
				const choiceDoc = await getDoc(choiceRef);
				return choiceDoc.exists() ? (choiceDoc.data() as Choice) : null;
			});

			const fetchedChoices = await Promise.all(fetchPromises);

			setChoicesMadeDetails(fetchedChoices.filter(Boolean) as Choice[]);
		};

		fetchChoiceDetails();
	}, [currentTeam, gameid]);

	useEffect(() => {
		if (!currentTeam || !game || !choicesMadeDetails || !currentTeam.choices) {
			setRevealedMessages([]);
			return;
		}
		const messages: RevealMessage[] = [];
		for (const chosenItem of currentTeam.choices) {
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
						reveal.revealdForRoles.some((x) => x == currentUserRole)
				)
				.map((revealMessage) => ({
					...revealMessage,
					time: `${time.getHours()} : ${time.getMinutes()}`,
				}));
			messages.push(...newMessages);
		}
		setRevealedMessages(messages);
	}, [game, currentTeam, choicesMadeDetails]);

	useEffect(() => {
		if (!game || !currentTeam || !choicesMadeDetails || !currentTeam.choices) {
			setIsBlocked(false);
			return;
		}

		const lastTeamChoice = currentTeam.choices[currentTeam.choices.length - 1];
		if (!lastTeamChoice) {
			setIsBlocked(false);
			return;
		}

		const choiceDetails = choicesMadeDetails.find(
			(c) => c.id === lastTeamChoice.choice_id
		);
		if (choiceDetails?.duration && choiceDetails.duration > 0) {
			const roundsSinceChoice =
				game.currentRoundIndex - lastTeamChoice.roundIndex;
			if (roundsSinceChoice < choiceDetails.duration) {
				setIsBlocked(true);
			} else {
				setIsBlocked(false);
			}
		} else {
			setIsBlocked(false);
		}
	}, [game, currentTeam, choicesMadeDetails]);

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

	if (
		!teamId ||
		!game ||
		!currentTeam ||
		!currentRound ||
		!currentRoundChoices
	) {
		return <div>Loading...</div>;
	}

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
