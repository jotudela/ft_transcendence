-- Clean up existing tables for development
DROP TABLE IF EXISTS games_history;
DROP TABLE IF EXISTS tournaments;
DROP TABLE IF EXISTS users;
DROP TRIGGER IF EXISTS update_users_updated_at;


-- users_online_status
CREATE TABLE IF NOT EXISTS users_online_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('online', 'offline')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS games_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER,
  game_type TEXT CHECK(game_type IN ('1vs1', '2vs2')),
  team_1_player_user_id_1 INTEGER NOT NULL,
  team_1_player_user_id_2 INTEGER,
  team_2_player_user_id_3 INTEGER NOT NULL,
  team_2_player_user_id_4 INTEGER,
  started_at TEXT NOT NULL,
  ended_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  score_team_1 INTEGER NOT NULL,
  score_team_2 INTEGER NOT NULL,
  winner_user_id_1 INTEGER NOT NULL,
  winner_user_id_2 INTEGER,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
  FOREIGN KEY (team_1_player_user_id_1) REFERENCES users(id),
  FOREIGN KEY (team_1_player_user_id_2) REFERENCES users(id),
  FOREIGN KEY (team_2_player_user_id_3) REFERENCES users(id),
  FOREIGN KEY (team_2_player_user_id_4) REFERENCES users(id),
  FOREIGN KEY (winner_user_id_1) REFERENCES users(id),
  FOREIGN KEY (winner_user_id_2) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS tournaments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_name TEXT NOT NULL,
  tournament_type TEXT CHECK(tournament_type IN ('1vs1', '2vs2')),
  contract_id TEXT UNIQUE NOT NULL,
  contract_id_created_at TEXT UNIQUE NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  first_position_user_id_1 INTEGER NOT NULL,
  first_position_user_id_2 INTEGER,
  second_position_user_id_1 INTEGER NOT NULL,
  second_position_user_id_2 INTEGER,
  thirth_position_user_id_1 INTEGER,
  thirth_position_user_id_2 INTEGER,
  fourth_position_user_id_1 INTEGER,
  fourth_position_user_id_2 INTEGER,
  winner_user_id_1 INTEGER NOT NULL,
  winner_user_id_2 INTEGER,
  FOREIGN KEY (first_position_user_id_1) REFERENCES users(id),
  FOREIGN KEY (first_position_user_id_2) REFERENCES users(id),
  FOREIGN KEY (second_position_user_id_1) REFERENCES users(id),
  FOREIGN KEY (second_position_user_id_2) REFERENCES users(id),
  FOREIGN KEY (thirth_position_user_id_1) REFERENCES users(id),
  FOREIGN KEY (thirth_position_user_id_2) REFERENCES users(id),
  FOREIGN KEY (fourth_position_user_id_1) REFERENCES users(id),
  FOREIGN KEY (fourth_position_user_id_2) REFERENCES users(id),
  FOREIGN KEY (winner_user_id_1) REFERENCES users(id),
  FOREIGN KEY (winner_user_id_2) REFERENCES users(id)
);

-- Friends
CREATE TABLE IF NOT EXISTS friends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id_min INTEGER NOT NULL,
  user_id_max INTEGER NOT NULL,
  requested_by INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id_min, user_id_max),                   -- Friends row are going to be unique related to Uniqueness in "user_id_min" -> "user_id_max"
  FOREIGN KEY (user_id_min) REFERENCES users(id),
  FOREIGN KEY (user_id_max) REFERENCES users(id),
  FOREIGN KEY (requested_by) REFERENCES users(id)
);

-- Trigger to update 'updated_at' on row update for tabme "friends" 
CREATE TRIGGER IF NOT EXISTS update_friends_updated_at
AFTER UPDATE ON friends
FOR EACH ROW
BEGIN
  UPDATE friends SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  username_in_tournaments TEXT UNIQUE,
  password INTEGER NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin', 'service', 'bot')),
  sub TEXT UNIQUE,
  two_fa_secret TEXT,
  is_fa_enabled  INTEGER NOT NULL DEFAULT 0 CHECK(is_fa_enabled  IN (0,1)),
  img_profile_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Trigger to update 'updated_at' on row update for table "users"
CREATE TRIGGER IF NOT EXISTS update_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;


-- Bots
INSERT INTO users (username, password, email, username_in_tournaments,role)
VALUES ('easy', '$argon2id$v=19$m=65536,t=3,p=4$xAu/YZ6VJ0JRPw1qHY2fZQ$Vu+rjU/LOxxFlonUeXIuIVpaHDSbRSiJopEB6bHLvq8', 'easy@g.1', 'bot_easy','bot');

INSERT INTO users (username, password, email, username_in_tournaments,role)
VALUES ('medium', '$argon2id$v=19$m=65536,t=3,p=4$xAu/YZ6VJ0JRPw1qHY2fZQ$Vu+rjU/LOxxFlonUeXIuIVpaHDSbRSiJopEB6bHLvq8', 'medium@g.1', 'bot_medium','bot');

INSERT INTO users (username, password, email, username_in_tournaments,role)
VALUES ('hard', '$argon2id$v=19$m=65536,t=3,p=4$xAu/YZ6VJ0JRPw1qHY2fZQ$Vu+rjU/LOxxFlonUeXIuIVpaHDSbRSiJopEB6bHLvq8', 'hard@g.1', 'bot_hard','bot');

-- Dummy users 
INSERT INTO users (username, password, email, username_in_tournaments,role)
VALUES ('dumy_1', '$argon2id$v=19$m=65536,t=3,p=4$xAu/YZ6VJ0JRPw1qHY2fZQ$Vu+rjU/LOxxFlonUeXIuIVpaHDSbRSiJopEB6bHLvq8', '1@g.1', 'dummy_user_1' ,'user');

INSERT INTO users (username, password, email, username_in_tournaments,role)
VALUES ('dumy_2', '$argon2id$v=19$m=65536,t=3,p=4$xAu/YZ6VJ0JRPw1qHY2fZQ$Vu+rjU/LOxxFlonUeXIuIVpaHDSbRSiJopEB6bHLvq8', '2@g.2', 'dummy_user_2' ,'user');

INSERT INTO users (username, password, email, username_in_tournaments,role)
VALUES ('dumy_3', '$argon2id$v=19$m=65536,t=3,p=4$xAu/YZ6VJ0JRPw1qHY2fZQ$Vu+rjU/LOxxFlonUeXIuIVpaHDSbRSiJopEB6bHLvq8', '3@g.3', 'dummy_user_3' ,'user');

INSERT INTO users (username, password, email, username_in_tournaments,role)
VALUES ('dumy_4', '$argon2id$v=19$m=65536,t=3,p=4$xAu/YZ6VJ0JRPw1qHY2fZQ$Vu+rjU/LOxxFlonUeXIuIVpaHDSbRSiJopEB6bHLvq8', '4@g.4', 'dummy_user_4' ,'user');
