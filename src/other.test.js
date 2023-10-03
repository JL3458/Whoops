import {clear} from './other.js'

describe('Testing clear', () => {
        test('clear() returns empty dataStore', () => {
          expect(clear()).toStrictEqual({});
        });
});