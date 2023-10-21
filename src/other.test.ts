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
