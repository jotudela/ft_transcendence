import { Database } from "sqlite";
import { IncomeFriendRequest  } from "../interfaces";

// Add a new friend request
async function addFriendRequest(db: Database, income_friend_request: IncomeFriendRequest  ) {
    const minId = Math.min(income_friend_request.user_id_1, income_friend_request.user_id_2);
    const maxId = Math.max(income_friend_request.user_id_1, income_friend_request.user_id_2);
    return await db.run(
        `INSERT INTO friends (
            user_id_min, user_id_max, requested_by, status
        ) VALUES (?, ?, ?, ?)`,
        minId,
        maxId,
        income_friend_request.requested_by,
        "pending"
    );
}

// Get all friends for a user (accepted only)
async function getAllAcceptedFriendshipsByUserId(db: Database, user_id: number) {
    return await db.all(
        `SELECT * FROM friends
         WHERE (user_id_min = ? OR user_id_max = ?)
         AND status = 'accepted'`,
        user_id, user_id
    );
}

// Dynamic: Get all friendships for a user by status ('pending' | 'accepted' | 'rejected')
async function getAllFriendshipsByUserIdAndStatus(
    db: Database,
    user_id: number,
    status: 'pending' | 'accepted' | 'rejected'
) {
    return await db.all(
        `SELECT * FROM friends
         WHERE (user_id_min = ? OR user_id_max = ?)
         AND status = ?`,
        user_id, user_id, status
    );
}

// Get all friendships by user_id. 
async function getAllFriendshipsByUserId(db: Database, user_id: number) {
    return await db.all(
        `SELECT * FROM friends WHERE (user_id_min = ? OR user_id_max = ?)`,
        user_id, user_id
    );
}

async function getFriendshipById(db: Database, id:number) {
    return await db.get(`SELECT * FROM friends WHERE id = ?`, id);
}

// Get a specific friendship (for checking existence)
async function getByFriendship(db: Database, income_friend_request: IncomeFriendRequest  ) {
    const minId = Math.min(income_friend_request.user_id_1, income_friend_request.user_id_2);
    const maxId = Math.max(income_friend_request.user_id_1, income_friend_request.user_id_2);
    return await db.get(`SELECT * FROM friends WHERE user_id_min = ? AND user_id_max = ?`, minId, maxId);
}

async function getAllByFriendshipStatus(db: Database, status:string) {
    return await db.all(`SELECT * FROM friends WHERE status = ?`, status);
}

// REMINDER : we can only update "pending" friendshipt.
// Update friendship status (accept/reject)
async function updateFriendshipStatus(db: Database, income_friend_request: IncomeFriendRequest  ) {
    const minId = Math.min(income_friend_request.user_id_1, income_friend_request.user_id_2);
    const maxId = Math.max(income_friend_request.user_id_1, income_friend_request.user_id_2);
    return await db.run(
        `UPDATE friends SET status = ? WHERE user_id_min = ? AND user_id_max = ?`,
        income_friend_request.status,
        minId,
        maxId
    );
}

async function deleteFriendshipByUserIds(db: Database, income_friend_request: IncomeFriendRequest  ) {
    const minId = Math.min(income_friend_request.user_id_1, income_friend_request.user_id_2);
    const maxId = Math.max(income_friend_request.user_id_1, income_friend_request.user_id_2);
    return await db.run(`DELETE FROM friends WHERE user_id_min = ? AND user_id_max = ?`, minId, maxId );
}

async function deleteFriendshipById(db: Database, id: number ) { 
    return await db.run(`DELETE FROM friends WHERE id = ?`, id );
}



export const friends_model = {
    addFriendRequest,
    getAllAcceptedFriendshipsByUserId,
    getAllByFriendshipStatus,
    getByFriendship,
    getFriendshipById,
    updateFriendshipStatus,
    deleteFriendshipByUserIds,
    deleteFriendshipById,
    getAllFriendshipsByUserId,
    getAllFriendshipsByUserIdAndStatus,
};