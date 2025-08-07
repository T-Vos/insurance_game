'use client';
import React, { useEffect, useState } from 'react';
import GameRounds from './GameRounds';
import GameConfig from './gameConfig';
import TeamsConfig from './teamsConfig';
import { LucideRefreshCw } from 'lucide-react';

const menuItems = [
	{ name: 'Game Rounds', state: 'rounds' },
	{ name: 'Game Config', state: 'rulesConfig' },
	{ name: 'Team Config', state: 'teamsConfig' },
];

const App = () => {
	const [userId, setUserId] = useState('USER 12345');
	const [pageState, setPageState] = useState('rounds');
	const [loading, setLoading] = useState(true);
	const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
	const initialBaseCapacity = 7;

	const [roundChoices, setRoundChoices] = useState([
		{
			round_id: 1,
			round_name: 'Round 1: Initial Investments',
			choices: [
				{
					id: 1,
					description: 'Investeer in onderzoek',
					score: 10,
					capacity: 4,
					duration: 1,
				},
				{
					id: 2,
					description: 'Update bedrijfsmodellen',
					score: 20,
					capacity: 2,
					duration: 2,
				},
				{
					id: 3,
					description: 'Onderzoek China',
					score: 30,
					capacity: 2,
					duration: 1,
				},
			],
		},
		{
			round_id: 2,
			round_name: 'Round 2: Market Expansion',
			choices: [
				{
					id: 1,
					description: 'Breid uit naar Europa',
					score: 15,
					capacity: 3,
					duration: 1,
				},
				{
					id: 2,
					description: 'Focus op binnenlandse markt',
					score: 10,
					capacity: 5,
					duration: 1,
				},
				{
					id: 3,
					description: 'Verwerf een concurrent',
					score: 40,
					capacity: 1,
					duration: 1,
				},
			],
		},
	]);

	const [teams, setTeams] = useState([
		{
			id: 1,
			teamName: 'Verzekerbaars',
			choices: [],
			score: 0,
			capacity: initialBaseCapacity,
		},
		{
			id: 2,
			teamName: 'Financieel Fijntjes',
			choices: [],
			score: 0,
			capacity: initialBaseCapacity,
		},
	]);

	const updateTeamStats = (updatedTeams, roundIndex) => {
		const roundCapacityBonus = roundIndex * 2;

		return updatedTeams.map((team) => {
			const totalScore = team.choices.reduce(
				(sum, choice) => sum + choice.score,
				0
			);

			const usedCapacity = team.choices.reduce((sum, chosenItem) => {
				const originalRound = roundChoices.find(
					(r) => r.round_id === chosenItem.round_id
				);
				const originalChoice = originalRound.choices.find(
					(c) => c.id === chosenItem.choice_id
				);

				const isActive =
					roundIndex >= chosenItem.roundIndex &&
					roundIndex < chosenItem.roundIndex + originalChoice.duration;

				return sum + (isActive ? originalChoice.capacity : 0);
			}, 0);

			const remainingCapacity =
				initialBaseCapacity + roundCapacityBonus - usedCapacity;
			return { ...team, score: totalScore, capacity: remainingCapacity };
		});
	};

	const handleSelectChoice = (teamId, roundId, choice) => {
		setTeams((prevTeams) => {
			const updatedTeams = prevTeams.map((team) => {
				if (team.id === teamId) {
					const choiceIndex = team.choices.findIndex(
						(c) => c.round_id === roundId && c.choice_id === choice.id
					);

					let newChoices = [];
					if (choiceIndex >= 0) {
						newChoices = team.choices.filter(
							(c, index) => index !== choiceIndex
						);
					} else {
						if (team.capacity >= choice.capacity) {
							newChoices = [
								...team.choices,
								{
									...choice,
									round_id: roundId,
									choice_id: choice.id,
									roundIndex: currentRoundIndex,
								},
							];
						} else {
							return team;
						}
					}
					return { ...team, choices: newChoices };
				}
				return team;
			});
			return updateTeamStats(updatedTeams, currentRoundIndex);
		});
	};

	const handleResetScores = () => {
		if (
			window.confirm(
				'Are you sure you want to reset all team scores and capacity? This cannot be undone.'
			)
		) {
			setTeams((prevTeams) =>
				prevTeams.map((team) => ({
					...team,
					choices: [],
					score: 0,
					capacity: initialBaseCapacity,
				}))
			);
			setCurrentRoundIndex(0);
			setPageState('rounds');
		}
	};

	useEffect(() => {
		const timer = setTimeout(() => setLoading(false), 500);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		setTeams((prevTeams) => updateTeamStats(prevTeams, currentRoundIndex));
	}, [currentRoundIndex]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
				<div className="text-xl font-medium">Initializing App...</div>
			</div>
		);
	}

	const renderPage = () => {
		switch (pageState) {
			case 'rounds':
				return (
					<GameRounds
						teams={teams}
						roundChoices={roundChoices}
						currentRoundIndex={currentRoundIndex}
						handleSelectChoice={handleSelectChoice}
					/>
				);
			case 'rulesConfig':
				return (
					<GameConfig
						roundChoices={roundChoices}
						currentRoundIndex={currentRoundIndex}
					/>
				);
			case 'teamsConfig':
				return <TeamsConfig />;
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-8 flex flex-col items-center">
			<div className="w-full max-w-5xl">
				<header className="text-center mb-8">
					<h1 className="text-4xl font-extrabold text-teal-400">
						Insurance Simulation Admin
					</h1>
					<div className="bg-gray-800 rounded-lg p-4 mt-4 shadow-xl flex items-center justify-between">
						<p className="text-sm font-mono break-all text-gray-500">
							User ID: <span className="font-bold">{userId}</span>
						</p>
						<button
							onClick={handleResetScores}
							className="flex items-center space-x-2 text-sm text-red-400 hover:text-red-300 transition duration-200"
						>
							<LucideRefreshCw size={16} />
							<span>Reset Scores</span>
						</button>
					</div>
				</header>
				<nav className="flex space-x-2 mb-4 sm:space-x-4">
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
					<div className="flex space-x-2 sm:space-x-4">
						{roundChoices.map((round, index) => (
							<button
								key={round.round_id}
								onClick={() => {
									setCurrentRoundIndex(index);
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
			</div>
		</div>
	);
};

export default App;
