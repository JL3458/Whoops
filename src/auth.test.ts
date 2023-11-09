// New .ts file to implement tests for auth.ts functions through the server

import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
import { clearRequest } from './other.test';
import HTTPError from 'http-errors';
import { IncomingHttpHeaders } from 'http';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 10000;
const ERROR = { error: expect.any(String) };

interface Payload {
  [key: string]: any;
}

// Helpers
const requestHelper = (
  method: HttpVerb,
  path: string,
  payload: Payload,
  headers: IncomingHttpHeaders = {}
): any => {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method.toUpperCase())) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }

  const url = SERVER_URL + path;
  const res = request(method, url, { qs, json, headers, timeout: TIMEOUT_MS });

  let responseBody: any;
  try {
    responseBody = JSON.parse(res.body.toString());
  } catch (err: any) {
    if (res.statusCode === 200) {
      throw HTTPError(500,
        `Non-jsonifiable body despite code 200: '${res.body}'.\nCheck that you are not doing res.json(undefined) instead of res.json({}), e.g. in '/clear'`
      );
    }
    responseBody = { error: `Failed to parse JSON: '${err.message}'` };
  }

  const errorMessage = `[${res.statusCode}] ` + responseBody?.error || responseBody || 'No message specified!';

  // NOTE: the error is rethrown in the test below. This is useful becasuse the
  // test suite will halt (stop) if there's an error, rather than carry on and
  // potentially failing on a different expect statement without useful outputs
  switch (res.statusCode) {
    case 400: // BAD_REQUEST
    case 401: // UNAUTHORIZED
      throw HTTPError(res.statusCode, errorMessage);
    case 404: // NOT_FOUND
      throw HTTPError(res.statusCode, `Cannot find '${url}' [${method}]\nReason: ${errorMessage}\n\nHint: Check that your server.ts have the correct path AND method`);
    case 500: // INTERNAL_SERVER_ERROR
      throw HTTPError(res.statusCode, errorMessage + '\n\nHint: Your server crashed. Check the server log!\n');
    default:
      if (res.statusCode !== 200) {
        throw HTTPError(res.statusCode, errorMessage + `\n\nSorry, no idea! Look up the status code ${res.statusCode} online!\n`);
      }
  }
  return responseBody;
};

/// ////////////////////// Request Functions ////////////////////////////

export function authRegisterRequest(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast }, {});
}

export function authLoginRequest(email: string, password: string) {
  return requestHelper('POST', '/v1/admin/auth/login', { email, password }, {});
}

export function authLogoutRequest(token: string) {
  return requestHelper('POST', '/v2/admin/auth/logout', {}, { token });
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

/// ///////////////////////////// Tests /////////////////////////////////

beforeEach(() => {
  clearRequest();
});

describe('Tests for adminAuthRegister', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Invalid Email', () => {
    expect(() => authRegisterRequest('InvalidEmailmail.com', 'password123', 'Pedro', 'Gonzalez')).toThrow(HTTPError[400]);
    expect(() => authRegisterRequest('@mail.com', 'password123', 'Pedro', 'Gonzalez')).toThrow(HTTPError[400]);
    expect(() => authRegisterRequest('InvalidEmail@', 'password123', 'Pedro', 'Gonzalez')).toThrow(HTTPError[400]);
    expect(() => authRegisterRequest('InvalidEmail@mail', 'password123', 'Pedro', 'Gonzalez')).toThrow(HTTPError[400]);
    expect(() => authRegisterRequest('InvalidEmail.com', 'password123', 'Pedro', 'Gonzalez')).toThrow(HTTPError[400]);
  });

  test('Invalid first name', () => {
    expect(() => authRegisterRequest('InvalidEmail@gmail.com', 'password123', 'Pedro123', 'Gonzalez')).toThrow(HTTPError[400]);
    expect(() => authRegisterRequest('InvalidEmail@gmail.com', 'password123', 'P', 'Gonzalez')).toThrow(HTTPError[400]);
    expect(() => authRegisterRequest('InvalidEmail@gmail.com', 'password123', 'Pedrooooooooooooooooo', 'Gonzalez')).toThrow(HTTPError[400]);
  });

  test('Invalid last name', () => {
    expect(() => authRegisterRequest('InvalidEmail@gmail.com', 'password123', 'Pedro', 'Gonzalez123')).toThrow(HTTPError[400]);
    expect(() => authRegisterRequest('InvalidEmail@gmail.com', 'password123', 'Pedro', 'G')).toThrow(HTTPError[400]);
    expect(() => authRegisterRequest('InvalidEmail@gmail.com', 'password123', 'Pedro', 'Gonzalezzzzzzzzzzzzzz')).toThrow(HTTPError[400]);
  });

  test('Invalid password', () => {
    expect(() => authRegisterRequest('InvalidEmail@gmail.com', 'pass123', 'Pedro', 'Gonzalez')).toThrow(HTTPError[400]);
    expect(() => authRegisterRequest('InvalidEmail@gmail.com', 'password', 'Pedro', 'Gonzalez')).toThrow(HTTPError[400]);
    expect(() => authRegisterRequest('InvalidEmail@gmail.com', '12345678', 'Pedro', 'Gonzalez')).toThrow(HTTPError[400]);
  });

  test('Valid Tests with same email error', () => {
    expect(authRegisterRequest('ValidEmail1@gmail.com', 'pass1234', 'Pedro', 'Gonzalez')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail2@gmail.com', 'password123', 'Ga', 'Gonzal')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail3@gmail.com', 'password123', 'Lewa', 'Gonlezzzzzzzzzzzzzzz')).toEqual({ token: expect.any(String) });
    expect(() => authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Sanchez', 'Gonzalez')).toThrow(HTTPError[400]);
    expect(() => authRegisterRequest('ValidEmail2@gmail.com', 'password123', 'Gavi', 'Gonzal')).toThrow(HTTPError[400]);
    expect(authRegisterRequest('ValidEmail4@gmail.com', 'password123', 'Kounde', 'Araujo')).toEqual({ token: expect.any(String) });
  });

  test('Testing with Clear', () => {
    expect(clearRequest()).toEqual({});
    expect(authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail2@gmail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({ token: expect.any(String) });
    expect(() => authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Sanchez', 'Gonzalez')).toThrow(HTTPError[400]);
    expect(() => authRegisterRequest('ValidEmail2@gmail.com', 'password123', 'Gavi', 'Gonzal')).toThrow(HTTPError[400]);
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
    expect(() => authLoginRequest('ValidEmail3@gmail.com', 'password123')).toThrow(HTTPError[400]);
    expect(() => authLoginRequest('ValidEmail4@gmail.com', 'password123')).toThrow(HTTPError[400]);
  });

  test('Incorrect Password', () => {
    expect(authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({ token: expect.any(String) });
    expect(() => authLoginRequest('ValidEmail1@gmail.com', 'password456')).toThrow(HTTPError[400]);
    expect(authRegisterRequest('ValidEmail2@gmail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({ token: expect.any(String) });
    expect(() => authLoginRequest('ValidEmail2@gmail.com', 'password789')).toThrow(HTTPError[400]);
  });

  test('Valid tests with clear', () => {
    expect(authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({ token: expect.any(String) });
    expect(authLoginRequest('ValidEmail1@gmail.com', 'password123')).toEqual({ token: expect.any(String) });
    expect(authRegisterRequest('ValidEmail2@gmail.com', 'pass1234', 'Pedro', 'Gonzalez')).toEqual({ token: expect.any(String) });
    expect(authLoginRequest('ValidEmail2@gmail.com', 'pass1234')).toEqual({ token: expect.any(String) });
    expect(clearRequest()).toEqual({});

    // Now, unable to login as the respective users have been cleared
    expect(() => authLoginRequest('ValidEmail1@gmail.com', 'password456')).toThrow(HTTPError[400]);
    expect(() => authLoginRequest('ValidEmail2@gmail.com', 'pass1234')).toThrow(HTTPError[400]);
  });
});

describe('Tests for adminAuthlogout', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Token is empty or invalid', () => {
    expect(authRegisterRequest('ValidEmail1@gmail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual({ token: expect.any(String) });
    expect(() => authLogoutRequest('')).toThrow(HTTPError[401]);
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
    expect(() => authLogoutRequest(token2.token)).toThrow(HTTPError[401]);
  });
});
