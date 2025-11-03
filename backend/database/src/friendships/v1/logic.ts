import { users_model } from '../../users/v1/models';
import { friends_model } from './models';
import {IncomeFriendRequest, UpdateIncomeFriendRequest} from "../interfaces"

async function IsPostPayloadCorrect (db: any, payload: IncomeFriendRequest ): Promise<boolean>
{
	if (payload.user_id_1 == payload.user_id_2)
		return false;
	
	if (payload.user_id_1 != payload.requested_by && payload.user_id_2 != payload.requested_by )
		return false;
	
	const arr_to_check_userIds = [payload.user_id_1, payload.user_id_2];
	if (!(await users_model.areUserIdsExist(db, arr_to_check_userIds)))
		return false;

	if (await friends_model.getByFriendship(db, payload))
		return false;

	return true;
}

// REMINDER: we can only update friendships with status 'pending'.
async function IsUpdatePayloadCorrect (db: any, payload: UpdateIncomeFriendRequest): Promise<boolean> {
	const resGet = await friends_model.getFriendshipById(db, payload.id);
	if (!resGet)
		return false;
	if (resGet.status != 'pending')
		return false;
	return true;
}


async function createUpdatePayload(db: any, payload: UpdateIncomeFriendRequest): Promise<IncomeFriendRequest | null> {
	const resFriendship = await friends_model.getFriendshipById(db, payload.id);
	if (!resFriendship)
		return null;

	const updatePayload: IncomeFriendRequest = {
		id: resFriendship.id,
		user_id_1: resFriendship.user_id_min,
		user_id_2: resFriendship.user_id_max,
		requested_by: resFriendship.requested_by,
		status: payload.status
	};
	return updatePayload;
}

export const f_logic = {
	IsPostPayloadCorrect,
	IsUpdatePayloadCorrect,
	createUpdatePayload
}