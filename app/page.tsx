// App.tsx

'use client';
import React, { useEffect, useState } from 'react';
import GameRounds from './GameRounds';
import GameConfig from './gameConfig';
import TeamsConfig from './teamsConfig';
import { LucideRefreshCw } from 'lucide-react';
import * as Types from './types';
import RevealedInfo from './RevealedInfo';

const menuItems = [
	{ name: 'Game Rounds', state: Types.PageState.ROUNDS },
	{ name: 'Game Config', state: Types.PageState.RULES_CONFIG },
	{ name: 'Team Config', state: Types.PageState.TEAMS_CONFIG },
];

const App = () => {
	const GAME_ID = 'GeopoliticalShock2025';
	const [pageState, setPageState] = useState<Types.PageState>(
		Types.PageState.ROUNDS
	);
	const [loading, setLoading] = useState<boolean>(false);
	const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
	const initialBaseCapacity: number = 7;

	const [roundChoices, setRoundChoices] = useState<Types.Round[]>([
		{
			round_id: 'round_1',
			round_name: 'Round 1: Initial Investments',
			choices: [
				{
					id: 1,
					description: 'Investeer in onderzoek',
					score: -10,
					capacity: 4,
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
						{ targetChoiceId: 2, roundId: 'round_2', bonusScore: 25 },
					],
				},
				{
					id: 2,
					description: 'Update bedrijfsmodellen',
					score: 20,
					capacity: 2,
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
				},
				{
					id: 3,
					description: 'Onderzoek China',
					score: 30,
					capacity: 2,
					duration: 1,
					reveals: [
						{
							text: 'Onderzoek toont een grote, onontdekte markt in China met hoge winstkansen.',
							revealedInRounds: 1,
						},
					],
				},
			],
		},
		{
			round_id: 'round_2',
			round_name: 'Round 2: Market Expansion',
			choices: [
				{
					id: 1,
					description: 'Breid uit naar Europa',
					score: 15,
					capacity: 3,
					duration: 1,
					reveals: [],
				},
				{
					id: 2,
					description: 'Focus op binnenlandse markt',
					score: 10,
					capacity: 5,
					duration: 1,
					reveals: [],
				},
				{
					id: 3,
					description: 'Verwerf een concurrent',
					score: 40,
					capacity: 1,
					duration: 1,
					reveals: [],
				},
			],
		},
		{
			round_id: 'round_3',
			round_name: 'Round 3: Vervolg',
			choices: [
				{
					id: 1,
					description: 'Breid uit naar Europa',
					score: 15,
					capacity: 3,
					duration: 1,
					reveals: [],
				},
				{
					id: 2,
					description: 'Focus op binnenlandse markt',
					score: 10,
					capacity: 5,
					duration: 1,
					reveals: [],
				},
			],
		},
	]);

	const [teams, setTeams] = useState<Types.Team[]>([
		{
			id: 'team_1',
			teamName: 'Verzekerbaars',
			choices: [],
			score: 0,
			capacity: initialBaseCapacity,
		},
		{
			id: 'team_2',
			teamName: 'Financieel Fijntjes',
			choices: [],
			score: 0,
			capacity: initialBaseCapacity,
		},
	]);

	const updateTeamStats = (updatedTeams: Types.Team[], roundIndex: number) => {
		const roundCapacityBonus = roundIndex * 2;

		return updatedTeams.map((team: Types.Team) => {
			let totalScore = 0;
			let usedCapacity = 0;

			// Calculate base scores and capacity
			team.choices.forEach((chosenItem: Types.ChosenItem) => {
				const originalRound = roundChoices.find(
					(r) => r.round_id === chosenItem.round_id
				);
				const originalChoice = originalRound
					? originalRound.choices.find((c) => c.id === chosenItem.choice_id)
					: undefined;

				if (originalChoice) {
					totalScore += originalChoice.score;
				}

				const isActive =
					originalChoice &&
					roundIndex >= chosenItem.roundIndex &&
					roundIndex < chosenItem.roundIndex + originalChoice.duration;
				usedCapacity +=
					isActive && originalChoice ? originalChoice.capacity : 0;
			});

			// Calculate bonus scores from interaction effects
			team.choices.forEach((chosenItem: Types.ChosenItem) => {
				const originalRound = roundChoices.find(
					(r) => r.round_id === chosenItem.round_id
				);
				const originalChoice = originalRound
					? originalRound.choices.find((c) => c.id === chosenItem.choice_id)
					: undefined;

				if (originalChoice && originalChoice.interactionEffects) {
					originalChoice.interactionEffects.forEach((effect) => {
						const hasTargetChoice = team.choices.some(
							(c) =>
								c.choice_id === effect.targetChoiceId &&
								c.round_id === effect.roundId
						);
						if (hasTargetChoice) {
							totalScore += effect.bonusScore;
						}
					});
				}
			});

			const remainingCapacity =
				initialBaseCapacity + roundCapacityBonus - usedCapacity;
			return { ...team, score: totalScore, capacity: remainingCapacity };
		});
	};

	const handleSelectChoice = (
		teamId: Types.Team['id'],
		roundId: Types.Round['round_id'],
		choice: Types.Choice
	) => {
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
			setPageState(Types.PageState.ROUNDS);
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

	const handleUpdateRound = (updatedRound: Types.Round) => {
		setRoundChoices((prev) =>
			prev.map((round) =>
				round.round_id === updatedRound.round_id ? updatedRound : round
			)
		);
	};

	const handleAddTeam = (team: Types.Team) => {
		setTeams((prev) => [...prev, team]);
	};

	const handleUpdateTeam = (
		id: Types.Team['id'],
		updates: Partial<Types.Team>
	) => {
		setTeams((prev) =>
			prev.map((team) => (team.id === id ? { ...team, ...updates } : team))
		);
	};

	const renderPage = () => {
		switch (pageState) {
			case Types.PageState.ROUNDS:
				return (
					<GameRounds
						teams={teams}
						roundChoices={roundChoices}
						currentRoundIndex={currentRoundIndex}
						handleSelectChoice={handleSelectChoice}
					/>
				);
			case Types.PageState.RULES_CONFIG:
				return (
					<GameConfig
						roundChoices={roundChoices}
						currentRoundIndex={currentRoundIndex}
						handleUpdateRound={handleUpdateRound}
					/>
				);
			case Types.PageState.TEAMS_CONFIG:
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
	return (
		<div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-8 flex flex-col items-center">
			<div className="w-full max-w-5xl">
				<header className="text-center mb-8">
					<h1 className="text-4xl font-extrabold text-teal-400">
						Insurance Simulation Admin
					</h1>
					<div className="bg-gray-800 rounded-lg p-4 mt-4 shadow-xl flex items-center justify-between">
						<p className="text-sm font-mono break-all text-gray-500">
							Game ID: <span className="font-bold">{GAME_ID}</span>
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
				{pageState === Types.PageState.ROUNDS && (
					<div className="mt-8">
						<RevealedInfo
							teams={teams}
							currentRoundIndex={currentRoundIndex}
							roundChoices={roundChoices}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default App;
