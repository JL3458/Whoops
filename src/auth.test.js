
import { adminAuthRegister } from './auth.js';
import {clear} from './other.js';
import { adminUserDetails } from './auth.js';
import { adminAuthLogin } from './auth.js';

const ERROR = { error: expect.any(String) };
beforeEach(() => {
    clear();
});

describe('userDetails', () => {
    beforeEach(() => {
        clear();
    });

    test ('Invalid UserId', () => {
        expect(adminUserDetails('10')).toEqual(ERROR);
        expect(adminUserDetails('20')).toEqual(ERROR);
        
    });

    test ('Sample Test userDetails', () => {
        const authId1 = adminAuthRegister('ValidEmail1@mail.com', 'password123', 'Pedro', 'Gonzalez');
        expect(adminUserDetails(authId1.authUserId)).toEqual({user: {userId: 10, name: 'Pedro Gonzalez', email: 'ValidEmail1@mail.com', numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 0}});
        const authId2 = adminAuthRegister('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzalez');
        expect(adminAuthLogin('ValidEmail2@mail.com', 'password123')).toEqual({authUserId: authId2.authUserId});
        expect(adminAuthLogin('ValidEmail2@mail.com', 'password789')).toEqual(ERROR);
        expect(adminUserDetails(authId2.authUserId)).toEqual({user: {userId: 20, name: 'Gavi Gonzalez', email: 'ValidEmail2@mail.com', numSuccessfulLogins: 2, numFailedPasswordsSinceLastLogin: 1}});
    })

    test ('Sample Test userDetails with clear()', () => {
        const authId1 = adminAuthRegister('ValidEmail1@mail.com', 'password123', 'Pedro', 'Gonzalez');
        expect(adminUserDetails(authId1.authUserId)).toEqual({user: {userId: 10, name: 'Pedro Gonzalez', email: 'ValidEmail1@mail.com', numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 0}});
        expect(clear()).toEqual({});
        expect(adminUserDetails(authId1.authUserId)).toEqual(ERROR);
    })
});

describe('authRegister', () => {
    test('Invalid Email', () => {
      expect(adminAuthRegister('InvalidEmailmail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual(ERROR);
      expect(adminAuthRegister('@mail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual(ERROR);
      expect(adminAuthRegister('InvalidEmail@', 'password123', 'Pedro', 'Gonzalez')).toEqual(ERROR);
      expect(adminAuthRegister('InvalidEmail@mail', 'password123', 'Pedro', 'Gonzalez')).toEqual(ERROR);
      expect(adminAuthRegister('InvalidEmail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual(ERROR);
    });
  
    test('Invalid first name', () => {
        expect(adminAuthRegister('InvalidEmail@mail.com', 'password123', 'Pedro123', 'Gonzalez')).toEqual(ERROR);
        expect(adminAuthRegister('InvalidEmail@mail.com', 'password123', 'P', 'Gonzalez')).toEqual(ERROR);
        expect(adminAuthRegister('InvalidEmail@mail.com', 'password123', 'Pedrooooooooooooooooo', 'Gonzalez')).toEqual(ERROR);
    });

    test('Invalid last name', () => {
        expect(adminAuthRegister('InvalidEmail@mail.com', 'password123', 'Pedro', 'Gonzalez123')).toEqual(ERROR);
        expect(adminAuthRegister('InvalidEmail@mail.com', 'password123', 'Pedro', 'G')).toEqual(ERROR);
        expect(adminAuthRegister('InvalidEmail@mail.com', 'password123', 'Pedro', 'Gonzalezzzzzzzzzzzzzz')).toEqual(ERROR);
    });

    test('Invalid password', () => {
        expect(adminAuthRegister('InvalidEmail@mail.com', 'pass123', 'Pedro', 'Gonzalez')).toEqual(ERROR);
        expect(adminAuthRegister('InvalidEmail@mail.com', 'password', 'Pedro', 'Gonzalez')).toEqual(ERROR);
        expect(adminAuthRegister('InvalidEmail@mail.com', '12345678', 'Pedro', 'Gonzalez')).toEqual(ERROR);
    });

    test('Sample test with same email error', () => {
        expect(adminAuthRegister('ValidEmail1@mail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthRegister('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthRegister('ValidEmail3@mail.com', 'password123', 'Lewa', 'Gonlez')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthRegister('ValidEmail1@mail.com', 'password123', 'Sanchez', 'Gonzalez')).toEqual(ERROR);
        expect(adminAuthRegister('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual(ERROR);
        expect(adminAuthRegister('ValidEmail4@mail.com', 'password123', 'Kounde', 'Araujo')).toEqual({authUserId: expect.any(Number)});
    });

    test('Testing with Clear', () => {
        expect(clear()).toEqual({});
        expect(adminAuthRegister('ValidEmail1@mail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthRegister('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthRegister('ValidEmail3@mail.com', 'password123', 'Lewa', 'Gonlez')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthRegister('ValidEmail1@mail.com', 'password123', 'Sanchez', 'Gonzalez')).toEqual(ERROR);
        expect(adminAuthRegister('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual(ERROR);
        expect(clear()).toEqual({});
        expect(adminAuthRegister('ValidEmail1@mail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthRegister('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({authUserId: expect.any(Number)});
    });
  });

describe('authlogin', () => {
    beforeEach(() => {
        clear();
      });

    test('Email does not exist', () => {
        expect(adminAuthRegister('ValidEmail1@mail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthRegister('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthLogin('ValidEmail3@mail.com', 'password123')).toEqual(ERROR);
        expect(adminAuthLogin('ValidEmail2@mail.com', 'password123')).toEqual({authUserId: expect.any(Number)});
    });

    test('Incorrect Password', () => {
        expect(adminAuthRegister('ValidEmail1@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthLogin('ValidEmail1@mail.com', 'password456')).toEqual(ERROR);
        expect(adminAuthRegister('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthLogin('ValidEmail2@mail.com', 'password789')).toEqual(ERROR);
        expect(adminAuthLogin('ValidEmail1@mail.com', 'password123')).toEqual({authUserId: expect.any(Number)});
    });

    test('Sample test with clear', () => {
        expect(adminAuthRegister('ValidEmail1@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthLogin('ValidEmail1@mail.com', 'password123')).toEqual({authUserId: expect.any(Number)});
        expect(clear()).toEqual({});
        expect(adminAuthLogin('ValidEmail1@mail.com', 'password456')).toEqual(ERROR);
    });
});