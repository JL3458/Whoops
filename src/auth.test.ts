// New .ts file to implement tests for auth.ts functions through the server

import request from 'sync-request-curl';
import { port, url } from './config.json';
import { clearRequest } from './other.test';
const SERVER_URL = `${url}:${port}`;

// TODO: Add relevant tests calling the server.ts files

const ERROR = { error: expect.any(String) };

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
