// New .ts file to implement tests for auth.ts functions through the server

import request from 'sync-request-curl';
import { port, url } from './config.json';
import { clearRequest } from './other.test';
const SERVER_URL = `${url}:${port}`;

const ERROR = { error: expect.any(String) };

/// ////////////////////// Request Functions ////////////////////////////
export function authRegisterRequest(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/register',
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast
      }
    }
  );
  return JSON.parse(res.body as string);
}

export function authLoginRequest(email: string, password: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/login',
    {
      json: {
        email: email,
        password: password,
      }
    }
  );
  return JSON.parse(res.body as string);
}

export function userDetailsRequest(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/user/details',
    {
      qs: {
        token
      }
    }
  );
  return JSON.parse(res.body.toString());
}

export function authLogoutRequest(token: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/logout',
    {
      json: {
        token: token
      }
    }
  );
  return JSON.parse(res.body as string);
}

export function updateUserDetailsRequest(token: string, email: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/user/details',
    {
      json: {
        token: token,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast
      }
    }
  );
  return JSON.parse(res.body as string);
}

export function updateUserPasswordRequest(token: string, oldPassword: string, newPassword: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/user/password',
    {
      json: {
        token: token,
        oldPassword: oldPassword,
        newPassword: newPassword
      }
    }
  );
  return JSON.parse(res.body as string);
}

/// //////////////////////////// Tests /////////////////////////////////

beforeEach(() => {
  clearRequest();
});

describe('Tests for adminAuthRegister', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Invalid Email', () => {
    expect(authRegisterRequest('InvalidEmailmail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual(ERROR);
    expect(authRegisterRequest('@mail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual(ERROR);
    expect(authRegisterRequest('InvalidEmail@', 'password123', 'Pedro', 'Gonzalez')).toEqual(ERROR);
    expect(authRegisterRequest('InvalidEmail@mail', 'password123', 'Pedro', 'Gonzalez')).toEqual(ERROR);
    expect(authRegisterRequest('InvalidEmail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual(ERROR);
  });

  test('Invalid first name', () => {
    expect(authRegisterRequest('InvalidEmail@gmail.com', 'password123', 'Pedro123', 'Gonzalez')).toEqual(ERROR);
    expect(authRegisterRequest('InvalidEmail@gmail.com', 'password123', 'P', 'Gonzalez')).toEqual(ERROR);
    expect(authRegisterRequest('InvalidEmail@gmail.com', 'password123', 'Pedrooooooooooooooooo', 'Gonzalez')).toEqual(ERROR);
  });

  test('Invalid last name', () => {
    expect(authRegisterRequest('InvalidEmail@gmail.com', 'password123', 'Pedro', 'Gonzalez123')).toEqual(ERROR);
    expect(authRegisterRequest('InvalidEmail@gmail.com', 'password123', 'Pedro', 'G')).toEqual(ERROR);
    expect(authRegisterRequest('InvalidEmail@gmail.com', 'password123', 'Pedro', 'Gonzalezzzzzzzzzzzzzz')).toEqual(ERROR);
  });

  test('Invalid password', () => {
    expect(authRegisterRequest('InvalidEmail@gmail.com', 'pass123', 'Pedro', 'Gonzalez')).toEqual(ERROR);
    expect(authRegisterRequest('InvalidEmail@gmail.com', 'password', 'Pedro', 'Gonzalez')).toEqual(ERROR);
    expect(authRegisterRequest('InvalidEmail@gmail.com', '12345678', 'Pedro', 'Gonzalez')).toEqual(ERROR);
  });

  test('Valid Tests with same email error', () => {
    expect(authRegisterRequest('ValidEmail1@gmail.com', 'pass1234', 'Pedro', 'Gonzalez')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail2@gmail.com', 'password123', 'Ga', 'Gonzal')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail3@gmail.com', 'password123', 'Lewa', 'Gonlezzzzzzzzzzzzzzz')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Sanchez', 'Gonzalez')).toEqual(ERROR);
    expect(authRegisterRequest('ValidEmail2@gmail.com', 'password123', 'Gavi', 'Gonzal')).toEqual(ERROR);
    expect(authRegisterRequest('ValidEmail4@gmail.com', 'password123', 'Kounde', 'Araujo')).toEqual({ token: expect.any(String) });
  });

  test('Testing with Clear', () => {
    expect(clearRequest()).toEqual({});
    expect(authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail2@gmail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Sanchez', 'Gonzalez')).toEqual(ERROR);
    expect(authRegisterRequest('ValidEmail2@gmail.com', 'password123', 'Gavi', 'Gonzal')).toEqual(ERROR);
    expect(clearRequest()).toEqual({});

    // Now, able to register new users since previous users with same email were cleared
    expect(authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail2@gmail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({ token: expect.any(String) });
  });
});

describe('Tests for adminAuthlogin', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Email does not exist', () => {
    expect(authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail2@gmail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({ token: expect.any(String) });
    expect(authLoginRequest('ValidEmail3@gmail.com', 'password123')).toEqual(ERROR);
    expect(authLoginRequest('ValidEmail4@gmail.com', 'password123')).toEqual(ERROR);
  });

  test('Incorrect Password', () => {
    expect(authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({ token: expect.any(String) });
    expect(authLoginRequest('ValidEmail1@gmail.com', 'password456')).toEqual(ERROR);
    expect(authRegisterRequest('ValidEmail2@gmail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({ token: expect.any(String) });
    expect(authLoginRequest('ValidEmail2@gmail.com', 'password789')).toEqual(ERROR);
  });

  test('Valid tests with clear', () => {
    expect(authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({ token: expect.any(String) });
    expect(authLoginRequest('ValidEmail1@gmail.com', 'password123')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail2@gmail.com', 'pass1234', 'Pedro', 'Gonzalez')).toEqual({ token: expect.any(String) });
    expect(authLoginRequest('ValidEmail2@gmail.com', 'pass1234')).toEqual({ token: expect.any(String) });
    expect(clearRequest()).toEqual({});

    // Now, unable to login as the respective users have been cleared
    expect(authLoginRequest('ValidEmail1@gmail.com', 'password456')).toEqual(ERROR);
    expect(authLoginRequest('ValidEmail2@gmail.com', 'pass1234')).toEqual(ERROR);
  });
});

describe('Tests for adminUserDetails', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Invalid token', () => {
    expect(userDetailsRequest('asca')).toEqual(ERROR);
    expect(userDetailsRequest('234987')).toEqual(ERROR);
  });

  test('Valid Tests', () => {
    const authId1 = authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez');
    expect(userDetailsRequest(authId1.token)).toEqual({
      user: {
        userId: expect.any(Number),
        name: 'Pedro Gonzalez',
        email: 'ValidEmail1@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    const authId2 = authRegisterRequest('ValidEmail2@gmail.com', 'password123', 'Gavi', 'Gonzalez');
    expect(authLoginRequest('ValidEmail2@gmail.com', 'password123')).toEqual({ token: expect.any(String) });
    expect(authLoginRequest('ValidEmail2@gmail.com', 'password789')).toEqual(ERROR);
    expect(userDetailsRequest(authId2.token)).toEqual({
      user: {
        userId: expect.any(Number),
        name: 'Gavi Gonzalez',
        email: 'ValidEmail2@gmail.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 1
      }
    });
  });

  test('Sample Test userDetails with clear()', () => {
    const authId1 = authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez');
    expect(userDetailsRequest(authId1.token)).toEqual({
      user: {
        userId: expect.any(Number),
        name: 'Pedro Gonzalez',
        email: 'ValidEmail1@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(clearRequest()).toEqual({});
    expect(userDetailsRequest(authId1.token)).toEqual(ERROR);
  });
});

describe('Tests for adminAuthlogout', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Token is empty or invalid', () => {
    expect(authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual({ token: expect.any(String) });
    expect(authLogoutRequest('')).toEqual(ERROR);
  });

  test('Valid tests', () => {
    const token1 = authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez');
    expect(userDetailsRequest(token1.token)).toEqual({
      user: {
        userId: expect.any(Number),
        name: 'Pedro Gonzalez',
        email: 'ValidEmail1@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(authLogoutRequest(token1.token)).toEqual({});

    // Returns error since user has been logged out
    expect(userDetailsRequest(token1.token)).toEqual(ERROR);
  });

  test('Valid tests with clear', () => {
    const token1 = authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez');
    expect(authLogoutRequest(token1.token)).toEqual({});
    const token2 = authLoginRequest('ValidEmail1@gmail.com', 'password123');
    expect(token2).toEqual({ token: expect.any(String) });
    expect(clearRequest()).toEqual({});

    // Now, unable to logout as the respective users have been cleared
    expect(authLogoutRequest(token2.token)).toEqual(ERROR);
  });
});

describe('Tests for adminUpdateUserDetails', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Token is empty or invalid', () => {
    authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez');
    expect(updateUserDetailsRequest('', 'updated@gmail.com', 'Updated', 'Updated')).toEqual(ERROR);
  });

  test('Invalid Email', () => {
    const token1 = authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez');
    expect(updateUserDetailsRequest(token1.token, 'InvalidEmailmail.com', 'Pedro', 'Gonzalez')).toEqual(ERROR);
    expect(updateUserDetailsRequest(token1.token, '@mail.com', 'Pedro', 'Gonzalez')).toEqual(ERROR);
    expect(updateUserDetailsRequest(token1.token, 'InvalidEmail@', 'Pedro', 'Gonzalez')).toEqual(ERROR);
    expect(updateUserDetailsRequest(token1.token, 'InvalidEmail@mail', 'Pedro', 'Gonzalez')).toEqual(ERROR);
    expect(updateUserDetailsRequest(token1.token, 'InvalidEmail.com', 'Pedro', 'Gonzalez')).toEqual(ERROR);
  });

  test('Invalid first name', () => {
    const token1 = authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez');
    expect(updateUserDetailsRequest(token1.token, 'InvalidEmail@gmail.com', 'Pedro123', 'Gonzalez')).toEqual(ERROR);
    expect(updateUserDetailsRequest(token1.token, 'InvalidEmail@gmail.com', 'P', 'Gonzalez')).toEqual(ERROR);
    expect(updateUserDetailsRequest(token1.token, 'InvalidEmail@gmail.com', 'Pedrooooooooooooooooo', 'Gonzalez')).toEqual(ERROR);
  });

  test('Invalid last name', () => {
    const token1 = authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez');
    expect(updateUserDetailsRequest(token1.token, 'InvalidEmail@gmail.com', 'Pedro', 'Gonzalez123')).toEqual(ERROR);
    expect(updateUserDetailsRequest(token1.token, 'InvalidEmail@gmail.com', 'Pedro', 'G')).toEqual(ERROR);
    expect(updateUserDetailsRequest(token1.token, 'InvalidEmail@gmail.com', 'Pedro', 'Gonzalezzzzzzzzzzzzzz')).toEqual(ERROR);
  });

  test('Valid Tests with same email error', () => {
    const token1 = authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez');
    expect(userDetailsRequest(token1.token)).toEqual({
      user: {
        userId: expect.any(Number),
        name: 'Pedro Gonzalez',
        email: 'ValidEmail1@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });

    // Does not return error since email is of current authorised user
    expect(updateUserDetailsRequest(token1.token, 'ValidEmail1@gmail.com', 'Updated', 'Name')).toEqual({});
    expect(userDetailsRequest(token1.token)).toEqual({
      user: {
        userId: expect.any(Number),
        name: 'Updated Name',
        email: 'ValidEmail1@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(authRegisterRequest('ValidEmail2@gmail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({ token: expect.any(String) });

    // Will return error since email is in use by other user
    expect(updateUserDetailsRequest(token1.token, 'ValidEmail2@gmail.com', 'Updated', 'Name')).toEqual(ERROR);
  });

  test('Testing with Clear', () => {
    const token1 = authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez');
    expect(updateUserDetailsRequest(token1.token, 'ValidEmail1@gmail.com', 'Updated', 'Name')).toEqual({});
    expect(clearRequest()).toEqual({});

    // returns an error since token becomes invalid
    expect(updateUserDetailsRequest(token1.token, 'ValidEmail1@gmail.com', 'Updated', 'Name')).toEqual(ERROR);
  });
});

describe('Tests for adminUserPassword', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Token is empty or invalid', () => {
    authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez');
    expect(updateUserPasswordRequest('', 'password123', 'pass1234')).toEqual(ERROR);
  });

  test('Old password is incorrect', () => {
    const token1 = authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez');
    expect(updateUserPasswordRequest(token1.token, 'pass1234', 'updated123')).toEqual(ERROR);
  });

  test('Old Password and New Password match exactly', () => {
    const token1 = authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez');
    expect(updateUserPasswordRequest(token1.token, 'password123', 'password123')).toEqual(ERROR);
  });

  test('New Password has already been used before by this user', () => {
    const token1 = authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez');
    expect(updateUserPasswordRequest(token1.token, 'password123', 'pass1234')).toEqual({});
    expect(updateUserPasswordRequest(token1.token, 'pass1234', 'password123')).toEqual(ERROR);
  });

  test('Invalid New password', () => {
    const token1 = authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez');
    expect(updateUserPasswordRequest(token1.token, 'password123', 'pass123')).toEqual(ERROR);
    expect(updateUserPasswordRequest(token1.token, 'password123', 'password')).toEqual(ERROR);
    expect(updateUserPasswordRequest(token1.token, 'password123', '12345678')).toEqual(ERROR);
  });

  test('Valid Tests', () => {
    const token1 = authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez');
    expect(authLoginRequest('ValidEmail1@gmail.com', 'password123')).toEqual({ token: expect.any(String) });
    expect(updateUserPasswordRequest(token1.token, 'password123', 'pass1234')).toEqual({});

    // returns error since password is now incorrect
    expect(authLoginRequest('ValidEmail1@gmail.com', 'password123')).toEqual(ERROR);
    expect(authLoginRequest('ValidEmail1@gmail.com', 'pass1234')).toEqual({ token: expect.any(String) });
  });

  test('Testing with Clear', () => {
    let token1 = authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez');
    expect(authLoginRequest('ValidEmail1@gmail.com', 'password123')).toEqual({ token: expect.any(String) });
    expect(updateUserPasswordRequest(token1.token, 'password123', 'pass1234')).toEqual({});

    expect(clearRequest()).toEqual({});
    // returns error since user does not exist
    expect(authLoginRequest('ValidEmail1@gmail.com', 'password123')).toEqual(ERROR);
    token1 = authRegisterRequest('ValidEmail1@gmail.com', 'pass1234', 'Pedro', 'Gonzalez');
    expect(authLoginRequest('ValidEmail1@gmail.com', 'pass1234')).toEqual({ token: expect.any(String) });
  });
});
