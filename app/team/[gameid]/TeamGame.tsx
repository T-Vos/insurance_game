'use client';
import { calculateScores } from '@/lib/calculateScores';
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
	Scores,
} from '@/lib/types';
import { useSelectChoice } from '@/app/hooks/useSelectChoice';
import { cardstyle } from '@/app/admin/[gameid]/components/styling';
import MessageBubble, { UIRevealMessage } from '@/components/messageBubble';
export default function TeamGame({ gameid: gameid }: { gameid: string }) {
	const [teamId, setTeamId] = useState<string | null>(null);
	const [memberId, setMemberId] = useState<string | null>(null); // NEW: State for memberId
	const [game, setGame] = useState<Game | null>(null);
	const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
	const [currentUserRole, setCurrentUserRole] = useState<roleType | null>(null);
	const [currentRound, setCurrentRound] = useState<Round | null>(null);
	const [currentRoundChoices, setCurrentRoundChoices] = useState<Choice[]>([]);
	const [choicesMadeDetails, setChoicesMadeDetails] = useState<Choice[]>([]);
	const [revealedMessages, setRevealedMessages] = useState<UIRevealMessage[]>(
		[]
	);
	const [recalculatedTeam, setRecalculatedTeam] = useState<Team | null>(null);
	const [allRounds, setAllRounds] = useState<Round[]>([]);
	const [allChoices, setAllChoices] = useState<Choice[]>([]);

	const [isBlocked, setIsBlocked] = useState<boolean>(false);
	const scoreTypes: (keyof Scores)[] = [
		'expected_profit_score',
		'liquidity_score',
		'solvency_score',
		'IT_score',
		'capacity_score',
	];
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
		const messages: UIRevealMessage[] = [];
		if (
			!game ||
			!currentRound ||
			!currentTeam ||
			!choicesMadeDetails ||
			!currentUserRole
		) {
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
						chosenItem.roundIndex + (reveal.revealedInRounds || 0) ===
						game.currentRoundIndex
				)
				.filter(
					(reveal) =>
						!reveal.revealdForRoles ||
						reveal.revealdForRoles.length === 0 ||
						reveal.revealdForRoles.some((x) => x === currentUserRole)
				)
				.map((revealMessage) => ({
					...revealMessage,
					time: `${time.getHours()}:${time.getMinutes()}`,
				}));

			messages.push(...newMessages);
		}

		for (const scoreKey of scoreTypes) {
			if (!recalculatedTeam) break;
			const criticalValue = game[`critical_${scoreKey}` as keyof Game] as
				| number
				| undefined;

			const currentValue = recalculatedTeam[scoreKey];
			const criticalText = game[`critical_${scoreKey}_text` as keyof Game] as
				| string
				| undefined;

			if (criticalValue && currentValue <= criticalValue) {
				const time = new Date();
				messages.push({
					text: criticalText ?? `Critical ${scoreKey.replace('_score', '')}`,
					sent: false,
					message_sender_image: '/portrait.jpg',
					revealedInRounds: 0,
					id: 'Score warning',
					message_sender: 'Finance',
					time: `${time.getHours()} : ${time.getMinutes()}`,
				});
			}
		}

		if (currentRound.round_show_scores) {
			const time = new Date();
			messages.push({
				text: (
					<div className="p-3 bg-gray-50 rounded-xl shadow-sm text-sm">
						<h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
							📊 De halfjaar cijfers zijn bekend
						</h4>
						<ul className="space-y-1 text-gray-700">
							<li className="flex justify-between">
								<span>Winst</span>
								<span className="font-medium text-blue-600">
									{recalculatedTeam?.expected_profit_score ?? ''}
								</span>
							</li>
							<li className="flex justify-between">
								<span>Liquiditeit</span>
								<span className="font-medium text-blue-600">
									{recalculatedTeam?.liquidity_score}
								</span>
							</li>
							<li className="flex justify-between">
								<span>Solvabiliteit</span>
								<span className="font-medium text-blue-600">
									{recalculatedTeam?.solvency_score}
								</span>
							</li>
							<li className="flex justify-between">
								<span>IT</span>
								<span className="font-medium text-blue-600">
									{recalculatedTeam?.IT_score}
								</span>
							</li>
							<li className="flex justify-between">
								<span>Capaciteit</span>
								<span className="font-medium text-blue-600">
									{recalculatedTeam?.capacity_score}
								</span>
							</li>
						</ul>
					</div>
				),
				sent: currentUserRole === 'CFO',
				message_sender_image: '/portrait.jpg',
				revealedInRounds: 0,
				id: 'Score',
				message_sender: 'Finance',
				time: `${time.getHours()} : ${time.getMinutes()}`,
			});
		}

		setRevealedMessages(messages);
	}, [game, currentTeam, choicesMadeDetails, currentUserRole, currentRound]);

	useEffect(() => {
		if (!gameid) return;

		// Listen to all rounds
		const roundsRef = collection(db, 'insurance_game', gameid, 'rounds');
		const unsubscribeRounds = onSnapshot(roundsRef, (snapshot) => {
			setAllRounds(snapshot.docs.map((doc) => doc.data() as Round));
		});

		// Listen to all choices
		const choicesRef = collection(db, 'insurance_game', gameid, 'choices');
		const unsubscribeChoices = onSnapshot(choicesRef, (snapshot) => {
			setAllChoices(snapshot.docs.map((doc) => doc.data() as Choice));
		});

		return () => {
			unsubscribeRounds();
			unsubscribeChoices();
		};
	}, [gameid]);

	useEffect(() => {
		if (
			!game ||
			!currentTeam ||
			allRounds.length === 0 ||
			allChoices.length === 0
		) {
			setRecalculatedTeam(null);
			return;
		}

		const teams = [currentTeam]; // we only care about this one here
		const newTeams = calculateScores(
			game,
			teams,
			allRounds,
			allChoices,
			game.currentRoundIndex
		);

		setRecalculatedTeam(newTeams[0]);
	}, [game, currentTeam, allRounds, allChoices]);

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
					<div className="w-full flex flex-row justify-between mt-3">
						<h5 className="font-light">Jouw rol: {currentUserRole}</h5>
						<h5 className="font-light">Team: {currentTeam.teamName}</h5>
					</div>
					{recalculatedTeam?.expected_profit_score ?? '...'}
				</div>

				{revealedMessages.map((msg, index) => (
					<MessageBubble
						key={index}
						name={msg.message_sender}
						time={msg.time ?? ''}
						text={msg.text}
						image={msg.message_sender_image ?? '/portrait.jpg'}
						sent={msg.sent ?? false}
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
