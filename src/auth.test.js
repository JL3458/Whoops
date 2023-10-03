import {adminUserDetails} from './auth';

const ERROR = { error: expect.any(String) };

describe('userDetails', () => {
    test ('Invalid UserId', () => {
        expect(adminUserDetails(1135123)).toEqual(ERROR);
        expect(adminUserDetails(123)).toEqual(ERROR);
        expect(adminUserDetails(3459872)).toEqual(ERROR);
        expect(adminUserDetails(83745)).toEqual(ERROR);
    });
    test ('Invalid Syntax', () => {
        expect(adminUserDetails('9834ndfgi')).toEqual(ERROR);
        expect(adminUserDetails('dfbno283')).toEqual(ERROR);
        expect(adminUserDetails('Thisinstanumber')).toEqual(ERROR);
        expect(adminUserDetails('whowrotethis???')).toEqual(ERROR);
    })
});