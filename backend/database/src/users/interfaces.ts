export interface Users {
  id?: number;
  username: string;
  username_in_tournaments?: string
  password: string;
  email: string;
  role?: string;
  sub?: string;
  twoFASecret?: string;
  is2faEnabled?: boolean;
  created_at?: string; // REMINDER: set by DB and not de API
  updated_at?: string; // REMINDER: set by DB and not de API
}

export interface UsersUpdateData {
  data: string;
}
