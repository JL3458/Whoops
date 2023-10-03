import {adminQuizCreate, adminQuizRemove} from './quiz.js';
import {adminAuthRegister} from './auth.js';
import {clear} from './other.js';

const ERROR = {error: expect.any(String)};

describe('Tests of adminQuizCreate', () => {

    beforeEach(() => {
        clear();
    });

    test('AuthUserId is Invalid - adminQuizCreate', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
        expect(adminQuizCreate(newUser.authUserId + 1, 'Test Quiz 1', 'This is a sample test')).toEqual(ERROR);
    });

    test('Normal Case - adminQuizCreate', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Sample Quiz Testing')).toEqual({quizId: expect.any(Number)});
        expect(adminQuizCreate(newUser.authUserId, '              ', '')).toEqual({quizId: expect.any(Number)});
        expect(adminQuizCreate(newUser.authUserId, 'Sam', 'The @3xpl0r3rs J0urn3y')).toEqual({quizId: expect.any(Number)});
        expect(adminQuizCreate(newUser.authUserId, 'Supercalifragilisticexpialidoc', 'Sample Quiz Testing')).toEqual({quizId: expect.any(Number)});
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'Exploring the cosmos, seeking answers, and embracing the unknown.')).toEqual({quizId: expect.any(Number)});
    });

    test('Invalid Quiz Names - adminQuizCreate', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
        expect(adminQuizCreate(newUser.authUserId, '@test12345', 'Sample Quiz Testing')).toEqual(ERROR);
        expect(adminQuizCreate(newUser.authUserId, '', 'Sample Quiz Testing')).toEqual(ERROR);
        expect(adminQuizCreate(newUser.authUserId, 'Alexander Bartholomew Fitzwilliam Throckmorton Montgomery III', 'Sample Quiz Testing')).toEqual(ERROR);
        expect(adminQuizCreate(newUser.authUserId, '!!!@@@@##########$$$$$$$$$$$$$**********&&&&&&&&&&&&^^^^^^^^^^', 'Sample Quiz Testing')).toEqual(ERROR);
        expect(adminQuizCreate(newUser.authUserId, '!!!', 'Sample Quiz Testing')).toEqual(ERROR);
        expect(adminQuizCreate(newUser.authUserId, 'J@n3 Sm!th', 'Sample Quiz Testing')).toEqual(ERROR);
        expect(adminQuizCreate(newUser.authUserId, '                                    ', 'Sample Quiz Testing')).toEqual(ERROR);
    });

    test('Invalid Description Names - adminQuizCreate', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
        expect(adminQuizCreate(newUser.authUserId, 'Divakar Quiz 1', 'This Quiz is on the magnificent cosmos, seeking answers, and discovering wonders. Fantastic!fdvsvsfbrgberbertrtb')).toEqual(ERROR);
    });

    test('Quiz name already exists - adminQuizCreate', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
        let tempQuiz = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Sample Quiz Testing');
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Surely, this test doesnt exist anymore???')).toEqual(ERROR);
    });

    test('User makes two quizes - adminQuizCreate', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
        let tempQuiz = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Sample Quiz Testing');
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'Surely, this test works')).toEqual({quizId: expect.any(Number)});
    });

    test('Testing with clear - adminQuizCreate', () => {
        let newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Surely, this test works')).toEqual({quizId: expect.any(Number)});
        expect(clear()).toEqual({});
        newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Surely, this test works')).toEqual({quizId: expect.any(Number)});
    });

    test('Quiz name already exists, but a new user is entering it - adminQuizCreate', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
        let tempQuiz = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Sample Quiz Testing');
        let newUser2 = adminAuthRegister('Validemail2@gmail.com', 'password123', 'Ansh', 'Nimbalkar');
        expect(adminQuizCreate(newUser2.authUserId, 'Test Quiz 1', 'This Test should be working')).toEqual({quizId: expect.any(Number)});
    });
});


