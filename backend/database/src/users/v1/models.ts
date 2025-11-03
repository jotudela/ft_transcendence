import { Database } from "sqlite";
import { Users } from "../interfaces";

async function addUser(db: Database, user: Users) {
  return await db.run(
    "INSERT INTO users (username, username_in_tournaments, password, email, sub) VALUES (?, ?, ?, ?, ?)",
    user.username,
    user.username_in_tournaments,
    user.password,
    user.email,
    user.sub ?? null,
  );
}

//-----------------
//-----  GETs -----
//-----------------

async function getAllUsers(db: Database) {
	return await db.all("SELECT * FROM users");
}

async function getUserByUsernameOrEmail(db: Database, username: string, email: string) {
  return await db.get("SELECT * FROM users WHERE username = ? OR email = ?", username, email);
}

async function getUserById(db: Database, id: number) {
	return await db.get("SELECT * FROM users WHERE id = ?", id);
}

async function getUserByEmail(db: Database, email: string) {
  return await db.get("SELECT * FROM users WHERE email = ?", email);
}



//-----------------
//---- Updates ----
//-----------------

async function updateUserById(db: Database, id: number, user: Users) {
  return await db.run(
    "UPDATE users SET username = ?, username_in_tournaments = ?, password = ?, email = ?, sub = ?, two_fa_secret = ?, is_fa_enabled = ? WHERE id = ?",
    user.username,
    user.username_in_tournaments,
    user.password,
    user.email,
    user.sub ?? null,
    user.twoFASecret ?? null,
    user.is2faEnabled ? 1 : 0,
    id
  );
}


// Update username by id
async function updateUsernameById(db: Database, id: number, username: string) {
  return await db.run(
    "UPDATE users SET username = ? WHERE id = ?",
    username,
    id
  );
}

// Update password by id
async function updatePasswordById(db: Database, id: number, password: string) {
  return await db.run(
    "UPDATE users SET password = ? WHERE id = ?",
    password,
    id
  );
}

// Update email by id
async function updateEmailById(db: Database, id: number, email: string) {
  return await db.run(
    "UPDATE users SET email = ? WHERE id = ?",
    email,
    id
  );
}

// Update username_in_tournaments by id
async function updateUsernameInTournamentsById(db: Database, id: number, usernameInTournaments: string) {
  return await db.run(
    "UPDATE users SET username_in_tournaments = ? WHERE id = ?",
    usernameInTournaments,
    id
  );
}

// Update sub by id
async function updateSubById(db: Database, id: number, sub: string) {
  const finalSub = (sub === "null" || sub === "") ? null : sub;
  return await db.run(
    "UPDATE users SET sub = ? WHERE id = ?",
    finalSub,
    id
  );
}

// Update two_fa_secret by id
async function updateTwoFaSecretById(db: Database, id: number, two_fa_secret: string) {
  return await db.run(
    "UPDATE users SET two_fa_secret = ? WHERE id = ?",
    two_fa_secret,
    id
  );
}

// Update username_in_tournaments by id
async function updateIsFaEnabledById(db: Database, id: number, is_fa_enabled: string) {
  const finalstatus = (is_fa_enabled === "true" || is_fa_enabled === "") ? 1 : 0;
  return await db.run(
    "UPDATE users SET is_fa_enabled = ? WHERE id = ?",
    finalstatus,
    id
  );
}




//-----------------
//---- Deletes ----
//-----------------
async function deleteUserById(db: Database, id: number) {
  return await db.run("DELETE FROM users WHERE id = ?", id);
}

//-----------------
//---- Boleans ----
//-----------------

// REMINDER : will return a 
async function isUserIdExists(db: Database, id: number): Promise<boolean> {
  const res = await db.get("SELECT 1 FROM users WHERE id = ?", id);
  if (res) {
    return true;
  }
  return false;
}

async function isEmailExists(db: Database, email: string): Promise<boolean> {
  const res = await db.get("SELECT 1 FROM users WHERE email = ?", email);
  if (res) {
    return true;
  }
  return false;
}

async function isUserNameTournamentExists(db: Database, userNameTournament: string): Promise<boolean> {
  const res = await db.get("SELECT 1 FROM users WHERE username_in_tournaments = ?", userNameTournament);
  if (res) {
    return true;
  }
  return false;
}

async function isSubExists(db: Database, sub: string): Promise<boolean> {
  const res = await db.get("SELECT 1 FROM users WHERE sub = ?", sub);
  if (res) {
    return true;
  }
  return false;
}

// Check if all user IDs in the array exist in the DB, using optimized queries for 2 or 4 IDs
async function areUserIdsExist(db: Database, ids: (number | null)[]): Promise<boolean> {
  let i = 0;
  while (i < ids.length)
  {
    if (ids[i] == null) {
      i++;
      continue;
    }
    if (!(await isUserIdExists(db, ids[i]!)))   // REMINDER: ids[i] here are strictly non-null. with ids[i]! we force the use (othewise we have an error log from ts)
        return false;
    i++;
  }
  return true;
}

export const users_model = {
  addUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getUserByUsernameOrEmail,
  isUserIdExists,
  areUserIdsExist,
  isSubExists,
  isEmailExists,
  isUserNameTournamentExists,
  getUserByEmail,
  updateUsernameById,
  updatePasswordById,
  updateEmailById,
  updateUsernameInTournamentsById,
  updateSubById,
  updateTwoFaSecretById,
  updateIsFaEnabledById,
};

//-----------------------------
//  Models for images profile
//-----------------------------



async function getImgProfilePathById(db: Database, id: number) {
	return await db.get("SELECT img_profile_path FROM users WHERE id = ?", id);
}
// REMINDER: (true/false) will check if the given user has a profule "img_profile_path" or not.
async function hasProfileImageByUserId(db: Database, user_id: number): Promise<boolean> {
  const res = await db.get(
    "SELECT img_profile_path FROM users WHERE id = ? AND img_profile_path IS NOT NULL AND img_profile_path != ''",
    user_id
  );
  return !!res;
}

// Will update the image path related to a "user_id"
async function updateUserProfileImagePath(db: Database, user_id: number, img_profile_path: string) {
  return await db.run(
    "UPDATE users SET img_profile_path = ? WHERE id = ?",
    img_profile_path,
    user_id
  );
}

// will output only the image path related to an "user_id" or null. 
async function getUserProfileImagePathByUserId(db: Database, user_id: number): Promise<string | null> {
  const res = await db.get(
    "SELECT img_profile_path FROM users WHERE id = ?",
    user_id
  );
  return res?.img_profile_path ?? null;
}

export const users_img = {
  getImgProfilePathById,
  hasProfileImageByUserId,
  updateUserProfileImagePath,
  getUserProfileImagePathByUserId,
}