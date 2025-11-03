import { Database } from 'sqlite';
import { IAddUos } from '../interfaces';

//-----------------
//----   Add   ----
//-----------------
async function addUos(db: Database, data: IAddUos) {
	const resAdd = await db.run(
		`INSERT INTO users_online_status (user_id, status) VALUES (?, ?)`,
		data.user_id,
		data.status
	);
	return resAdd.lastID;
}

//-----------------
//----   Get   ----
//-----------------
async function getUosById(db: Database, id: number) {
	return await db.get(`SELECT * FROM users_online_status WHERE id = ?`, id);
}


async function getLatestStatusByUserId(db: Database, user_id: number) {
	const result = await db.get(
		`SELECT status FROM users_online_status WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
		user_id
	);
	return result || null;
}

async function getAllLatestStatuses(db: Database) {
	return await db.all(`
		SELECT user_id, status, MAX(created_at) as created_at
		FROM users_online_status
		GROUP BY user_id
		ORDER BY created_at DESC
	`);
}

async function getLatestStatusesForUserIds(db: Database, user_ids: number[]) {
	const placeholders = user_ids.map(() => '?').join(', ');
	const query = `
		SELECT user_id, status, MAX(created_at) as created_at
		FROM users_online_status
		WHERE user_id IN (${placeholders})
		GROUP BY user_id
		ORDER BY created_at DESC
	`;
	return await db.all(query, ...user_ids);
}

//-----------------
//---- Delete  ----
//-----------------
async function deleteUosStatus(db: Database, id: number) {
	await db.run(`DELETE FROM users_online_status WHERE id = ?`, id);
}



export const uos_models = {
	addUos,
	getUosById,
	getLatestStatusByUserId,
	getAllLatestStatuses,
	getLatestStatusesForUserIds,
	deleteUosStatus,
};
