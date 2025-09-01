/**
 * Represents the different pages or views in the application.
 */
export enum PageState {
	ROUNDS = 'ROUNDS',
	RULES_CONFIG = 'RULES_CONFIG',
	TEAMS_CONFIG = 'TEAMS_CONFIG',
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
	description: string;
	duration?: number | null;
	reveals: RevealMessage[];
	interactionEffects?: InteractionEffect[];
	choice_index?: number | null;
	blockeding_circumstances?: blockedingCircumstance[]; // Circumstances that block the choice
}

export interface blockedingCircumstance {
	id: string;
}

/**
 * Represents a game round, containing a set of choices.
 */
export interface Round {
	round_id: string | number;
	round_duration: number; // Duration in seconds
	round_started_at: number | null | string;
	round_finished_at: number | null | string;
	round_index: number;
	round_name: string;
	choices?: Choice[] | null;
	round_schock_expected_profit_score?: number;
	round_schock_liquidity_score?: number;
	round_schock_solvency_score?: number;
	round_schock_IT_score?: number;
	round_schock_capacity_score?: number;
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
}

export interface Team extends Scores {
	editingName?: string | undefined;
	isEditing?: boolean;
	id: string;
	teamName: string;
	choices: TeamChoice[]; // Each entry tracks the choice made in a round
}

/**
 * Represents the main game state stored in a single Firestore document.
 */
export interface Game {
	id: string;
	key: string;
	name: string;
	rounds?: Round[] | null;
	teams: Team[];
	currentRoundIndex: number;
	currentRoundId: Round['round_id'] | null;
	gameStartedAt: number | null;
	gameFinishedAt: number | null;
	createdAt: number;
	admin_user_ids: string[];
	start_expected_profit_score?: number;
	start_liquidity_score?: number;
	start_solvency_score?: number;
	start_IT_score?: number;
	start_capacity_score?: number;
}

/**
 * Represents a message that is revealed later in the game.
 */
export interface RevealMessage {
	text: string;
	revealedInRounds: number;
}
