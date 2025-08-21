'use client';
import React, { useEffect, useState } from 'react';
import { LucideRefreshCw } from 'lucide-react';
import { PageState, Game, Team, Round, Choice, ChosenItem } from '@/lib/types';
import GameRounds from '../components/GameRounds';
import GameConfig from '../components/GameConfig';
import RevealedInfo from '../components/RevealedInfo';
import TeamsConfig from '../components/teamsConfig';
import ConfirmationModal from '../components/ConfirmationModal';

// Firebase imports
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, Auth } from 'firebase/auth';
import { db, app } from '@/lib/config';

const App = () => {
	const [auth, setAuth] = useState<Auth | null>(null);
	const [userId, setUserId] = useState<string | null>(null);

	const [gameData, setGameData] = useState<Game | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [showResetModal, setShowResetModal] = useState<boolean>(false);

	// State for local UI
	const [pageState, setPageState] = useState<PageState>(PageState.ROUNDS);

	const teams = gameData?.teams || [];
	const roundChoices = gameData?.rounds || [];
	const currentRoundIndex = gameData?.currentRoundIndex || 0;

	const GAME_ID = 'GeopoliticalShock2025';
	const gameDocPath = `insurance_game/${GAME_ID}`;

	const initialBaseCapacity = 7;

	const calculateScores = (
		teams: Team[],
		rounds: Round[],
		roundIndex: number
	) => {
		const roundCapacityBonus = roundIndex * 2;

		// This helper function finds a choice by its round ID and choice ID
		const findChoice = (roundId: string, choiceId: string) => {
			const round = rounds.find((r) => r.round_id === roundId);
			return round?.choices.find((c) => c.id === choiceId);
		};

		return teams.map((team) => {
			const newTeam = { ...team };

			let expected_profit_score = 0;
			let liquidity_score = 0;
			let solvency_score = 0;
			let IT_score = 0;
			let capacity_score_used = 0;

			// First, calculate base scores and used capacity
			newTeam.choices.forEach((chosenItem) => {
				const choice = findChoice(chosenItem.round_id, chosenItem.choice_id);
				if (choice) {
					expected_profit_score += choice.expected_profit_score;
					liquidity_score += choice.liquidity_score;
					solvency_score += choice.solvency_score;
					IT_score += choice.IT_score;

					const isActive =
						roundIndex >= chosenItem.roundIndex &&
						(choice.duration === null ||
							roundIndex < chosenItem.roundIndex + choice.duration);
					if (isActive) {
						capacity_score_used += choice.capacity_score;
					}
				}
			});

			// Second, apply interaction effects
			newTeam.choices.forEach((chosenItem) => {
				const choice = findChoice(chosenItem.round_id, chosenItem.choice_id);
				if (choice && choice.interactionEffects) {
					choice.interactionEffects.forEach((effect) => {
						const hasTargetChoice = newTeam.choices.some(
							(c) =>
								c.choice_id === effect.targetChoiceId &&
								c.round_id === effect.roundId
						);
						if (hasTargetChoice) {
							expected_profit_score += effect.bonusScore;
						}
					});
				}
			});

			// Update the newTeam object with the calculated scores
			newTeam.expected_profit_score = expected_profit_score;
			newTeam.liquidity_score = liquidity_score;
			newTeam.solvency_score = solvency_score;
			newTeam.IT_score = IT_score;
			newTeam.capacity_score =
				initialBaseCapacity + roundCapacityBonus - capacity_score_used;

			return newTeam;
		});
	};

	const initialGameData: Game = {
		id: 'GeopoliticalShock2025',
		key: 'DNB_2025_R1',
		name: 'Insurance Simulation',
		rounds: [
			{
				round_id: 'round_1',
				round_duration: 3600,
				round_started_at: null,
				round_finished_at: null,
				round_index: 0,
				round_name: 'Round 1: Initial Investments',
				choices: [
					{
						id: '1',
						description: 'Investeer in onderzoek',
						expected_profit_score: -10,
						liquidity_score: 5,
						solvency_score: 2,
						IT_score: -1,
						capacity_score: 4,
						duration: 1,
						reveals: [
							{
								text: 'Onderzoek toont aan dat er een nieuwe technologie op de markt komt die de productiekosten aanzienlijk verlaagt.',
								revealedInRounds: 1,
							},
							{
								text: 'De technologie heeft een onverwachte bijwerking, wat leidt tot vertragingen in de implementatie.',
								revealedInRounds: 2,
							},
						],
						interactionEffects: [
							{ targetChoiceId: '2', roundId: 'round_2', bonusScore: 25 },
						],
					},
					{
						id: '2',
						description: 'Update bedrijfsmodellen',
						expected_profit_score: 20,
						liquidity_score: -5,
						solvency_score: 1,
						IT_score: 3,
						capacity_score: 2,
						duration: 2,
						reveals: [
							{
								text: 'De geüpdate modellen zijn zeer efficiënt en verhogen de inkomsten.',
								revealedInRounds: 2,
							},
							{
								text: 'Concurrenten hebben uw nieuwe model snel gekopieerd, wat de winstmarges doet dalen.',
								revealedInRounds: 3,
							},
						],
						interactionEffects: [],
					},
					{
						id: '3',
						description: 'Onderzoek China',
						expected_profit_score: 30,
						liquidity_score: -2,
						solvency_score: 0,
						IT_score: 0,
						capacity_score: 2,
						duration: 1,
						reveals: [
							{
								text: 'Onderzoek toont een grote, onontdekte markt in China met hoge winstkansen.',
								revealedInRounds: 1,
							},
						],
						interactionEffects: [],
					},
				],
			},
			{
				round_id: 'round_2',
				round_duration: 3600,
				round_started_at: null,
				round_finished_at: null,
				round_index: 1,
				round_name: 'Round 2: Market Expansion',
				choices: [
					{
						id: '1',
						description: 'Breid uit naar Europa',
						expected_profit_score: 15,
						liquidity_score: 10,
						solvency_score: 3,
						IT_score: 2,
						capacity_score: 3,
						duration: 1,
						reveals: [],
						interactionEffects: [],
					},
					{
						id: '2',
						description: 'Focus op binnenlandse markt',
						expected_profit_score: 10,
						liquidity_score: 5,
						solvency_score: 1,
						IT_score: 1,
						capacity_score: 5,
						duration: 1,
						reveals: [],
						interactionEffects: [],
					},
					{
						id: '3',
						description: 'Verwerf een concurrent',
						expected_profit_score: 40,
						liquidity_score: -15,
						solvency_score: 5,
						IT_score: 4,
						capacity_score: 1,
						duration: 1,
						reveals: [],
						interactionEffects: [],
					},
				],
			},
			{
				round_id: 'round_3',
				round_duration: 3600,
				round_started_at: null,
				round_finished_at: null,
				round_index: 2,
				round_name: 'Round 3: Vervolg',
				choices: [
					{
						id: '1',
						description: 'Breid uit naar Europa',
						expected_profit_score: 15,
						liquidity_score: 10,
						solvency_score: 3,
						IT_score: 2,
						capacity_score: 3,
						duration: 1,
						reveals: [],
						interactionEffects: [],
					},
					{
						id: '2',
						description: 'Focus op binnenlandse markt',
						expected_profit_score: 10,
						liquidity_score: 5,
						solvency_score: 1,
						IT_score: 1,
						capacity_score: 5,
						duration: 1,
						reveals: [],
						interactionEffects: [],
					},
				],
			},
		],
		teams: [
			{
				id: 'team_1',
				teamName: 'Verzekerbaars',
				choices: [],
				expected_profit_score: 0,
				liquidity_score: 0,
				solvency_score: 0,
				IT_score: 0,
				capacity_score: 7,
			},
			{
				id: 'team_2',
				teamName: 'Financieel Fijntjes',
				choices: [],
				expected_profit_score: 0,
				liquidity_score: 0,
				solvency_score: 0,
				IT_score: 0,
				capacity_score: 7,
			},
		],
		currentRoundIndex: 0,
		currentRoundId: 'round_1',
		gameStartedAt: null,
		gameFinishedAt: null,
		createdAt: Date.now(),
	};

	useEffect(() => {
		const initAuth = async () => {
			// Check for the development environment variable
			if (process.env.NEXT_PUBLIC_DEVELOPMENT === 'TRUE') {
				console.log('Development mode detected. Skipping Firebase auth.');
				// Set a fake user ID for development
				setUserId('dev_user_123');
				setLoading(false); // Make sure to set loading to false
				return; // Exit the function to prevent Firebase auth
			}

			// Production/normal auth flow
			try {
				console.log('Initializing Firebase auth...');
				const authInstance = getAuth(app);
				await signInAnonymously(authInstance);
				setAuth(authInstance);
				setUserId(authInstance.currentUser?.uid || 'anonymous');
			} catch (error) {
				console.error('Firebase auth failed:', error);
			} finally {
				setLoading(false);
			}
		};
		initAuth();
	}, []);

	useEffect(() => {
		if (!db) return;

		const gameDocRef = doc(db, gameDocPath);

		const unsubscribe = onSnapshot(
			gameDocRef,
			async (snapshot) => {
				if (snapshot.exists()) {
					console.log('Game doc exists, fetching data...');
					setGameData(snapshot.data() as Game);
				} else {
					console.log('Game doc missing, creating initial...');
					await setDoc(gameDocRef, initialGameData);
				}
				setLoading(false);
			},
			(error) => {
				console.error('Failed to fetch game data:', error);
				setLoading(false);
			}
		);

		return () => unsubscribe();
	}, [db, gameDocPath]);

	const handleSelectChoice = async (
		teamId: Team['id'],
		roundId: Round['round_id'],
		choice: Choice
	) => {
		if (!db || !gameData) return;
		setLoading(true);

		const gameDocRef = doc(db, gameDocPath);
		const updatedGameData = { ...gameData };

		const updatedTeams = gameData.teams.map((team) => {
			if (team.id === teamId) {
				const choiceIndex = team.choices.findIndex(
					(c) => c.round_id === roundId && c.choice_id === choice.id
				);

				let newChoices: ChosenItem[];
				if (choiceIndex >= 0) {
					newChoices = team.choices.filter((c, index) => index !== choiceIndex);
				} else {
					if (team.capacity_score >= choice.capacity_score) {
						newChoices = [
							...team.choices,
							{
								round_id: roundId,
								choice_id: choice.id,
								roundIndex: currentRoundIndex,
							},
						];
					} else {
						console.log('Not enough capacity to select this choice.');
						return team;
					}
				}
				return { ...team, choices: newChoices };
			}
			return team;
		});

		updatedGameData.teams = calculateScores(
			updatedTeams,
			gameData.rounds,
			currentRoundIndex
		);

		try {
			await setDoc(gameDocRef, updatedGameData);
			setLoading(false);
		} catch (error) {
			console.error('Failed to update team choices:', error);
			setLoading(false);
		}
	};

	const handleAddRound = async () => {
		if (!db || !gameData) return;
		setLoading(true);

		const gameDocRef = doc(db, gameDocPath);
		const newRound: Round = {
			round_id: `round_${gameData.rounds.length + 1}`,
			round_duration: 3600,
			round_started_at: null,
			round_finished_at: null,
			round_index: gameData.rounds.length,
			round_name: `Round ${gameData.rounds.length + 1}: New Round`,
			choices: [],
		};
		const updatedGameData = {
			...gameData,
			rounds: [...gameData.rounds, newRound],
		};

		try {
			await setDoc(gameDocRef, updatedGameData);
			setLoading(false);
		} catch (error) {
			console.error('Failed to add new round:', error);
			setLoading(false);
		}
	};

	// Handle updating a round in the database
	const handleUpdateRound = async (updatedRound: Round) => {
		if (!db || !gameData) return;
		setLoading(true);

		const gameDocRef = doc(db, gameDocPath);
		const updatedRounds = gameData.rounds.map((round) =>
			round.round_id === updatedRound.round_id ? updatedRound : round
		);
		const updatedGameData = { ...gameData, rounds: updatedRounds };

		try {
			await setDoc(gameDocRef, updatedGameData);
			setLoading(false);
		} catch (error) {
			console.error('Failed to update round:', error);
			setLoading(false);
		}
	};

	// Handle adding a team to the database
	const handleAddTeam = async (team: Team) => {
		if (!db || !gameData) return;
		setLoading(true);

		const gameDocRef = doc(db, gameDocPath);
		const updatedTeams = [...gameData.teams, team];
		const updatedGameData = { ...gameData, teams: updatedTeams };

		try {
			await setDoc(gameDocRef, updatedGameData);
			setLoading(false);
		} catch (error) {
			console.error('Failed to add new team:', error);
			setLoading(false);
		}
	};

	// Handle updating a team in the database
	const handleUpdateTeam = async (id: Team['id'], updates: Partial<Team>) => {
		if (!db || !gameData) return;
		setLoading(true);

		const gameDocRef = doc(db, gameDocPath);
		const updatedTeams = gameData.teams.map((team) =>
			team.id === id ? { ...team, ...updates } : team
		);
		const updatedGameData = { ...gameData, teams: updatedTeams };

		try {
			await setDoc(gameDocRef, updatedGameData);
			setLoading(false);
		} catch (error) {
			console.error('Failed to update team:', error);
			setLoading(false);
		}
	};

	// Handle resetting scores in the database
	const handleResetScores = async () => {
		if (!db || !gameData) return;

		const gameDocRef = doc(db, gameDocPath);
		const initialTeams = initialGameData.teams.map((team) => ({
			...team,
			expected_profit_score: 0,
			liquidity_score: 0,
			solvency_score: 0,
			IT_score: 0,
			capacity_score: initialBaseCapacity,
			choices: [],
		}));

		const updatedGameData = {
			...gameData,
			teams: initialTeams,
			currentRoundIndex: 0,
			currentRoundId: initialGameData.currentRoundId,
		};

		try {
			await setDoc(gameDocRef, updatedGameData);
			setShowResetModal(false);
		} catch (error) {
			console.error('Failed to reset scores:', error);
		}
	};

	// Handle round navigation in the database
	const handleSetCurrentRound = async (roundIndex: number) => {
		if (!db || !gameData) return;
		const gameDocRef = doc(db, gameDocPath);
		const roundId = gameData.rounds[roundIndex]?.round_id || 'round_1';

		const updatedTeams = calculateScores(teams, roundChoices, roundIndex);

		try {
			await setDoc(
				gameDocRef,
				{
					...gameData,
					currentRoundIndex: roundIndex,
					currentRoundId: roundId,
					teams: updatedTeams,
				},
				{ merge: true }
			);
		} catch (error) {
			console.error('Failed to set current round:', error);
		}
	};

	const renderPage = () => {
		switch (pageState) {
			case PageState.ROUNDS:
				return (
					<>
						<GameRounds
							teams={teams}
							roundChoices={roundChoices}
							currentRoundIndex={currentRoundIndex}
							handleSelectChoice={handleSelectChoice}
						/>
						<div className="mt-8">
							<RevealedInfo
								teams={teams}
								currentRoundIndex={currentRoundIndex}
								roundChoices={roundChoices}
							/>
						</div>
					</>
				);
			case PageState.RULES_CONFIG:
				return (
					<GameConfig
						roundChoices={roundChoices}
						currentRoundIndex={currentRoundIndex}
						handleUpdateRound={handleUpdateRound}
						handleAddRound={handleAddRound}
					/>
				);
			case PageState.TEAMS_CONFIG:
				return (
					<TeamsConfig
						teams={teams}
						handleAddTeam={handleAddTeam}
						handleUpdateTeam={handleUpdateTeam}
					/>
				);
			default:
				return null;
		}
	};

	const menuItems = [
		{ name: 'Game Rounds', state: PageState.ROUNDS },
		{ name: 'Game Config', state: PageState.RULES_CONFIG },
		{ name: 'Team Config', state: PageState.TEAMS_CONFIG },
	];

	if (loading || !gameData) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
				<div className="text-xl font-medium">Initializing App...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-8 flex flex-col items-center">
			<div className="w-full max-w-5xl">
				<header className="text-center mb-8">
					<h1 className="text-4xl font-extrabold text-teal-400">
						Insurance Simulation Admin
					</h1>
					<div className="bg-gray-800 rounded-lg p-4 mt-4 shadow-xl flex flex-col sm:flex-row items-center justify-between">
						<p className="text-sm font-mono break-all text-gray-500 mb-2 sm:mb-0">
							Game ID: <span className="font-bold">{GAME_ID}</span>
						</p>
						<p className="text-sm font-mono break-all text-gray-500 mb-2 sm:mb-0">
							User ID: <span className="font-bold">{userId}</span>
						</p>
						<button
							onClick={() => setShowResetModal(true)}
							className="flex items-center space-x-2 text-sm text-red-400 hover:text-red-300 transition duration-200"
						>
							<LucideRefreshCw size={16} />
							<span>Reset Scores</span>
						</button>
					</div>
				</header>
				<nav className="flex flex-wrap justify-center space-x-2 mb-4 sm:space-x-4">
					{menuItems.map((item) => (
						<button
							key={item.state}
							onClick={() => setPageState(item.state)}
							className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
								pageState === item.state
									? 'bg-teal-500 text-white shadow-lg'
									: 'bg-gray-800 text-gray-300 hover:bg-gray-700'
							}`}
						>
							{item.name}
						</button>
					))}
				</nav>

				<div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0 sm:space-x-4">
					<div className="flex flex-wrap justify-center space-x-2 sm:space-x-4">
						{roundChoices.map((round, index) => (
							<button
								key={round.round_id}
								onClick={() => {
									handleSetCurrentRound(index);
								}}
								className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
									currentRoundIndex === index
										? 'bg-purple-600 text-white shadow-lg'
										: 'bg-gray-800 text-gray-300 hover:bg-gray-700'
								}`}
							>
								{round.round_name}
							</button>
						))}
					</div>
				</div>

				{renderPage()}

				{showResetModal && (
					<ConfirmationModal
						message="Are you sure you want to reset all game data? This cannot be undone."
						onConfirm={handleResetScores}
						onCancel={() => setShowResetModal(false)}
					/>
				)}
			</div>
		</div>
	);
};

export default App;
