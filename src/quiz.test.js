import {adminQuizCreate, adminQuizRemove, adminQuizInfo, adminQuizNameUpdate} from './quiz.js';
import {getData, setData} from './dataStore.js';
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

    test('Normal Case correct output value - adminQuizCreate', () => {
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

    test('Removal when there are no quizzes and users - adminQuizCreate', () => {
        expect(adminQuizCreate(0, 'Test 1', 'This should not work')).toEqual(ERROR);
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

    test('Making Multiple Quizes with one user - adminQuizCreate', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Made by Divakar')).toEqual({quizId: expect.any(Number)});
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'Made by Divakar')).toEqual({quizId: expect.any(Number)});
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 3', 'Made by Divakar')).toEqual({quizId: expect.any(Number)});

        // We get an expected error as the quizes are already created
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Made by Divakar')).toEqual(ERROR);
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'Made by Divakar')).toEqual(ERROR);
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 3', 'Made by Divakar')).toEqual(ERROR);
    });

    test('Making Multiple Quizes with Multiple Users - adminQuizCreate', () => {
        const newUser1 = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
        const newUser2 = adminAuthRegister('Validemails@gmail.com', 'password123', 'Jason', 'Mascheranous');
        const newUser3 = adminAuthRegister('Validemailt@gmail.com', 'password123', 'Sanath', 'Nevagi');
        expect(adminQuizCreate(newUser1.authUserId, 'Test Quiz 1', 'Made by Divakar')).toEqual({quizId: expect.any(Number)});
        expect(adminQuizCreate(newUser2.authUserId, 'Test Quiz 2', 'Made by Jason')).toEqual({quizId: expect.any(Number)});
        expect(adminQuizCreate(newUser3.authUserId, 'Test Quiz 3', 'Made by Sanath')).toEqual({quizId: expect.any(Number)});

        // We get an expected error as the quizes are already created
        expect(adminQuizCreate(newUser1.authUserId, 'Test Quiz 1', 'Made by Divakar')).toEqual(ERROR);
        expect(adminQuizCreate(newUser2.authUserId, 'Test Quiz 2', 'Made by Jason')).toEqual(ERROR);
        expect(adminQuizCreate(newUser3.authUserId, 'Test Quiz 3', 'Made by Sanath')).toEqual(ERROR);
    });
});

describe('Tests of adminQuizRemove', () => {

    beforeEach(() => {
        clear();
    });

    test('AuthUserId is Invalid - adminQuizRemove', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
        let quizIndex = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'This is a test');
        expect(adminQuizRemove(newUser.authUserId + 1, quizIndex.quizId)).toEqual(ERROR);
    });

    test('QuizId is Invalid - adminQuizRemove', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
        adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'This is a test');
        let quizIndex = adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'This is a test');
        expect(adminQuizRemove(newUser.authUserId, quizIndex.quizId + 1)).toEqual(ERROR);
    });

    test('Removal when there are no quizzes - adminQuizRemove', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
        expect(adminQuizRemove(newUser.authUserId, 100)).toEqual(ERROR);
    });

    test('Removal when there are no quizzes and users - adminQuizRemove', () => {
        expect(adminQuizRemove(0, 100)).toEqual(ERROR);
    });

    test('Quiz is not owned by the owner - adminQuizRemove', () => {
        const newUser1 = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
        const newUser2 = adminAuthRegister('Validemails@gmail.com', 'password123', 'Jason', 'Mascharanous');
        let quizIndex = adminQuizCreate(newUser1.authUserId, 'Test Quiz 1', 'This is a test');
        expect(adminQuizRemove(newUser2.authUserId, quizIndex.quizId)).toEqual(ERROR);
    });

    test('Deleting one quiz, Normal Case - adminQuizRemove', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
        let quizIndex = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'This is a test');
        adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'This is a test');
        adminQuizCreate(newUser.authUserId, 'Test Quiz 3', 'This is a test');
        adminQuizCreate(newUser.authUserId, 'Test Quiz 4', 'This is a test');

        // We wont be able to make a new Quize
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'This is a test')).toEqual(ERROR);

        //  Now, we remove this quiz
        expect(adminQuizRemove(newUser.authUserId, quizIndex.quizId)).toEqual({});

        // Adding the quizes again should return us new quizIds and no error
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'This is a test')).toEqual({quizId: expect.any(Number)});

    });

    test('Multiple Quizes Deletion from one user, Normal Case - adminQuizRemove', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
        let quizIndex1 = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'This is a test');
        let quizIndex2 = adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'This is a test');
        let quizIndex3 = adminQuizCreate(newUser.authUserId, 'Test Quiz 3', 'This is a test');
        let quizIndex4 = adminQuizCreate(newUser.authUserId, 'Test Quiz 4', 'This is a test');

        // We wont be able to make new Quizes
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'This is a test')).toEqual(ERROR);
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'This is a test')).toEqual(ERROR);
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 3', 'This is a test')).toEqual(ERROR);

        // Now, we remove this quizes
        expect(adminQuizRemove(newUser.authUserId, quizIndex1.quizId)).toEqual({});
        expect(adminQuizRemove(newUser.authUserId, quizIndex2.quizId)).toEqual({});
        expect(adminQuizRemove(newUser.authUserId, quizIndex3.quizId)).toEqual({});

        // Adding the quizes again should return us new quizIds and no error
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'This is a test')).toEqual({quizId: expect.any(Number)});
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'This is a test')).toEqual({quizId: expect.any(Number)});
        expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 3', 'This is a test')).toEqual({quizId: expect.any(Number)});
    });


    test('Multiple quizes Deletion with mutiple users, Normal Case - adminQuizRemove', () => {
        const newUser1 = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
        const newUser2 = adminAuthRegister('Validemails@gmail.com', 'password123', 'Jason', 'Mascheranous');
        const newUser3 = adminAuthRegister('Validemailt@gmail.com', 'password123', 'Sanath', 'Nevagi');
        let quizIndex1 = adminQuizCreate(newUser1.authUserId, 'Test Quiz 1', 'Made by Divakar');
        let quizIndex2 = adminQuizCreate(newUser2.authUserId, 'Test Quiz 2', 'Made by Jason');
        let quizIndex3 = adminQuizCreate(newUser3.authUserId, 'Test Quiz 3', 'Made by Sanath');

        // We wont be able to make new Quizes
        adminQuizCreate(newUser1.authUserId, 'Test Quiz 1', 'Made by Divakar');
        adminQuizCreate(newUser2.authUserId, 'Test Quiz 2', 'Made by Jason');

        // Now, we remove this quizes
        expect(adminQuizRemove(newUser1.authUserId, quizIndex1.quizId)).toEqual({});
        expect(adminQuizRemove(newUser2.authUserId, quizIndex2.quizId)).toEqual({});

        // Adding the quizes again should return us new quizIds and no error
        expect(adminQuizCreate(newUser1.authUserId, 'Test Quiz 1', 'Made by Divakar')).toEqual({quizId: expect.any(Number)});
        expect(adminQuizCreate(newUser2.authUserId, 'Test Quiz 2', 'Made by Jason')).toEqual({quizId: expect.any(Number)});

    });

});

describe('adminQuizInfo', () => {
    beforeEach(() => {
        clear();
    });

    test('Invalid UserId', () => {
        expect(adminQuizInfo(234097634, 1)).toEqual(ERROR);
        expect(adminQuizInfo(1248734, 2)).toEqual(ERROR);
        expect(adminQuizInfo(24763, 3)).toEqual(ERROR);
        expect(adminQuizInfo(5487, 4)).toEqual(ERROR);
    });

    test('Quiz not owned by the user', () => {
        const newUser1 = adminAuthRegister('Validemail1@gmail.com', 'password123', 'Shervin', 'Erfanian');
        const newUser2 = adminAuthRegister('Validemail2@gmail.com', 'password1234', 'Random', 'Person');
        const quiz1 = adminQuizCreate(newUser1.authUserId, 'Test Quiz 1', 'Sample Quiz Testing');
        expect(quiz1).toEqual({ quizId: expect.any(Number) });
        const result = adminQuizInfo(newUser2.authUserId, quiz1.quizId);
        expect(result).toEqual(ERROR);
    });

    test('Valid Quiz Info', () => {
        const newUser1 = adminAuthRegister('Validemail1@gmail.com', 'password123', 'Shervin', 'Erfanian');
        const quiz1 = adminQuizCreate(newUser1.authUserId, 'Test Quiz 1', 'Sample Quiz Testing');
        expect(quiz1).toEqual({ quizId: expect.any(Number) });
        const result = adminQuizInfo(newUser1.authUserId, quiz1.quizId);
        expect(result).toEqual({
                quizId: quiz1.quizId,
                name: 'Test Quiz 1',
                timeCreated: expect.any(Number),
                timeLastEdited: expect.any(Number),
                description: 'Sample Quiz Testing',
        });
    });
    test('Valid Quiz Info', () => {
        const newUser1 = adminAuthRegister('Validemail1@gmail.com', 'password123', 'Shervin', 'Erfanian');
        const quiz1 = adminQuizCreate(newUser1.authUserId, 'Test Quiz 1', 'Sample Quiz Testing');
        expect(quiz1).toEqual({ quizId: expect.any(Number) });
        const result = adminQuizInfo(newUser1.authUserId, quiz1.quizId);
        expect(result).toEqual({
                quizId: quiz1.quizId,
                name: 'Test Quiz 1',
                timeCreated: expect.any(Number),
                timeLastEdited: expect.any(Number),
                description: 'Sample Quiz Testing',
        });
        clear();
        const result2 = adminQuizInfo(newUser1.authUserId, quiz1.quizId);
        expect(result2).toEqual(ERROR);
    });
});

describe('adminQuizNameUpdate', () => {
    beforeEach(() => {
        clear();
    });

    test('AuthUserId is Invalid', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
        const quiz = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Sample Quiz Testing');
        const quizId = quiz.quizId;
        
        const result = adminQuizNameUpdate(newUser.authUserId + 1, quizId, 'New Quiz Name');
        expect(result).toEqual(ERROR);
    });

    test('quizId does not refer to a valid quiz', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
        const quiz = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Sample Quiz Testing');
        const quizId = quiz.quizId;
        
        const result = adminQuizNameUpdate(newUser.authUserId, quizId + 1, 'New Quiz Name');
        expect(result).toEqual(ERROR);
    });

    test('quizId does not refer to a quiz that this user owns', () => {
        const newUser1 = adminAuthRegister('Validemail1@gmail.com', 'password123', 'Shervin', 'Erfanian');
        const newUser2 = adminAuthRegister('Validemail2@gmail.com', 'password1234', 'Random', 'Person');
        const quiz1 = adminQuizCreate(newUser1.authUserId, 'Test Quiz 1', 'Sample Quiz Testing');
        const quizId = quiz1.quizId;
        const result = adminQuizNameUpdate(newUser2.authUserId, quizId, 'New Quiz Name');
        expect(result).toEqual(ERROR);
    });

    test('Name contains invalid characters', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
        const quiz = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Sample Quiz Testing');
        const quizId = quiz.quizId;
        const result = adminQuizNameUpdate(newUser.authUserId, quizId, 'New Quiz @Name');
        expect(result).toEqual(ERROR);
    });

    test('Name Length is Too Short', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
        const quiz = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Sample Quiz Testing');
        const quizId = quiz.quizId;
        const result = adminQuizNameUpdate(newUser.authUserId, quizId, 'A');
        expect(result).toEqual(ERROR);
    });

    test('Name Length is Too Long', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
        const quiz = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Sample Quiz Testing');
        const quizId = quiz.quizId;
        const longName = 'ThisIsAReallyLongQuizNameThatExceedsTheMaximumAllowedLength';
        const result = adminQuizNameUpdate(newUser.authUserId, quizId, longName);
        expect(result).toEqual(ERROR);
    });

    test('Name is Already Used by the User', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
        adminQuizCreate(newUser.authUserId, 'Another Quiz Name', 'Another Quiz Description');
        const quiz = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Sample Quiz Testing');
        const quizId = quiz.quizId;
        const result = adminQuizNameUpdate(newUser.authUserId, quizId, 'Another Quiz Name');
        expect(result).toEqual(ERROR);
    });

    test('Update Quiz Name Successfully', () => {
        const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
        const quiz = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Sample Quiz Testing');
        const quizId = quiz.quizId;
        const result = adminQuizNameUpdate(newUser.authUserId, quizId, 'New Quiz Name');
        expect(result).toEqual({});
    });
});