import {adminQuizCreate, adminQuizRemove} from './quiz.js';
import {adminAuthRegister} from './auth.js';
import {adminQuizDescriptionUpdate} from './quiz.js';
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
describe('adminQuizDescriptionUpdate', () => {
    test ('authUserId testing - adminQuizDescriptionUpdate', () =>{
        clear();
        const newUser = adminAuthRegister('tomcruise@gmail.com','eight12345','Firstname', 'Lastname');
        const newUser1 = adminAuthRegister('Newemail@gmail.com','eight12345','Firstname', 'Lastname');
        const newquiz = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Made by Ujjwal');
        const newquiz1 = adminQuizCreate(newUser1.authUserId, 'Test Quiz 1', 'Made by Ujjwal');
            // Invalid authUserId
            expect(adminQuizDescriptionUpdate(newUser.authUserId + 1,newquiz.quizId,'a')).toStrictEqual(ERROR);

            // Error Edge Case
            expect(adminQuizDescriptionUpdate(0,100,'a')).toStrictEqual(ERROR);

            // Valid authUserId
            expect(adminQuizDescriptionUpdate(newUser.authUserId,newquiz.quizId,'a')).toEqual({});
            expect(adminQuizDescriptionUpdate(newUser1.authUserId,newquiz1.quizId,'b')).toEqual({});
    })


    test ('quizId testing - adminQuizDescriptionUpdate', () =>{
        clear();
        const newUser = adminAuthRegister('tomcruise@gmail.com','eight12345','Firstname', 'Lastname');
        const newUser1 = adminAuthRegister('Validemails@gmail.com', 'password123', 'Jack', 'Brooks');
        const newquiz = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Made by Ujjwal');
        const newquiz1 = adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'Made by Ujjwal');
            // Case 1: Invalid quizId testing
            expect(adminQuizDescriptionUpdate(newUser.authUserId,newquiz.quizId + 1,'a')).toStrictEqual(ERROR);

            // Case 2: Quiz is not owned by the owner
            expect(adminQuizDescriptionUpdate(newUser1.authUserId, newquiz.quizId,'')).toEqual(ERROR);

            // Case 3: Valid quizId testing
            expect(adminQuizDescriptionUpdate(newUser.authUserId,newquiz.quizId,'a')).toEqual({ });
            expect(adminQuizDescriptionUpdate(newUser.authUserId,newquiz1.quizId,'b')).toEqual({ });
    })

    test ('Description testing - adminQuizDescriptionUpdate', () =>{
        clear();
        const newUser = adminAuthRegister('kyrieirving@gmail.com','eight12345','Firstname', 'Lastname');
        const newquiz = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Made by Ujjwal');
            // Case 1: Invalid description testing
            expect(adminQuizDescriptionUpdate(newUser.authUserId,newquiz.quizId,'ThisStringNOTIsExactly100CharactersLongThisStringNOTIsExactly100CharactersLong Andrew is such a great tutor Andrew is such a great tutor Andrew is such a great tutor Andrew is such a great tutor')).toStrictEqual(ERROR);
            expect(adminQuizDescriptionUpdate(newUser.authUserId,newquiz.quizId,'Andrew is such a great tutor    LongThisStringIsExactly100CharactersLongThisStringIsExactly100Charact')).toStrictEqual(ERROR);
            
            // Case 2: Valid description testing (edge cases)
            expect(adminQuizDescriptionUpdate(newUser.authUserId,newquiz.quizId,'Andrew is such a great tutor    LongThisStringIsExactly100CharactersLongThisStringIsExactly100Charac')).toEqual({ });
            expect(adminQuizDescriptionUpdate(newUser.authUserId,newquiz.quizId,'Andrew is such a great tutor')).toEqual({ });
            expect(adminQuizDescriptionUpdate(newUser.authUserId,newquiz.quizId,'')).toEqual({ });
            
    })
    test ('Normal cases - adminQuizDescriptionUpdate', () => {
        clear();
        const newUser = adminAuthRegister('kyrieirving@gmail.com','eight12345','Firstname', 'Lastname');
        const newUser1 = adminAuthRegister('Validemails@gmail.com', 'password123', 'Jack', 'Brooks');
        const newquiz = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Made by Ujjwal');
        const newquiz1 = adminQuizCreate(newUser1.authUserId, 'Test Quiz 2', 'Made by Ujjwal');
        const newquiz2 = adminQuizCreate(newUser.authUserId, 'Test Quiz 3', 'Made by Ujjwal');

        expect(adminQuizDescriptionUpdate(newUser.authUserId,newquiz.quizId,'')).toEqual({ });
        expect(adminQuizInfo(newUser.authUserId, newquiz.quizId)).toEqual({ })
        expect(adminQuizDescriptionUpdate(newUser.authUserId,newquiz2.quizId,'')).toEqual({ });
        expect(adminQuizDescriptionUpdate(newUser1.authUserId,newquiz1.quizId,'')).toEqual({ });
    })

})

