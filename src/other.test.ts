import request from 'sync-request-curl';
import { port, url } from './config.json';
// import { clear } from './other';
const SERVER_URL = `${url}:${port}`;

export function clearRequest() {
  const res = request('DELETE', SERVER_URL + '/v1/clear');
  return JSON.parse(res.body as string);
}

test('Nice Test', () => {
  expect(1 + 1).toEqual(2);
});
