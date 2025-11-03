export interface Friends {
	id?: number;
	status: 'pending' | 'accepted' | 'rejected';
	user_id_min: number;
	user_id_max: number;
	requested_by: number;
}

export interface IncomeFriendRequest  {
	id?: number;					// For delete or update is important
	status?: 'pending' | 'accepted' | 'rejected';
	user_id_1: number;
	user_id_2: number;
	requested_by: number;
}

export interface UpdateIncomeFriendRequest {
	id: number;
	status: 'accepted' | 'rejected';
}