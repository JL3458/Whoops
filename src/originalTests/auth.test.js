
import { adminAuthRegister, adminUserDetails, adminAuthLogin } from './auth.ts';
import {clear} from './other.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    clear();
});

describe('Tests for adminUserDetails', () => {
    beforeEach(() => {
        clear();
    });

    test ('Invalid UserId', () => {
        expect(adminUserDetails('0')).toEqual(ERROR);
        expect(adminUserDetails('10')).toEqual(ERROR);
        
    });

    test ('Valid Tests', () => {
        const authId1 = adminAuthRegister('ValidEmail1@mail.com', 'password123', 'Pedro', 'Gonzalez');
        expect(adminUserDetails(authId1.authUserId)).toEqual({user: {userId: authId1.authUserId, name: 'Pedro Gonzalez', email: 'ValidEmail1@mail.com', numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 0}});
        const authId2 = adminAuthRegister('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzalez');
        expect(adminAuthLogin('ValidEmail2@mail.com', 'password123')).toEqual({authUserId: authId2.authUserId});
        expect(adminAuthLogin('ValidEmail2@mail.com', 'password789')).toEqual(ERROR);
        expect(adminUserDetails(authId2.authUserId)).toEqual({user: {userId: authId2.authUserId, name: 'Gavi Gonzalez', email: 'ValidEmail2@mail.com', numSuccessfulLogins: 2, numFailedPasswordsSinceLastLogin: 1}});
    })

    test ('Sample Test userDetails with clear()', () => {
        const authId1 = adminAuthRegister('ValidEmail1@mail.com', 'password123', 'Pedro', 'Gonzalez');
        expect(adminUserDetails(authId1.authUserId)).toEqual({user: {userId: authId1.authUserId, name: 'Pedro Gonzalez', email: 'ValidEmail1@mail.com', numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 0}});
        expect(clear()).toEqual({});
        expect(adminUserDetails(authId1.authUserId)).toEqual(ERROR);
    })
});

describe('Tests for adminAuthRegister', () => {
    beforeEach(() => {
        clear();
    });

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

    test('Valid Tests with same email error', () => {
        expect(adminAuthRegister('ValidEmail1@mail.com', 'pass1234', 'Pedro', 'Gonzalez')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthRegister('ValidEmail2@mail.com', 'password123', 'Ga', 'Gonzal')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthRegister('ValidEmail3@mail.com', 'password123', 'Lewa', 'Gonlezzzzzzzzzzzzzzz')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthRegister('ValidEmail1@mail.com', 'password123', 'Sanchez', 'Gonzalez')).toEqual(ERROR);
        expect(adminAuthRegister('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual(ERROR);
        expect(adminAuthRegister('ValidEmail4@mail.com', 'password123', 'Kounde', 'Araujo')).toEqual({authUserId: expect.any(Number)});
    });

    test('Testing with Clear', () => {
        expect(clear()).toEqual({});
        expect(adminAuthRegister('ValidEmail1@mail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthRegister('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthRegister('ValidEmail1@mail.com', 'password123', 'Sanchez', 'Gonzalez')).toEqual(ERROR);
        expect(adminAuthRegister('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual(ERROR);
        expect(clear()).toEqual({});

        // Now, able to register new users since previous users with same email were cleared
        expect(adminAuthRegister('ValidEmail1@mail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthRegister('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({authUserId: expect.any(Number)});
    });
  });

describe('Tests for adminAuthlogin', () => {
    beforeEach(() => {
        clear();
    });

    test('Email does not exist', () => {
        expect(adminAuthRegister('ValidEmail1@mail.com', 'password123', 'Pedro', 'Gonzalez')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthRegister('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthLogin('ValidEmail3@mail.com', 'password123')).toEqual(ERROR);
        expect(adminAuthLogin('ValidEmail4@mail.com', 'password123')).toEqual(ERROR);
    });

    test('Incorrect Password', () => {
        expect(adminAuthRegister('ValidEmail1@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthLogin('ValidEmail1@mail.com', 'password456')).toEqual(ERROR);
        expect(adminAuthRegister('ValidEmail2@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthLogin('ValidEmail2@mail.com', 'password789')).toEqual(ERROR);
    });

    test('Valid tests with clear', () => {
        expect(adminAuthRegister('ValidEmail1@mail.com', 'password123', 'Gavi', 'Gonzal')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthLogin('ValidEmail1@mail.com', 'password123')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthRegister('ValidEmail2@mail.com', 'pass1234', 'Pedro', 'Gonzalez')).toEqual({authUserId: expect.any(Number)});
        expect(adminAuthLogin('ValidEmail2@mail.com', 'pass1234')).toEqual({authUserId: expect.any(Number)});
        expect(clear()).toEqual({});

        // Now, unable to login as the respective users have been cleared
        expect(adminAuthLogin('ValidEmail1@mail.com', 'password456')).toEqual(ERROR);
        expect(adminAuthLogin('ValidEmail2@mail.com', 'pass1234')).toEqual(ERROR);
    });
});