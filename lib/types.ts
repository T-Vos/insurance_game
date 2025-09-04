import {
	LucideHandCoins,
	LucideDroplet,
	LucidePiggyBank,
	LucideComputer,
	LucideUsersRound,
	LucideBanknote,
	LucideHome,
	LucideChartArea,
	LucideSettings,
	LucideUsers,
	LucideAxe,
	LucideCog,
} from 'lucide-react';
import { hatTop } from '@lucide/lab';

export const scoreTypes = [
	{
		name: 'expected_profit_score',
		label: 'Profit',
		title: 'Expected Profit',
		icon: LucideHandCoins,
		color: 'yellow-400',
	},
	{
		name: 'liquidity_score',
		label: 'Liquidity',
		title: 'Liquidity',
		icon: LucideDroplet,
		color: 'blue-400',
	},
	{
		name: 'solvency_score',
		label: 'Solvency (%)',
		title: 'Solvency',
		icon: LucidePiggyBank,
		color: 'green-400',
	},
	{
		name: 'IT_score',
		label: 'IT (%)',
		title: 'IT Score',
		icon: LucideComputer,
		color: 'purple-400',
	},
	{
		name: 'capacity_score',
		label: 'Capacity (%)',
		title: 'Capacity',
		icon: LucideUsersRound,
		color: 'pink-400',
	},
] as const;

export type ScoreType = (typeof scoreTypes)[number]['name'];

export const roleTypes = [
	{ name: 'CEO', icon: hatTop },
	{ name: 'CFO', icon: LucideBanknote },
	{ name: 'CRO', icon: LucideAxe },
	{ name: 'CTO/COO', icon: LucideComputer },
	{ name: 'HR', icon: LucideUsers },
] as const;
export type roleType = (typeof roleTypes)[number]['name'];

/**
 * Represents the different pages or views in the application.
 */
export enum PageState {
	ROUNDS = 'ROUNDS',
	RULES_CONFIG = 'RULES_CONFIG',
	TEAMS_CONFIG = 'TEAMS_CONFIG',
	CHART = 'CHART',
}

export const menuItems = [
	{ name: 'Game Rounds', state: PageState.ROUNDS, icon: LucideHome },
	{
		name: 'Game Config',
		state: PageState.RULES_CONFIG,
		icon: LucideSettings,
	},
	{ name: 'Team Config', state: PageState.TEAMS_CONFIG, icon: LucideUsers },
	{ name: 'Score graphs', state: PageState.CHART, icon: LucideChartArea },
];

/**
 * Represents the main game state stored in a single Firestore document.
 */
export interface Game {
	id: string;
	key: string;
	name: string;
	currentRoundIndex: number;
	currentRoundId: Round['round_id'] | null;
	gameStartedAt: number | null;
	gameFinishedAt: number | null;
	totalRounds?: number;
	createdAt: number;
	admin_user_ids: string[];
	status: 'lobby' | 'active' | 'finished';
	start_expected_profit_score?: number;
	start_liquidity_score?: number;
	start_solvency_score?: number;
	start_IT_score?: number;
	start_capacity_score?: number;
	critical_expected_profit_score?: number;
	critical_liquidity_score?: number;
	critical_solvency_score?: number;
	critical_IT_score?: number;
	critical_capacity_score?: number;
	critical_expected_profit_score_text?: string;
	critical_liquidity_score_text?: string;
	critical_solvency_score_text?: string;
	critical_IT_score_text?: string;
	critical_capacity_score_text?: string;
	gameover_expected_profit_score?: number;
	gameover_liquidity_score?: number;
	gameover_solvency_score?: number;
	gameover_IT_score?: number;
	gameover_capacity_score?: number;
}

export interface Scores {
	expected_profit_score: number;
	liquidity_score: number;
	solvency_score: number;
	IT_score: number;
	capacity_score: number;
}

/**
 * Represents a single choice or strategy within a game round.
 */
export interface Choice extends Scores {
	id: string;
	round_id: Round['round_id'];
	roundIndex: number;
	title: string;
	description: string;
	duration?: number | null;
	reveals: RevealMessage[];
	interactionEffects?: InteractionEffect[];
	choice_index?: number | null;
	blocking_choices: Choice['id'][];
	delayedEffect?: delayedEffect[];
	acceptenceText?: string;
}

export interface delayedEffect extends Scores {
	effective_round: Round['round_id'];
}

/**
 * Represents a game round, containing a set of choices.
 */
export interface Round {
	round_id: string | number;
	round_duration: number;
	round_started_at: number | null | string;
	round_finished_at: number | null | string;
	round_index: number;
	round_name: string;
	round_show_scores?: boolean;
	choices_ids: string[];
	round_schock_expected_profit_score?: number;
	round_schock_liquidity_score?: number;
	round_schock_solvency_score?: number;
	round_schock_IT_score?: number;
	round_schock_capacity_score?: number;
}

export interface Team extends Scores {
	id: string;
	teamName: string;
	team_code?: string;
	choices?: TeamChoice[];
	members?: TeamMembers[];
}

export interface TeamMembers {
	id: string;
	role: roleType;
	role_code?: string;
	name: string;
}

/**
 * Represents an interaction effect between choices.
 */
export interface InteractionEffect {
	targetChoiceId: Choice['id'];
	roundId: Round['round_id'];
	bonusScore: number;
}

/**
 * Represents a chosen item, linking a team to a specific choice in a round.
 */
export interface TeamChoice {
	round_id: Round['round_id'];
	choice_id: Choice['id'];
	roundIndex: Round['round_index'];
	saved: boolean;
	accepted?: boolean;
}

/**
 * Represents a message that is revealed later in the game.
 */
export interface RevealMessage {
	id: string;
	text: string | React.ReactNode;
	revealedInRounds?: number;
	revealdForRoles?: roleType[];
	message_sender: string;
	message_sender_image?: string;
}
