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
	LucideChartArea,
} from 'lucide-react';
import { PageState, Game, Team, Round } from '@/lib/types';
import GameRounds from './pages/GameRounds';
import GameConfig from './pages/GameConfig';
import RevealedInfo from './pages/RevealedInfo';
import TeamsConfig from './pages/teamsConfig';
import ConfirmationModal from './components/ConfirmationModal';

// Firebase imports
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getAuth, Auth, onAuthStateChanged } from 'firebase/auth';
import { db, app } from '@/lib/firebase/config';
import { calculateScores } from '@/lib/calculateScores';
import { initialGameData } from '@/lib/initialGame';
import Footer from './components/footer';
import RoundsProgress from './pages/roundProgress';
import clsx from 'clsx';
import { useSelectChoice } from '@/app/hooks/useSelectChoice';
import { useRouter } from 'next/navigation';
import useGameControls from '@/app/hooks/gameControls';
import GameGraphs from './pages/GameGraph';

const menuItems = [
	{ name: 'Game Rounds', state: PageState.ROUNDS, icon: LucideHome },
	{
		name: 'Game Config',
		state: PageState.RULES_CONFIG,
		icon: LucideSettings,
	},
	{ name: 'Team Config', state: PageState.TEAMS_CONFIG, icon: LucideUsers },
	{ name: 'Score graphs', state: PageState.CHART, icon: LucideChartArea },
];

const GameControl = ({ gameId }: { gameId: string }) => {
	const [auth, setAuth] = useState<Auth | null>(null);
	const [userEmail, setUserEmail] = useState<string | null>(null);
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

	const gameDocPath = `insurance_game/${gameId}`;
	const router = useRouter();

	const { handleNextRound } = useGameControls(gameData, gameId);

	useEffect(() => {
		const authInstance = getAuth(app);
		const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
			if (user) {
				setAuth(authInstance);
				setUserEmail(user.email);
			} else {
				console.error('No user session found. Redirecting...');
				setLoading(false);
				router.push('/admin/login');
			}
			setLoading(false);
		});

		return () => unsubscribe();
	}, [router]);

	useEffect(() => {
		if (!db) return;

		const gameDocRef = doc(db, gameDocPath);

		const unsubscribe = onSnapshot(
			gameDocRef,
			async (snapshot) => {
				if (snapshot.exists()) {
					const data = snapshot.data() as Game;

					setGameData(data);

					const currentRound = (data.rounds ?? [])[data.currentRoundIndex];
					const roundRunning =
						!!currentRound?.round_started_at &&
						!currentRound?.round_finished_at;

					setIsGameRunning(roundRunning);

					// setLocalCurrentRoundIndex(data.currentRoundIndex || 0);
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

	useEffect(() => {
		if (gameData?.rounds && localCurrentRoundIndex >= gameData.rounds.length) {
			setLocalCurrentRoundIndex(0);
		}
	}, [gameData?.rounds?.length]);

	const handleStartGame = async () => {
		if (!db || !gameData || isGameRunning) return;
		setLoading(true);

		const gameDocRef = doc(db, gameDocPath);
		if (!gameData.rounds || gameData.rounds.length == 0) return;
		const updatedRounds = (gameData.rounds ?? []).map((round, index) => {
			const updatedRound: Round = {
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
		const updatedRounds = [...(gameData.rounds ?? [])];

		updatedRounds[currentRoundIndex].round_finished_at = null;
		updatedRounds[currentRoundIndex].round_started_at = null;

		const prevRoundIndex = currentRoundIndex - 1;
		updatedRounds[prevRoundIndex].round_started_at = Date.now();
		updatedRounds[prevRoundIndex].round_finished_at = null;

		setLocalCurrentRoundIndex(prevRoundIndex);
		const newRoundId =
			updatedRounds[prevRoundIndex]?.round_id || gameData.currentRoundId;
		const updatedTeams = calculateScores(gameData, currentRoundIndex);

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

	const handleRemoveRound = async (roundId: Round['round_id']) => {
		console.log('deleting round ' + roundId);
		if (!db || !gameData || !gameData.rounds) return;
		setLoading(true);

		const gameDocRef = doc(db, gameDocPath);

		const updatedGameData = {
			...gameData,
			rounds: gameData.rounds.filter((round) => round.round_id !== roundId),
		};

		try {
			await setDoc(gameDocRef, updatedGameData);
			setLoading(false);
		} catch (error) {
			console.error('Failed to add new round:', error);
			setLoading(false);
		}
	};

	// const handleNextRound = async () => {
	// 	if (!db || !gameData || !isGameRunning || isLastRound) return;
	// 	setLoading(true);
	// 	const gameDocRef = doc(db, gameDocPath);
	// 	const updatedRounds = [...gameData.rounds];

	// 	updatedRounds[currentRoundIndex].round_finished_at = Date.now();

	// 	const nextRoundIndex = currentRoundIndex + 1;
	// 	setLocalCurrentRoundIndex(nextRoundIndex);
	// 	if (nextRoundIndex < updatedRounds.length) {
	// 		updatedRounds[nextRoundIndex].round_started_at = Date.now();
	// 	}

	// 	const newRoundId =
	// 		updatedRounds[nextRoundIndex]?.round_id || gameData.currentRoundId;
	// 	const updatedTeams = calculateScores(teams, updatedRounds, nextRoundIndex);

	// 	const updatedGameData = {
	// 		...gameData,
	// 		currentRoundIndex: nextRoundIndex,
	// 		currentRoundId: newRoundId,
	// 		rounds: updatedRounds,
	// 		teams: updatedTeams,
	// 	};

	// 	try {
	// 		await setDoc(gameDocRef, updatedGameData);
	// 	} catch (error) {
	// 		console.error('Failed to advance to next round:', error);
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	const handleStopGame = async () => {
		if (!db || !gameData || !isGameRunning || !gameData.rounds) return;
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

	const handleAddRound = async () => {
		if (!db || !gameData) return;
		if (!gameData.rounds) gameData.rounds = [];

		const gameDocRef = doc(db, gameDocPath);
		const newRound: Round = {
			round_id: `round_${gameData?.rounds.length + 1}`,
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
		} catch (error) {
			console.error('Failed to add new round:', error);
		}
	};

	// Handle updating a round in the database
	const handleUpdateRound = async (updatedRound: Round) => {
		if (!db || !gameData || !gameData.rounds) return;
		const gameDocRef = doc(db, gameDocPath);
		const updatedRounds = gameData.rounds.map((round) =>
			round.round_id === updatedRound.round_id ? updatedRound : round
		);
		const updatedGameData = { ...gameData, rounds: updatedRounds };

		try {
			await setDoc(gameDocRef, updatedGameData);
		} catch (error) {
			console.error('Failed to update round:', error);
		}
	};

	const handleUpdateGameConfig = async (
		key: keyof Game,
		value: string | number
	) => {
		if (!db || !gameData) return;
		const gameDocRef = doc(db, gameDocPath);
		const updatedGame = { ...gameData, [key]: value };
		try {
			await setDoc(gameDocRef, updatedGame);
		} catch (error) {
			console.error('Failed to update game:', error);
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
			capacity_score: 0,
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

	const { handleSelectChoice } = useSelectChoice(gameData);

	const renderPage = () => {
		switch (pageState) {
			case PageState.ROUNDS:
				return (
					<>
						<GameRounds
							teams={teams}
							roundChoices={roundChoices}
							currentRoundIndex={localCurrentRoundIndex}
							handleSelectChoice={(teamId, roundId, choice) =>
								handleSelectChoice(gameId, teamId, roundId, choice)
							}
							key={'GamRounds'}
						/>
						<div className="mt-8">
							<RevealedInfo
								teams={teams}
								currentRoundIndex={localCurrentRoundIndex}
								roundChoices={roundChoices}
								key={'reveladInformation'}
							/>
						</div>
					</>
				);
			case PageState.RULES_CONFIG:
				return (
					<GameConfig
						key={'gameConfig'}
						handleUpdateGameConfig={handleUpdateGameConfig}
						roundChoices={roundChoices}
						currentRoundIndex={localCurrentRoundIndex}
						handleUpdateRound={handleUpdateRound}
						handleAddRound={handleAddRound}
						gameData={gameData}
						handleRemoveRound={handleRemoveRound}
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
			case PageState.CHART:
				return <GameGraphs game={gameData} />;
			default:
				return null;
		}
	};

	if (loading || !gameData) {
		return (
			<div className="flex items-center justify-center min-h-screen dark:bg-gray-900 dark:text-gray-200">
				<div className="text-xl font-medium">Initializing App...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen  flex">
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
									className={`px-4 py-2 flex items-center space-x-2 text-left rounded-lg font-medium transition cursor-pointer duration-300 ${
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

					<div className="border-t border-gray-400 dark:border-gray-600"></div>

					<div>
						<h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
							Rounds
						</h3>
						<div className="flex flex-col space-y-2">
							{roundChoices.map((round, index) => (
								<button
									key={`SideBarRound_${round.round_id}`}
									onClick={() => setLocalCurrentRoundIndex(index)}
									className={clsx(
										'px-4 py-2 cursor-pointer text-left rounded-lg font-medium transition duration-300',
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
								onClick={handleNextRound}
								disabled={isLastRound}
								className={`px-4 py-2 flex cursor-pointer items-center justify-center space-x-2 rounded-lg font-medium transition duration-300 ${
									isLastRound
										? 'bg-gray-300 text-gray-400 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed'
										: 'bg-blue-500 text-white hover:bg-blue-600'
								}`}
							>
								<span>Volgende ronde</span>
								<LucideChevronRight size={18} />
							</button>
							<button
								onClick={handlePreviousRound}
								disabled={currentRoundIndex == 0}
								className={clsx(
									`px-4 py-2 flex cursor-pointer items-center justify-center space-x-2 rounded-lg font-medium transition duration-300`,
									currentRoundIndex == 0
										? 'bg-gray-300 text-gray-400 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed'
										: 'bg-blue-500 text-white hover:bg-blue-600'
								)}
							>
								<span>Vorige ronde</span>
								<LucideChevronLeft size={18} />
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
					GAME_ID={gameId}
					userId={userEmail || 'unknown'}
					setShowResetModal={setShowResetModal}
				/>
			</main>
		</div>
	);
};

export default GameControl;
