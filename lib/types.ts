import {
	LucideHandCoins,
	LucideDroplet,
	LucidePiggyBank,
	LucideComputer,
	LucideUsersRound,
	LucideBanknote,
} from 'lucide-react';

export const scoreTypes = [
	{ name: 'expected_profit_score', icon: LucideHandCoins },
	{ name: 'liquidity_score', icon: LucideDroplet },
	{ name: 'solvency_score', icon: LucidePiggyBank },
	{ name: 'IT_score', icon: LucideComputer },
	{ name: 'capacity_score', icon: LucideUsersRound },
] as const;
export type ScoreType = (typeof scoreTypes)[number]['name'];

export const roleTypes = [
	{ name: 'CEO', icon: null },
	{ name: 'CFO', icon: LucideBanknote },
	{ name: 'HR', icon: LucideUsersRound },
	{ name: 'CAO', icon: LucideComputer },
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
	choices_ids: string[];
	round_schock_expected_profit_score?: number;
	round_schock_liquidity_score?: number;
	round_schock_solvency_score?: number;
	round_schock_IT_score?: number;
	round_schock_capacity_score?: number;
}

export interface Team extends Scores {
	id: string;
	name: string;
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
	text: string;
	revealedInRounds: number;
	revealdForRoles?: roleType[];
	message_sender: string;
	message_sender_image: string;
	time?: string;
}
