export interface ChosenItem {
	round_id: number | string;
	choice_id: number | string;
	roundIndex: number;
	score: number;
}

export interface Team {
	id: number | string;
	teamName: string;
	score: number;
	capacity: number;
	choices: ChosenItem[];
	isEditing?: boolean;
	editingName?: string;
}

export interface Choice {
	id: number | string;
	description: string;
	score: number;
	capacity: number;
	duration: number;
}

export interface Round {
	round_id: number | string;
	round_name: string;
	choices: Choice[];
}

export enum PageState {
	ROUNDS = 'rounds',
	RULES_CONFIG = 'rulesConfig',
	TEAMS_CONFIG = 'teamsConfig',
}
