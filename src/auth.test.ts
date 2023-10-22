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
        token: token,
      }
    }
  );
  return JSON.parse(res.body as string)
}

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
    expect(authRegisterRequest('InvalidEmail@mail.com', 'password123', 'Pedro123', 'Gonzalez')).toEqual(ERROR);
    expect(authRegisterRequest('InvalidEmail@mail.com', 'password123', 'P', 'Gonzalez')).toEqual(ERROR);
    expect(authRegisterRequest('InvalidEmail@mail.com', 'password123', 'Pedrooooooooooooooooo', 'Gonzalez')).toEqual(ERROR);
  });

  test('Invalid last name', () => {
    expect(authRegisterRequest('InvalidEmail@mail.com', 'password123', 'Pedro', 'Gonzalez123')).toEqual(ERROR);
    expect(authRegisterRequest('InvalidEmail@mail.com', 'password123', 'Pedro', 'G')).toEqual(ERROR);
    expect(authRegisterRequest('InvalidEmail@mail.com', 'password123', 'Pedro', 'Gonzalezzzzzzzzzzzzzz')).toEqual(ERROR);
  });

  test('Invalid password', () => {
    expect(authRegisterRequest('InvalidEmail@mail.com', 'pass123', 'Pedro', 'Gonzalez')).toEqual(ERROR);
    expect(authRegisterRequest('InvalidEmail@mail.com', 'password', 'Pedro', 'Gonzalez')).toEqual(ERROR);
    expect(authRegisterRequest('InvalidEmail@mail.com', '12345678', 'Pedro', 'Gonzalez')).toEqual(ERROR);
  });

  test('Valid Tests with same email error', () => {
    expect(authRegisterRequest('ValidEmail1@mail.com', 'pass1234', 'Pedro', 'Gonzalez')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail2@mail.com', 'password123', 'Ga', 'Gonzal')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail3@mail.com', 'password123', 'Lewa', 'Gonlezzzzzzzzzzzzzzz')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail1@mail.com', 'password123', 'Sanchez', 'Gonzalez')).toEqual(ERROR);
    expect(authRegisterRequest('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual(ERROR);
    expect(authRegisterRequest('ValidEmail4@mail.com', 'password123', 'Kounde', 'Araujo')).toEqual({ token: expect.any(String) });
  });

  test('Testing with Clear', () => {
    expect(clearRequest()).toEqual({});
    expect(authRegisterRequest('ValidEmail1@mail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail1@mail.com', 'password123', 'Sanchez', 'Gonzalez')).toEqual(ERROR);
    expect(authRegisterRequest('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual(ERROR);
    expect(clearRequest()).toEqual({});

    // Now, able to register new users since previous users with same email were cleared
    expect(authRegisterRequest('ValidEmail1@mail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({ token: expect.any(String) });
  });
});

describe('Tests for adminAuthlogin', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Email does not exist', () => {
    expect(authRegisterRequest('ValidEmail1@mail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({ token: expect.any(String) });
    expect(authLoginRequest('ValidEmail3@mail.com', 'password123')).toEqual(ERROR);
    expect(authLoginRequest('ValidEmail4@mail.com', 'password123')).toEqual(ERROR);
  });

  test('Incorrect Password', () => {
    expect(authRegisterRequest('ValidEmail1@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({ token: expect.any(String) });
    expect(authLoginRequest('ValidEmail1@mail.com', 'password456')).toEqual(ERROR);
    expect(authRegisterRequest('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({ token: expect.any(String) });
    expect(authLoginRequest('ValidEmail2@mail.com', 'password789')).toEqual(ERROR);
  });

  test('Valid tests with clear', () => {
    expect(authRegisterRequest('ValidEmail1@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({ token: expect.any(String) });
    expect(authLoginRequest('ValidEmail1@mail.com', 'password123')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail2@mail.com', 'pass1234', 'Pedro', 'Gonzalez')).toEqual({ token: expect.any(String) });
    expect(authLoginRequest('ValidEmail2@mail.com', 'pass1234')).toEqual({ token: expect.any(String) });
    expect(clearRequest()).toEqual({});

    // Now, unable to login as the respective users have been cleared
    expect(authLoginRequest('ValidEmail1@mail.com', 'password456')).toEqual(ERROR);
    expect(authLoginRequest('ValidEmail2@mail.com', 'pass1234')).toEqual(ERROR);
  });
});

describe('Tests for adminUserDetails', () => {
  beforeEach(() => {
      clearRequest();
  });

  test ('Invalid token', () => {
      expect(userDetailsRequest("token")).toEqual(ERROR);
      expect(userDetailsRequest("token")).toEqual(ERROR);
      
  });

  test ('Valid Tests', () => {
      const authId1 = authRegisterRequest('ValidEmail1@mail.com', 'password123', 'Pedro', 'Gonzalez');
      expect(userDetailsRequest(authId1.token)).toEqual({user: {userId: 10, name: 'Pedro Gonzalez', email: 'ValidEmail1@mail.com', numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 0}});
      const authId2 = authRegisterRequest('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzalez');
      expect(authLoginRequest('ValidEmail2@mail.com', 'password123')).toEqual({token: expect.any(String) });
      expect(authLoginRequest('ValidEmail2@mail.com', 'password789')).toEqual(ERROR);
      expect(userDetailsRequest(authId2.token)).toEqual({user: {userId: 20, name: 'Gavi Gonzalez', email: 'ValidEmail2@mail.com', numSuccessfulLogins: 2, numFailedPasswordsSinceLastLogin: 1}});
  })

  test ('Sample Test userDetails with clear()', () => {
      const authId1 = authRegisterRequest('ValidEmail1@mail.com', 'password123', 'Pedro', 'Gonzalez');
      expect(userDetailsRequest(authId1.token)).toEqual({user: {userId: 10, name: 'Pedro Gonzalez', email: 'ValidEmail1@mail.com', numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 0}});
      expect(clearRequest()).toEqual({});
      expect(userDetailsRequest(authId1.token)).toEqual(ERROR);
  })
});

