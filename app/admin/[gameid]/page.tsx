'use client';
import React, { useEffect, useState } from 'react';
import {
	LucideHome,
	LucideUsers,
	LucideSettings,
	LucidePlay,
	LucideChevronRight,
	LucideSquare,
	LucideChevronLeft,
} from 'lucide-react';
import { PageState, Game, Team, Round, Choice } from '@/lib/types';
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
import Footer from '../components/footer';
import RoundsProgress from '../components/roundProgress';
import clsx from 'clsx';

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

	const handlePreviousRound = async () => {
		if (!db || !gameData || !isGameRunning || currentRoundIndex === 0) return;
		setLoading(true);

		const gameDocRef = doc(db, gameDocPath);
		const updatedRounds = [...gameData.rounds];

		// Reset the current round's finish time
		updatedRounds[currentRoundIndex].round_finished_at = null;

		const prevRoundIndex = currentRoundIndex - 1;
		// Optionally reset the previous round's start time
		updatedRounds[prevRoundIndex].round_started_at = null;
		setLocalCurrentRoundIndex(prevRoundIndex);
		const newRoundId =
			updatedRounds[prevRoundIndex]?.round_id || gameData.currentRoundId;
		const updatedTeams = calculateScores(teams, updatedRounds, prevRoundIndex);

		const updatedGameData = {
			...gameData,
			currentRoundIndex: prevRoundIndex,
			currentRoundId: newRoundId,
			rounds: updatedRounds,
			teams: updatedTeams,
		};

		try {
			await setDoc(gameDocRef, updatedGameData);
		} catch (error) {
			console.error('Failed to go to previous round:', error);
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
		setLocalCurrentRoundIndex(nextRoundIndex);
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
		{ name: 'Game Rounds', state: PageState.ROUNDS, icon: LucideHome },
		{
			name: 'Game Config',
			state: PageState.RULES_CONFIG,
			icon: LucideSettings,
		},
		{ name: 'Team Config', state: PageState.TEAMS_CONFIG, icon: LucideUsers },
	];

	if (loading || !gameData) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
				<div className="text-xl font-medium">Initializing App...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-200 flex">
			{/* Sidebar */}
			<aside className="w-64 bg-gray-200 dark:bg-gray-800 p-4 flex flex-col">
				<h2 className="text-lg font-bold text-teal-600 dark:text-teal-400 mb-4">
					Admin Panel
				</h2>

				{/* Navigation + Rounds wrapper */}
				<div className="flex-1 flex flex-col space-y-6">
					{/* Main menu */}
					<nav className="flex flex-col space-y-2">
						{menuItems.map((item) => {
							const Icon = item.icon;
							return (
								<button
									key={item.state}
									onClick={() => setPageState(item.state)}
									className={`px-4 py-2 flex items-center space-x-2 text-left rounded-lg font-medium transition duration-300 ${
										pageState === item.state
											? 'bg-teal-500 text-white shadow-lg'
											: 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
									}`}
								>
									<Icon size={18} />
									<span>{item.name}</span>
								</button>
							);
						})}
					</nav>

					{/* Divider */}
					<div className="border-t border-gray-400 dark:border-gray-600"></div>

					{/* Rounds */}
					<div>
						<h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
							Rounds
						</h3>
						<div className="flex flex-col space-y-2">
							{roundChoices.map((round, index) => (
								<button
									key={round.round_id}
									onClick={() => setLocalCurrentRoundIndex(index)}
									className={clsx(
										'px-4 py-2 text-left rounded-lg font-medium transition duration-300',
										localCurrentRoundIndex === index
											? 'bg-purple-600 text-white shadow-lg'
											: 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
										index === currentRoundIndex &&
											isGameRunning &&
											'border-2 border-yellow-400'
									)}
								>
									{round.round_name}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Game Controls */}
				<div className="mt-6 border-t border-gray-400 dark:border-gray-600 pt-4 flex flex-col space-y-2">
					{!isGameRunning && (
						<button
							onClick={handleStartGame}
							className="px-4 py-2 flex items-center justify-center space-x-2 rounded-lg font-medium transition duration-300 bg-green-500 text-white hover:bg-green-600"
						>
							<LucidePlay size={18} />
							<span>Start Game</span>
						</button>
					)}
					{isGameRunning && (
						<>
							<button
								onClick={handlePreviousRound}
								disabled={currentRoundIndex == 0}
								className={clsx(
									`px-4 py-2 flex items-center justify-center space-x-2 rounded-lg font-medium transition duration-300`,
									currentRoundIndex == 0
										? 'bg-gray-300 text-gray-400 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed'
										: 'bg-blue-500 text-white hover:bg-blue-600'
								)}
							>
								<span>Vorige ronde</span>
								<LucideChevronLeft size={18} />
							</button>
							<button
								onClick={handleNextRound}
								disabled={isLastRound}
								className={`px-4 py-2 flex items-center justify-center space-x-2 rounded-lg font-medium transition duration-300 ${
									isLastRound
										? 'bg-gray-300 text-gray-400 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed'
										: 'bg-blue-500 text-white hover:bg-blue-600'
								}`}
							>
								<span>Volgende ronde</span>
								<LucideChevronRight size={18} />
							</button>
						</>
					)}
					{isGameRunning && (
						<button
							onClick={handleStopGame}
							className="px-4 py-2 flex items-center justify-center space-x-2 rounded-lg font-medium transition duration-300 bg-red-500 text-white hover:bg-red-600"
						>
							<LucideSquare size={18} />
							<span>Stop Game</span>
						</button>
					)}
				</div>
			</aside>

			{/* Main Content */}
			<main className="flex-1 p-6">
				<RoundsProgress
					rounds={roundChoices}
					currentRoundIndex={currentRoundIndex}
				/>
				<div className="mb-6">{renderPage()}</div>

				{showResetModal && (
					<ConfirmationModal
						message="Are you sure you want to reset all game data? This cannot be undone."
						onConfirm={handleResetScores}
						onCancel={() => setShowResetModal(false)}
					/>
				)}

				<Footer
					GAME_ID={GAME_ID}
					userId={userId || 'unknown'}
					setShowResetModal={setShowResetModal}
				/>
			</main>
		</div>
	);
};

export default App;
