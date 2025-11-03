export interface DeployBody1 {
  username: string;
  password: string;
  email: string;
  username_in_tournaments?: string;
}

export interface LoginBody1 {
  email: string;
  password: string;
}

export interface DeployBody2 {
  id?: number;
  username: string;
  password: string;
  email: string;
  username_in_tournaments?: string;
  sub?: string;
}

export interface updateBody2 {
  id?: number,
  username?: string;
  password?: string;
  email?: string;
  username_in_tournaments?: string;
  sub?: string;
  two_fa_secret?: string;
  is_fa_enabled?: boolean;
}

export interface UsersUpdateData {
  data: string;
}

export interface LoginBody2 {
  id?: number;
  email: string;
  password: string;
  is_fa_enabled: string;
  code?: string;
}

export interface UserApiResponse {
  id: string;
  email: string;
  role: string;
  username: string;
  username_in_tournaments: string;
  two_fa_secret?: string;
  is_fa_enabled?: boolean;
  sub?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  role: string;
  username: string;
  username_in_tournaments: string;
  sub?: string;
  is_fa_enabled?: boolean;
}

export interface sendRequestFriend {
  user_id_1: number;
  user_id_2: number;
  requested_by: number;
}

export interface updateFriends {
  id: number;
  status: string;
}

export interface deleteFriends {
  user_id_1: number;
  user_id_2: number;
}