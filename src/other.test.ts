// New .ts file to implement tests for auth.ts functions through the server

/*
// Use in the future -
import request from 'sync-request-curl';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
*/

// TODO: Add relevant tests calling the server.ts files

import { clear } from './other';
import request from 'sync-request-curl';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

function clearRequest() {
  const res = request('DELETE', SERVER_URL + '/clear');
  return JSON.parse(res.body as string);
}

describe('Testing for clear', () => {
  test('clear() returns empty dataStore', () => {
    expect(clear()).toStrictEqual({});
  });
});

describe('Testing for clearRequest', () => {
  test('clearRequest() returns empty', () => {
    expect(clearRequest()).toStrictEqual({});
  });
});