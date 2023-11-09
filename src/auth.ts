import { randomUUID, createHash } from 'crypto';
import { getData, setData, token } from './dataStore';
import validator from 'validator';
import HTTPError from 'http-errors';

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
    throw HTTPError(400, 'Invalid Email Entered');
  }

  // Checking if email is in use by another user
  for (const user of data.users) {
    if (user.email === email) {
      throw HTTPError(400, 'Entered Email is Already in Use');
    }
  }
  // Checking if first and last name meet the required conditions
  if (nameFirst.length < 2 || nameFirst.length > 20 || PATTERN.test(nameFirst) === false) {
    throw HTTPError(400, 'Invalid First Name');
  }
  if (nameLast.length < 2 || nameLast.length > 20 || PATTERN.test(nameLast) === false) {
    throw HTTPError(400, 'Invalid Last Name');
  }

  // Checking if password meets the required conditions
  if (password.length < 8 || LETTERS.test(password) === false || NUMS.test(password) === false) {
    throw HTTPError(400, 'Invalid Password');
  }

  const Id = data.users.length + 1;
  data.users.push({
    userId: Id,
    email: email,
    password: hashPassword(password),
    nameFirst: nameFirst,
    nameLast: nameLast,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    oldPasswords: [hashPassword(password)]
  });
  const newToken = startSession(Id);
  const encodeToken = encodeURIComponent(JSON.stringify(newToken));
  setData(data);

  return {
    token: encodeToken
  };
}

export function adminAuthLogin(email: string, password: string): AuthReturn | ErrorReturn {
  const data = getData();

  // Checking if user with email exists
  const user = data.users.find((user) => user.email === email);
  if (user === undefined) {
    throw HTTPError(400, 'Email does not exist');
  }

  const passwordHashed = hashPassword(password);

  // Checking whether password entered is incorrect
  if (user.password !== passwordHashed) {
    user.numFailedPasswordsSinceLastLogin = user.numFailedPasswordsSinceLastLogin + 1;
    throw HTTPError(400, 'Incorrect Password');
  }

  // Updating details about user
  user.numFailedPasswordsSinceLastLogin = 0;
  user.numSuccessfulLogins = user.numSuccessfulLogins + 1;

  const newToken = startSession(user.userId);
  const encodeToken = encodeURIComponent(JSON.stringify(newToken));

  return {
    token: encodeToken
  };
}

export function adminUserDetails(token: string): ErrorReturn | UserDetailsReturn {
  const data = getData();

  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    throw HTTPError(401, 'Token is empty or invalid');
  }

  // convert token to an object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // finds the user that is corresponding to the token
  const user = data.users.find((user) => user.userId === tempToken.userId);

  // Concatenating first and last name
  const fullName = user.nameFirst + ' ' + user.nameLast;

  return {
    user: {
      userId: user.userId,
      name: fullName,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
    }
  };
}

export function adminAuthLogout(token: string): ErrorReturn | object {
  const data = getData();

  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    throw HTTPError(401, 'Token is empty or invalid');
  }

  // convert token to an object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // Reintialises the tokens array without the token to be logged out
  data.tokens = data.tokens.filter(currentToken => !isEqual(currentToken, tempToken));

  return {};
}

export function adminUpdateUserDetails(token: string, email: string, nameFirst: string, nameLast: string): ErrorReturn | object {
  const data = getData();

  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    return { error: 'Token is empty or invalid' };
  }

  // convert token to an object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // finds the user that is corresponding to the token and updates its details
  const userToUpdate = data.users.find((user) => user.userId === tempToken.userId);

  // Checking if email is valid
  if (validator.isEmail(email) === false) {
    return { error: 'Invalid Entry' };
  }
  // Checking if email is in use by another user that is not the current authorised user
  for (const user of data.users) {
    if (user.email === email && userToUpdate.email !== email) {
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

  Object.assign(userToUpdate, { email: email, nameFirst: nameFirst, nameLast: nameLast });
  setData(data);

  return {};
}

export function adminUserPassword(token: string, oldPassword: string, newPassword: string): ErrorReturn | object {
  const data = getData();

  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    return { error: 'Token is empty or invalid' };
  }

  // convert token to an object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // finds the user that is corresponding to the token and updates its details
  const userToUpdate = data.users.find((user) => user.userId === tempToken.userId);

  // Check if Old Password is not the correct old password
  if (userToUpdate.password !== oldPassword) {
    return { error: 'Old Password is not the correct old password' };
  }

  // Check if Old Password and New Password match exactly
  if (oldPassword === newPassword) {
    return { error: 'Old Password and New Password match exactly' };
  }

  // Check if New Password has already been used before by this user
  if (userToUpdate.oldPasswords.find(currentOldPassword => currentOldPassword === newPassword) !== undefined) {
    return { error: 'New Password has already been used before by this user' };
  }

  // Checking if new password meets the required conditions
  if (newPassword.length < 8 || LETTERS.test(newPassword) === false || NUMS.test(newPassword) === false) {
    return { error: 'Invalid  New Password' };
  }

  userToUpdate.password = newPassword;
  userToUpdate.oldPasswords.push(newPassword);

  return {};
}

/// /////////////////////////// Helper Functions ////////////////////////////////
function hashPassword(password: string) {
  const hash = createHash('sha256').update(password).digest('hex');
  return hash;
}

function isEqual(currentToken: token, tempToken: token): boolean {
  return JSON.stringify(currentToken) === JSON.stringify(tempToken);
}

function checkValidToken(token: string): boolean {
  const data = getData();

  // Checking if a token exists
  if (token === '') {
    return true;
  }

  try {
    // Check the function that might throw a SyntaxError
    JSON.parse(decodeURIComponent(token));
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Handle the SyntaxError here
      return true;
    }
  }

  // convert token to an object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // Checks if there is a valid token
  if (!tempToken ||
    data.tokens.find((currentToken) => currentToken.userId === tempToken.userId) ===
    undefined) {
    return true;
  }

  return false;
}

function startSession(authUserId: number): token {
  const data = getData();

  const findToken = data.tokens.find((currentToken) => currentToken.userId === authUserId);
  if (findToken === undefined) {
    // If a session does not exist for current user, create a new session
    const newToken = { userId: authUserId, sessionId: randomUUID() };
    data.tokens.push(newToken);
    setData(data);
    return newToken;
  } else {
    // If a session exists, update the sessionId
    data.tokens = data.tokens.filter(currentToken => !isEqual(currentToken, findToken));
    const newToken = { userId: authUserId, sessionId: randomUUID() };
    data.tokens.push(newToken);
    setData(data);
    return newToken;
  }
}
