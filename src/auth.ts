import { randomUUID } from 'crypto';
import { getData, setData, token } from './dataStore';
import validator from 'validator';

interface ErrorReturn {
    error: string
}

interface AuthReturn {
    token: string
}

interface UserDetailsReturn {
    user: {
        userId: number,
        name: string,
        email: string,
        numSuccessfulLogins: number,
        numFailedPasswordsSinceLastLogin: number,
    }
}

// Constants
const PATTERN = /^[a-zA-Z\s\-']+$/;
const LETTERS = /[a-zA-Z]/;
const NUMS = /\d/;

export function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): AuthReturn | ErrorReturn {
  const data = getData();

  // Checking if email is valid
  if (validator.isEmail(email) === false) {
    return { error: 'Invalid Entry' };
  }

  // Checking if email is in use by another user
  for (const user of data.users) {
    if (user.email === email) {
      return { error: 'Email Already in Use' };
    }
  }
  // Checking if first and last name meet the required conditions
  if (nameFirst.length < 2 || nameFirst.length > 20 || PATTERN.test(nameFirst) === false) {
    return { error: 'Invalid First Name' };
  }
  if (nameLast.length < 2 || nameLast.length > 20 || PATTERN.test(nameLast) === false) {
    return { error: 'Invalid Last Name' };
  }

  // Checking if password meets the required conditions
  if (password.length < 8 || LETTERS.test(password) === false || NUMS.test(password) === false) {
    return { error: 'Invalid Password' };
  }

  const Id = data.users.length + 1;
  data.users.push({ userId: Id, email: email, password: password, nameFirst: nameFirst, nameLast: nameLast, numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 0 });
  const newToken = startSession(Id);
  const encodeToken = encodeURIComponent(JSON.stringify(newToken));
  setData(data);

  return {
    token: encodeToken
  };
}

export function adminAuthLogin(email: string, password: string) {
  const data = getData();

  // Checking if user with email exists
  const user = data.users.find((user) => user.email === email);
  if (user === undefined) {
    return { error: 'Email does not exist' };
  }

  // Checking whether password entered is incorrect
  if (user.password !== password) {
    user.numFailedPasswordsSinceLastLogin = user.numFailedPasswordsSinceLastLogin + 1;
    return { error: 'Incorrect Password' };
  }

  // Updating details about user
  user.numFailedPasswordsSinceLastLogin = 0;
  user.numSuccessfulLogins = user.numSuccessfulLogins + 1;

  return {
    authUserId: user.userId
  };
}

export function adminUserDetails(authUserId: number): ErrorReturn | UserDetailsReturn {
  const data = getData();

  // Checking if authUserId refers to an invalid user
  const user = data.users.find(({ userId }) => userId === authUserId);
  if (user === undefined) {
    return { error: 'Invalid Entry' };
  }

  // Concatenating first and last name
  const fullName = user.nameFirst + ' ' + user.nameLast;

  return {
    user: {
      userId: authUserId,
      name: fullName,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
    }
  };
}

function startSession(authUserId: number): token {
  const data = getData();

  // If a session does not exist for current user, create a new session
  const findToken = data.tokens.find(({ userId }) => userId === authUserId);
  if (findToken === undefined) {
    const newToken = { userId: authUserId, sessionId: randomUUID() };
    data.tokens.push(newToken);
    return newToken;
  }

  return findToken;
}
