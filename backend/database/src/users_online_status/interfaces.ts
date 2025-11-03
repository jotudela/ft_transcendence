export interface IAddUos {
	user_id: number;
	status: 'online' | 'offline' | 'unknown';
}

export interface UserOnlineStatusResponse {
	id: number;
	user_id: number;
	status: 'online' | 'offline' | 'unknown';
	created_at: string;
}