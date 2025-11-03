import { users_model } from './models';
import { Users, UsersUpdateData } from '../interfaces';
import { isUserSame, logic_users } from './logic';

// Add User
// TODO add try catch.
async function handlerAddUser(request: { body: Users }, reply: any, db: any) {
    try {
        // Check if user exists by username or email
        const existingUser = await users_model.getUserByUsernameOrEmail(db, request.body.username, request.body.email);
        if (existingUser) {
            return reply.status(409).send({ msg: 'User already in db' });
        }
        if (request.body.sub) {
            const resIsSub = await users_model.isSubExists(db, request.body.sub);
            if (resIsSub) {
                return reply.status(409).send({ msg: 'Sub already in db' });
            }
        }
        const insertResult = await users_model.addUser(db, request.body);
        if (typeof insertResult.lastID === 'number') {
            const user = await users_model.getUserById(db, insertResult.lastID);
            if (user) {
                return reply.status(201).send(user);
            } else {
                return reply.status(500).send({ error: 'User inserted but not found.' });
            }
        }
        return reply.status(400).send({ error: 'User not inserted.' });
    } catch (err: any) {
        console.error(err);
        return reply.status(500).send({ error: 'Internal server error' });
    }
}

// Get all users
async function handlerGetAllUsers(request: any, reply: any, db: any) {
    try {
        const res = await users_model.getAllUsers(db);
        reply.send(res);
    } catch (err: any) {
        console.error(err);
        reply.status(500).send({ error: 'Internal server error' });
    }
}

// Get user by id
async function handlerGetUserById(request: any, reply: any, db: any) {
    try {
        const res = await users_model.getUserById(db, Number(request.params.id));
        if (res) return reply.send(res);
        reply.status(404).send({ error: 'User not found' });
    } catch (err: any) {
        console.error(err);
        reply.status(500).send({ error: 'Internal server error' });
    }
}

// Get user by email
async function handlerGetUserByEmail(request: any, reply: any, db: any) {
    try {
        const res = await users_model.getUserByEmail(db, request.params.email);
        if (res) return reply.send(res);
        reply.status(404).send({ error: 'User not found' });
    } catch (err: any) {
        console.error(err);
        reply.status(500).send({ error: 'Internal server error' });
    }
}

// Update user by id
async function handlerUpdateUserById(request: { params: { id: string }, body: Users }, reply: any, db: any) {
	try {
		const userId = Number(request.params.id);
		const userExists = await users_model.getUserById(db, userId);
		if (!userExists) {
			return reply.status(404).send({ msg: 'User not found.' });
		}
		if (isUserSame(userExists, request.body)) {
			return reply.status(409).send({ msg: 'nothing to update'});
		}
		if (request.body.sub)
		{
			const resIsSub = users_model.isSubExists(db, request.body.sub);
			if (!resIsSub)
					return reply.status(409).send({msg: 'Sub already in db'});
		}
		await users_model.updateUserById(db, userId, request.body);
		const updatedUser = await users_model.getUserById(db, userId);
		if (updatedUser) {
			return reply.status(200).send(updatedUser);
		} else {
			return reply.status(500).send({ error: 'User update failed.' });
		}
	} catch (err: any) {
		console.error(err);
		return reply.status(500).send({ error: 'Internal server error'});
	}
}

// update by /:type/:id
async function handlerUpdateByTypesAndId(request: { params: { id: string, types: string }, body: UsersUpdateData }, reply: any, db: any) {
  try {
	const userId = Number(request.params.id);
	const type = request.params.types as "username" | "password" | "email" | "username_in_tournaments" | "sub" | "two_fa_secret" | "is_fa_enabled";											// otherwise is going to create an error.
	const data = request.body.data;
	const userExists = await users_model.getUserById(db, userId);
	if (!userExists) {
		return reply.status(404).send({ msg: 'User not found.' });
	}

	if ( type == "email" && (await users_model.isEmailExists(db, data)))
		return reply.status(409).send({ msg: 'data already in db' });

	if ( type == "username_in_tournaments" && (await users_model.isUserNameTournamentExists(db, data)))
		return reply.status(409).send({ msg: 'data already in db' });

	if ( type == "sub" && (await users_model.isSubExists(db, data)))
		return reply.status(409).send({ msg: 'data already in db' });

	if (!(await logic_users.handlerUpdateTypesModels(db, type, userId, data))) {
		return reply.status(500).send({ msg: 'Error while updating data.' });
	}

	return reply.status(200).send({ msg: "User updated" });
  	} catch (err) {
	console.error(err);
	return reply.status(500).send({ msg: "Internal server error" });
	}
}

// delete user by id.
async function handlerDeleteUserById(request: { params: { id: string } }, reply: any, db: any) {
    try {
        const userId = Number(request.params.id);
        const userExists = await users_model.getUserById(db, userId);
        if (!userExists) {
            return reply.status(404).send({ error: 'User not found.' });
        }
        await users_model.deleteUserById(db, userId);
        return reply.status(200).send({ deletedId: userId });
    } catch (err: any) {
        console.error(err);
        reply.status(500).send({ error: 'Internal server error' });
    }
}

async function handlerIsUserIdExists(request: { params: { id: string } }, reply: any, db: any) {
	try {
		const exists = await users_model.isUserIdExists(db, Number(request.params.id));
		if (!exists) {
			return reply.status(404).send({ msg: "User not found in DB" });
		}
		return reply.status(200).send({ exists: true });
	} catch (err) {
		console.error(err);
		return reply.status(500).send({ msg: "Internal server error" });
	}
}


export const users_handlers = {
	handlerAddUser,
	handlerGetAllUsers,
	handlerGetUserById,
	handlerGetUserByEmail,
	handlerUpdateUserById,
	handlerUpdateByTypesAndId,
	handlerDeleteUserById,
	handlerIsUserIdExists,
};