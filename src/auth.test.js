import {adminAuthRegister} from './auth';

const ERROR = { error: expect.any(String) };

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
  });