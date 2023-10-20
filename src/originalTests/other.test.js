import { clear } from './other.js';

describe('Testing for clear', () => {
  test('clear() returns empty dataStore', () => {
    expect(clear()).toStrictEqual({});
  });
});
