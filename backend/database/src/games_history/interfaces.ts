export interface GamesHistory {
	id?: number;
	tournament_id?: number;
	game_type: '1vs1' | '2vs2';
	team_1_player_user_id_1: number;
	team_1_player_user_id_2?: number;
	team_2_player_user_id_3: number;
	team_2_player_user_id_4?: number;
	started_at: string;
	ended_at: string;
	created_at?: string;
	score_team_1: number;
	score_team_2: number;
	winner_user_id_1: number;
	winner_user_id_2?: number;
}

export interface ArrGamesHistory {
	games_history: GamesHistory[];
}