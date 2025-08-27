/**
 * Represents the different pages or views in the application.
 */
export enum PageState {
	ROUNDS = 'ROUNDS',
	RULES_CONFIG = 'RULES_CONFIG',
	TEAMS_CONFIG = 'TEAMS_CONFIG',
}

/**
 * Represents a single choice or strategy within a game round.
 */
export interface Choice {
	id: string;
	description: string;
	expected_profit_score?: number; // Winst in Euro's 150
	liquidity_score?: number; // Liquiditeit in Euros 250
	solvency_score?: number; // Kapitaal in percentage
	IT_score?: number; // IT/OPS in percentage 90 %
	capacity_score?: number; // ORG percentage 75 %
	duration: number | null;
	reveals: RevealMessage[];
	interactionEffects?: InteractionEffect[];
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
	choices: Choice[];
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
export interface ChosenItem {
	round_id: Round['round_id'];
	choice_id: Choice['id'];
	roundIndex: Round['round_index'];
	saved: boolean;
}

/**
 * Represents a team, including its name, score, capacity, and a list of choices they have made.
 */
export interface Team {
	id: string | number;
	teamName: string;
	choices: ChosenItem[];
	expected_profit_score?: number; // Winst in Euro's 150
	liquidity_score?: number; // Liquiditeit in Euros 250
	solvency_score?: number; // Kapitaal in percentage
	IT_score?: number; // IT/OPS in percentage 90 %
	capacity_score?: number; // ORG percentage 75 %
	isEditing?: boolean;
	editingName?: string | undefined;
}

/**
 * Represents the main game state stored in a single Firestore document.
 */
export interface Game {
	id: string;
	key: string;
	name: string;
	rounds: Round[];
	teams: Team[];
	currentRoundIndex: number;
	currentRoundId: Round['round_id'] | null;
	gameStartedAt: number | null;
	gameFinishedAt: number | null;
	createdAt: number;
	admin_user_ids: string[];
}

/**
 * Represents a message that is revealed later in the game.
 */
export interface RevealMessage {
	text: string;
	revealedInRounds: number;
}
