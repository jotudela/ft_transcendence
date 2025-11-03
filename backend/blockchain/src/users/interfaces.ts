// Interface pour le tournoi
export interface Tournament {
  tournament_type: '1vs1' | '2vs2';
  tournament_name: string;
  started_at: string;
  ended_at: string;
  first_position_user_id_1: number;
  first_position_user_id_2: number | null;
  second_position_user_id_1: number;
  second_position_user_id_2: number | null;
  thirth_position_user_id_1: number | null;
  thirth_position_user_id_2: number | null;
  fourth_position_user_id_1: number | null;
  fourth_position_user_id_2: number | null;
  winner_user_id_1: number;
  winner_user_id_2: number | null;
}

// Interface pour l'historique des parties
export interface GameHistory {
  tournament_id: number | null;
  game_type: '1vs1' | '2vs2';
  team_1_player_user_id_1: number;
  team_1_player_user_id_2: number | null;
  team_2_player_user_id_3: number;
  team_2_player_user_id_4: number | null;
  started_at: string;
  ended_at: string;
  score_team_1: number;
  score_team_2: number;
  winner_user_id_1: number;
  winner_user_id_2: number | null;
}

// Interface pour le body complet du endpoint
export interface TournamentRequestBody {
  tournament: Tournament;
  games_history: GameHistory[];
}

// Interface pour l'objet DeployBody envoyé à blockchain
export interface DeployBody {
  id: number[];
  nicknames: string[];
  ranks: number[];
  points: number[];
  name: string;
}