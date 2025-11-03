import { GamesHistory } from '../games_history/interfaces';			// REMINDER : oficial interface of game_history is here. no need to do a new one.

export interface Tournament {
	id?: number;
	tournament_name: string;
	tournament_type: '1vs1' | '2vs2';
	contract_id: string;
	contract_id_created_at: string;
	started_at: string;
	ended_at: string;
	created_at?: string;
	first_position_user_id_1: number | null;
	first_position_user_id_2?: number | null;
	second_position_user_id_1: number | null;
	second_position_user_id_2?: number | null;
	thirth_position_user_id_1?: number | null;
	thirth_position_user_id_2?: number | null;
	fourth_position_user_id_1?: number | null;
	fourth_position_user_id_2?: number | null;
	winner_user_id_1: number | null;
	winner_user_id_2?: number | null;
}

export interface TournamentPayload {
	tournament: Tournament;
	games_history: GamesHistory[];
}