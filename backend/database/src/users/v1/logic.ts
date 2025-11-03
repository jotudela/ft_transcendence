import { Users } from '../interfaces';
import { users_model } from './models';

export function isUserSame(a: Users, b: Users): boolean {

  // Only compare relevant fields, ignore extras
  // REMINDER: from the DB we will get fields like created_at or role that are not present in the payload. These will be always different.
  const userA = {
    username: a.username,
    email: a.email,
    password: a.password,
    sub: a.sub ?? "",
    username_in_tournaments: a.username_in_tournaments,
    twoFASecret: a.twoFASecret,
    is2faEnabled: a.is2faEnabled
  };
  const userB = {
    username: b.username,
    email: b.email,
    password: b.password,
    sub: b.sub ?? "",
    username_in_tournaments: b.username_in_tournaments,
    twoFASecret: b.twoFASecret,
    is2faEnabled: b.is2faEnabled
  };

  //console.log('userA:', userA);
  //console.log('userB:', userB);
  // REMINDER: will output a TRUE/FALSE statement out of the 
  const resAreSameUsers = (
    userA.username === userB.username &&
    userA.email === userB.email &&
    userA.password.toString() === userB.password.toString() &&
    userA.sub === userB.sub &&
    userA.username_in_tournaments === userB.username_in_tournaments &&
    userA.twoFASecret === userB.twoFASecret &&
    userA.is2faEnabled === userB.is2faEnabled
  );
  return resAreSameUsers;
}

export async function handlerUpdateTypesModels(
  db: any,
  type: 'username' | 'password' | 'email' | 'username_in_tournaments' | 'sub' | 'two_fa_secret' | 'is_fa_enabled',
  userId: number,
  data: string
) {
  switch (type) {
    case "username":
      return await users_model.updateUsernameById(db, userId, data);
    case "password":
      return await users_model.updatePasswordById(db, userId, data);
    case "email":
      return await users_model.updateEmailById(db, userId, data);
    case "username_in_tournaments":
      return await users_model.updateUsernameInTournamentsById(db, userId, data);
    case "sub":
      return await users_model.updateSubById(db, userId, data);
    case "two_fa_secret":
      return await users_model.updateTwoFaSecretById(db, userId, data);
    case "is_fa_enabled":
      return await users_model.updateIsFaEnabledById(db, userId, data);
    default:
      return false;
  }
}

export const logic_users = {
  isUserSame,
  handlerUpdateTypesModels,
}
