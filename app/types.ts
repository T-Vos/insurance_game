export enum PageState {
	ROUNDS,
	RULES_CONFIG,
	TEAMS_CONFIG,
}

export interface RevealMessage {
	text: string;
	revealedInRounds: number;
}

export interface Choice {
	id: number;
	description: string;
	score: number;
	capacity: number;
	duration: number;
	reveals: RevealMessage[];
}

export interface Round {
	round_id: string;
	round_name: string;
	choices: Choice[];
}

export interface ChosenItem extends Choice {
	round_id: string;
	choice_id: number;
	roundIndex: number;
}

export interface Team {
	id: string;
	teamName: string;
	choices: ChosenItem[];
	score: number;
	capacity: number;
}
