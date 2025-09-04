'use client';

import { useAdminAuth } from '@/app/hooks/useAdminHooks';
import { useGameData } from '@/app/hooks/useGameDataHook';
import { useState } from 'react';
import Footer from './components/footer';
import clsx from 'clsx';
import { menuItems, PageState } from '@/lib/types';
import Link from 'next/link';
import GameConfig from './pages/GameConfig';
import GameGraphs from './pages/GameGraph';
import TeamsConfig from './pages/teamsConfig';
import PlayControls from './components/PlayControls';
import { useSelectChoice } from '@/app/hooks/useSelectChoice';
import useGameControls from '@/app/hooks/usegameControls';
import GameRounds from './pages/GameRounds';

const GameAdmin = ({ gameId }: { gameId: string }) => {
	const [localCurrentRoundIndex, setLocalCurrentRoundIndex] =
		useState<number>(0);
	const { userEmail, loading } = useAdminAuth();
	const [pageState, setPageState] = useState(PageState.ROUNDS);
	const { gameData, allRounds, allTeams, allChoices } = useGameData(gameId);
	const { handleSelectChoice } = useSelectChoice(gameData);
	const {
		handleStartGame,
		isLastRound,
		isGameRunning,
		handleStopGame,
		handleNextRound,
		handlePreviousRound,
		handleUpdateGameConfig,
		handleUpdateRound,
		handleAddRound,
		handleRemoveRound,
		handleAddTeam,
		handleUpdateTeam,
		onAddChoice,
		onRemoveChoice,
		onSaveChoice,
	} = useGameControls(gameId);
	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen dark:bg-gray-900 dark:text-gray-200">
				<div className="text-xl font-medium">Initializing App...</div>
			</div>
		);
	}

	const renderPage = () => {
		switch (pageState) {
			case PageState.ROUNDS:
				return (
					<>
						<GameRounds
							teams={allTeams}
							allRounds={allRounds}
							currentRoundIndex={localCurrentRoundIndex}
							handleSelectChoice={(teamId, roundId, choice) =>
								handleSelectChoice(gameId, teamId, roundId, choice)
							}
							choices={allChoices}
						/>
					</>
				);
			case PageState.RULES_CONFIG:
				return (
					<GameConfig
						key={'gameConfig'}
						handleUpdateGameConfig={handleUpdateGameConfig}
						allRounds={allRounds}
						allChoices={allChoices}
						onAddChoice={onAddChoice}
						onRemoveChoice={onRemoveChoice}
						onSaveChoice={onSaveChoice}
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
						teams={allTeams}
						handleAddTeam={handleAddTeam}
						handleUpdateTeam={handleUpdateTeam}
					/>
				);
			case PageState.CHART:
				return (
					<GameGraphs
						game={gameData}
						teams={allTeams}
						choices={allChoices}
						rounds={allRounds}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen flex">
			<aside className="w-64 bg-gray-200 dark:bg-gray-800 p-4 flex flex-col">
				<Link href={'/admin'}>
					<h2 className="text-lg font-bold text-teal-600 dark:text-teal-400 mb-4">
						Admin Panel
					</h2>
				</Link>
				<div className="flex-1 flex flex-col space-y-6">
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
							{allRounds.map((round, index) => (
								<button
									key={`SideBarRound_${round.round_id}`}
									onClick={() => setLocalCurrentRoundIndex(index)}
									className={clsx(
										'px-4 py-2 cursor-pointer text-left rounded-lg font-medium transition duration-300',
										localCurrentRoundIndex === index
											? 'bg-purple-600 text-white shadow-lg'
											: 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
										index === gameData?.currentRoundIndex &&
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
				<PlayControls
					currentRoundIndex={gameData?.currentRoundIndex ?? 0}
					handleStartGame={() =>
						handleStartGame(allRounds.length, allRounds[0].round_id)
					}
					handleNextRound={() => handleNextRound()}
					handlePreviousRound={() => handlePreviousRound()}
					handleStopGame={() => handleStopGame()}
					isGameRunning={isGameRunning}
					isLastRound={isLastRound}
				/>
			</aside>
			<main className="flex-1 p-6">
				<div className="mb-6">{renderPage()}</div>
				<Footer GAME_ID={gameId} userId={userEmail || 'unknown'} />
			</main>
		</div>
	);
};

export default GameAdmin;
