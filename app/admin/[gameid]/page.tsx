'use client';
import React, { useEffect, useState } from 'react';
import {
	LucideChevronRight,
	LucidePlay,
	LucideRefreshCw,
	LucideSquare,
} from 'lucide-react';
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
import { calculateScores } from '@/lib/calculateScores';
import { initialGameData } from '@/lib/initialGame';

const App = () => {
	const [auth, setAuth] = useState<Auth | null>(null);
	const [userId, setUserId] = useState<string | null>(null);
	const [gameData, setGameData] = useState<Game | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [showResetModal, setShowResetModal] = useState<boolean>(false);
	const [localCurrentRoundIndex, setLocalCurrentRoundIndex] =
		useState<number>(0);
	const [isGameRunning, setIsGameRunning] = useState(false);
	const [pageState, setPageState] = useState<PageState>(PageState.ROUNDS);

	const teams = gameData?.teams || [];
	const roundChoices = gameData?.rounds || [];
	const currentRoundIndex = gameData?.currentRoundIndex || 0;
	const isLastRound = currentRoundIndex >= roundChoices.length - 1;

	const GAME_ID = 'GeopoliticalShock2025';
	const gameDocPath = `insurance_game/${GAME_ID}`;

	const initialBaseCapacity = 7;

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
				}
				//  else {
				// 	console.log('Game doc missing, creating initial...');
				// 	await setDoc(gameDocRef, initialGameData);
				// }
				setLoading(false);
			},
			(error) => {
				console.error('Failed to fetch game data:', error);
				setLoading(false);
			}
		);

		return () => unsubscribe();
	}, [db, gameDocPath]);

	const handleStartGame = async () => {
		if (!db || !gameData || isGameRunning) return;
		setLoading(true);

		const gameDocRef = doc(db, gameDocPath);
		const updatedRounds = gameData.rounds.map((round, index) => {
			const updatedRound = {
				...round,
				round_started_at: null,
				round_finished_at: null,
			};
			if (index === 0) {
				updatedRound.round_started_at = Date.now();
			}
			return updatedRound;
		});

		const updatedGameData = {
			...gameData,
			gameStartedAt: Date.now(),
			gameFinishedAt: null,
			currentRoundIndex: 0,
			currentRoundId: gameData.rounds[0].round_id,
			rounds: updatedRounds,
		};

		try {
			await setDoc(gameDocRef, updatedGameData);
			setIsGameRunning(true);
		} catch (error) {
			console.error('Failed to start game:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleNextRound = async () => {
		if (!db || !gameData || !isGameRunning || isLastRound) return;
		setLoading(true);

		const gameDocRef = doc(db, gameDocPath);
		const updatedRounds = [...gameData.rounds];

		updatedRounds[currentRoundIndex].round_finished_at = Date.now();

		const nextRoundIndex = currentRoundIndex + 1;
		if (nextRoundIndex < updatedRounds.length) {
			updatedRounds[nextRoundIndex].round_started_at = Date.now();
		}

		const newRoundId =
			updatedRounds[nextRoundIndex]?.round_id || gameData.currentRoundId;
		const updatedTeams = calculateScores(teams, updatedRounds, nextRoundIndex);

		const updatedGameData = {
			...gameData,
			currentRoundIndex: nextRoundIndex,
			currentRoundId: newRoundId,
			rounds: updatedRounds,
			teams: updatedTeams,
		};

		try {
			await setDoc(gameDocRef, updatedGameData);
		} catch (error) {
			console.error('Failed to advance to next round:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleStopGame = async () => {
		if (!db || !gameData || !isGameRunning) return;
		setLoading(true);

		const gameDocRef = doc(db, gameDocPath);
		const updatedRounds = [...gameData.rounds];
		updatedRounds[currentRoundIndex].round_finished_at = Date.now();

		const updatedGameData = {
			...gameData,
			gameFinishedAt: Date.now(),
			rounds: updatedRounds,
		};

		try {
			await setDoc(gameDocRef, updatedGameData);
			setIsGameRunning(false);
		} catch (error) {
			console.error('Failed to stop game:', error);
		} finally {
			setLoading(false);
		}
	};

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
			// if (team.id === teamId) {
			// 	const choiceIndex = team.choices.findIndex(
			// 		(c) => c.round_id === roundId && c.choice_id === choice.id
			// 	);

			// 	let newChoices: ChosenItem[];
			// 	if (choiceIndex >= 0) {
			// 		newChoices = team.choices.filter((c, index) => index !== choiceIndex);
			// 	} else {
			// 		if (team.capacity_score >= choice.capacity_score) {
			// 			newChoices = [
			// 				...team.choices,
			// 				{
			// 					round_id: roundId,
			// 					choice_id: choice.id,
			// 					roundIndex: currentRoundIndex,
			// 				},
			// 			];
			// 		} else {
			// 			console.log('Not enough capacity to select this choice.');
			// 			return team;
			// 		}
			// 	}
			// 	return { ...team, choices: newChoices };
			// }
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
							currentRoundIndex={localCurrentRoundIndex}
							handleSelectChoice={handleSelectChoice}
						/>
						<div className="mt-8">
							<RevealedInfo
								teams={teams}
								currentRoundIndex={localCurrentRoundIndex}
								roundChoices={roundChoices}
							/>
						</div>
					</>
				);
			case PageState.RULES_CONFIG:
				return (
					<GameConfig
						roundChoices={roundChoices}
						currentRoundIndex={localCurrentRoundIndex}
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
									setLocalCurrentRoundIndex(index);
								}}
								className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
									localCurrentRoundIndex === index
										? 'bg-purple-600 text-white shadow-lg'
										: 'bg-gray-800 text-gray-300 hover:bg-gray-700'
								}`}
							>
								{round.round_name}
							</button>
						))}
					</div>
					<div className="flex items-center space-x-4 mt-4 sm:mt-0">
						{!isGameRunning && (
							<button
								onClick={handleStartGame}
								className="px-4 py-2 rounded-lg font-medium transition duration-300 bg-green-500 text-white hover:bg-green-600"
							>
								<LucidePlay size={18} />
								Start Game
							</button>
						)}
						{isGameRunning && (
							<button
								onClick={handleNextRound}
								disabled={isLastRound}
								className={`px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center space-x-2 ${
									isLastRound
										? 'bg-gray-600 text-gray-400 cursor-not-allowed'
										: 'bg-blue-500 text-white hover:bg-blue-600'
								}`}
							>
								<span>Next Round</span>
								<LucideChevronRight size={18} />
							</button>
						)}
						{isGameRunning && (
							<button
								onClick={handleStopGame}
								className="px-4 py-2 rounded-lg font-medium transition duration-300 bg-red-500 text-white hover:bg-red-600"
							>
								<LucideSquare size={18} />
								Stop Game
							</button>
						)}
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
