/*
import { adminQuizList, adminQuizCreate, adminQuizRemove, adminQuizInfo, adminQuizNameUpdate, adminQuizDescriptionUpdate } from './quiz';
import { adminAuthRegister } from './auth';
import { clear } from './other';

const ERROR = { error: expect.any(String) };

*/

test('Nice Test', () => {
  expect(1 + 1).toEqual(2);
});

/*
beforeEach(() => {
  clear();
});

describe('Tests for adminQuizList', () => {
  beforeEach(() => {
    clear();
  });

  test('Invalid UserId', () => {
    expect(adminQuizList(234097634)).toEqual(ERROR);
    expect(adminQuizList(1248734)).toEqual(ERROR);
    expect(adminQuizList(24763)).toEqual(ERROR);
    expect(adminQuizList(5487)).toEqual(ERROR);
  });

  test('Invalid Syntax', () => {
    expect(adminQuizList('23948bfiudg')).toEqual(ERROR);
    expect(adminQuizList('04g9j309fn')).toEqual(ERROR);
    expect(adminQuizList('whatisthis')).toEqual(ERROR);
    expect(adminQuizList('string???1239')).toEqual(ERROR);
  });

  test('Valid Test quizList with 1 quiz', () => {
    const newUser1 = adminAuthRegister('Validemail1@gmail.com', 'password123', 'Jonathan', 'Leung');
    expect(adminQuizCreate(newUser1.authUserId, 'Test Quiz 1', 'Sample Quiz Testing')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizList(newUser1.authUserId)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 1' }] });
    const newUser2 = adminAuthRegister('Validemail2@gmail.com', 'password1234', 'Random', 'Person');
    expect(adminQuizCreate(newUser2.authUserId, 'Test Quiz 2', 'Testing')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizList(newUser2.authUserId)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 2' }] });
  });

  test('Valid Test quizList with multiple quizzes', () => {
    const newUser1 = adminAuthRegister('Validemail1@gmail.com', 'password123', 'Jonathan', 'Leung');
    expect(adminQuizCreate(newUser1.authUserId, 'Test Quiz 1', 'Sample Quiz Testing')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreate(newUser1.authUserId, 'Test Quiz 2', 'Testing')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizList(newUser1.authUserId)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 1' }, { quizId: expect.any(Number), name: 'Test Quiz 2' }] });
    const newUser2 = adminAuthRegister('Validemail2@gmail.com', 'password1234', 'Random', 'Person');
    expect(adminQuizCreate(newUser2.authUserId, 'Test Quiz 1', 'Sample Quiz Testing')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreate(newUser2.authUserId, 'Test Quiz 2', 'Testing')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreate(newUser2.authUserId, 'Test Quiz 3', 'Testing?')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreate(newUser2.authUserId, 'Test Quiz 4', 'Testing!')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizList(newUser2.authUserId)).toEqual({
      quizzes:
            [{ quizId: expect.any(Number), name: 'Test Quiz 1' },
              { quizId: expect.any(Number), name: 'Test Quiz 2' },
              { quizId: expect.any(Number), name: 'Test Quiz 3' },
              { quizId: expect.any(Number), name: 'Test Quiz 4' }
            ]
    });
  });
});

describe('Tests of adminQuizCreate', () => {
  beforeEach(() => {
    clear();
  });

  test('AuthUserId is Invalid', () => {
    const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    expect(adminQuizCreate(newUser.authUserId + 1, 'Test Quiz 1', 'This is a sample test')).toEqual(ERROR);
  });

  test('Normal Case correct output value', () => {
    const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Sample Quiz Testing')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreate(newUser.authUserId, '              ', '')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreate(newUser.authUserId, 'Sam', 'The @3xpl0r3rs J0urn3y')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreate(newUser.authUserId, 'Supercalifragilisticexpialidoc', 'Sample Quiz Testing')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'Exploring the cosmos, seeking answers, and embracing the unknown.')).toEqual({ quizId: expect.any(Number) });
  });

  test('Invalid Quiz Names', () => {
    const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    expect(adminQuizCreate(newUser.authUserId, '@test12345', 'Sample Quiz Testing')).toEqual(ERROR);
    expect(adminQuizCreate(newUser.authUserId, '', 'Sample Quiz Testing')).toEqual(ERROR);
    expect(adminQuizCreate(newUser.authUserId, 'Alexander Bartholomew Fitzwilliam Throckmorton Montgomery III', 'Sample Quiz Testing')).toEqual(ERROR);
    expect(adminQuizCreate(newUser.authUserId, '!!!@@@@##########$$$$$$$$$$$$$**********&&&&&&&&&&&&^^^^^^^^^^', 'Sample Quiz Testing')).toEqual(ERROR);
    expect(adminQuizCreate(newUser.authUserId, '!!!', 'Sample Quiz Testing')).toEqual(ERROR);
    expect(adminQuizCreate(newUser.authUserId, 'J@n3 Sm!th', 'Sample Quiz Testing')).toEqual(ERROR);
    expect(adminQuizCreate(newUser.authUserId, '                                    ', 'Sample Quiz Testing')).toEqual(ERROR);
  });

  test('Removal when there are no quizzes and users', () => {
    expect(adminQuizCreate(0, 'Test 1', 'This should not work')).toEqual(ERROR);
  });

  test('Invalid Description Names', () => {
    const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    expect(adminQuizCreate(newUser.authUserId, 'Divakar Quiz 1', 'This Quiz is on the magnificent cosmos, seeking answers, and discovering wonders. Fantastic!fdvsvsfbrgberbertrtb')).toEqual(ERROR);
  });

  test('Quiz name already exists', () => {
    const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Sample Quiz Testing');
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Surely, this test doesnt exist anymore???')).toEqual(ERROR);
  });

  test('User makes two quizes', () => {
    const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Sample Quiz Testing');
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'Surely, this test works')).toEqual({ quizId: expect.any(Number) });
  });

  test('Testing with clear', () => {
    let newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Surely, this test works')).toEqual({ quizId: expect.any(Number) });
    expect(clear()).toEqual({});

    // Still able to create quiz with same name and user since previous quiz is cleared
    newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Surely, this test works')).toEqual({ quizId: expect.any(Number) });
  });

  test('Quiz name already exists, but a new user is entering it', () => {
    const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Sample Quiz Testing');
    const newUser2 = adminAuthRegister('Validemail2@gmail.com', 'password123', 'Ansh', 'Nimbalkar');
    expect(adminQuizCreate(newUser2.authUserId, 'Test Quiz 1', 'This Test should be working')).toEqual({ quizId: expect.any(Number) });
  });

  test('Making Multiple Quizzes with one user', () => {
    const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Made by Divakar')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'Made by Divakar')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 3', 'Made by Divakar')).toEqual({ quizId: expect.any(Number) });

    // We get an expected error as the quizzes are already created
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Made by Divakar')).toEqual(ERROR);
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'Made by Divakar')).toEqual(ERROR);
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 3', 'Made by Divakar')).toEqual(ERROR);
  });

  test('Making Multiple Quizzes with Multiple Users', () => {
    const newUser1 = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newUser2 = adminAuthRegister('Validemails@gmail.com', 'password123', 'Jason', 'Mascheranous');
    const newUser3 = adminAuthRegister('Validemailt@gmail.com', 'password123', 'Sanath', 'Nevagi');
    expect(adminQuizCreate(newUser1.authUserId, 'Test Quiz 1', 'Made by Divakar')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreate(newUser2.authUserId, 'Test Quiz 2', 'Made by Jason')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreate(newUser3.authUserId, 'Test Quiz 3', 'Made by Sanath')).toEqual({ quizId: expect.any(Number) });

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

  test('AuthUserId is Invalid', () => {
    const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const quizIndex = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'This is a test');
    expect(adminQuizRemove(newUser.authUserId + 1, quizIndex.quizId)).toEqual(ERROR);
  });

  test('QuizId is Invalid', () => {
    const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'This is a test');
    const quizIndex = adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'This is a test');
    expect(adminQuizRemove(newUser.authUserId, quizIndex.quizId + 1)).toEqual(ERROR);
  });

  test('Removal when there are no quizzes', () => {
    const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    expect(adminQuizRemove(newUser.authUserId, 100)).toEqual(ERROR);
  });

  test('Removal when there are no quizzes and users', () => {
    expect(adminQuizRemove(0, 100)).toEqual(ERROR);
  });

  test('Quiz is not owned by the owner', () => {
    const newUser1 = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newUser2 = adminAuthRegister('Validemails@gmail.com', 'password123', 'Jason', 'Mascharanous');
    const quizIndex = adminQuizCreate(newUser1.authUserId, 'Test Quiz 1', 'This is a test');
    expect(adminQuizRemove(newUser2.authUserId, quizIndex.quizId)).toEqual(ERROR);
  });

  test('Deleting one quiz, Normal Case', () => {
    const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const quizIndex = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'This is a test');
    adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'This is a test');
    adminQuizCreate(newUser.authUserId, 'Test Quiz 3', 'This is a test');
    adminQuizCreate(newUser.authUserId, 'Test Quiz 4', 'This is a test');

    // We wont be able to make a new Quiz
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'This is a test')).toEqual(ERROR);

    //  Now, we remove this quiz
    expect(adminQuizRemove(newUser.authUserId, quizIndex.quizId)).toEqual({});

    // Adding the quizes again should return us new quizIds and no error
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'This is a test')).toEqual({ quizId: expect.any(Number) });
  });

  test('Multiple Quizzes Deletion from one user, Normal Case', () => {
    const newUser = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const quizIndex1 = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'This is a test');
    const quizIndex2 = adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'This is a test');
    const quizIndex3 = adminQuizCreate(newUser.authUserId, 'Test Quiz 3', 'This is a test');
    adminQuizCreate(newUser.authUserId, 'Test Quiz 4', 'This is a test');

    // We wont be able to make new Quizzes
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'This is a test')).toEqual(ERROR);
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'This is a test')).toEqual(ERROR);
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 3', 'This is a test')).toEqual(ERROR);

    // Now, we remove this quizzes
    expect(adminQuizRemove(newUser.authUserId, quizIndex1.quizId)).toEqual({});
    expect(adminQuizRemove(newUser.authUserId, quizIndex2.quizId)).toEqual({});
    expect(adminQuizRemove(newUser.authUserId, quizIndex3.quizId)).toEqual({});

    // Adding the quizzes again should return us new quizIds and no error
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'This is a test')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'This is a test')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreate(newUser.authUserId, 'Test Quiz 3', 'This is a test')).toEqual({ quizId: expect.any(Number) });
  });

  test('Multiple quizzes Deletion with mutiple users, Normal Case', () => {
    const newUser1 = adminAuthRegister('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newUser2 = adminAuthRegister('Validemails@gmail.com', 'password123', 'Jason', 'Mascheranous');
    const newUser3 = adminAuthRegister('Validemailt@gmail.com', 'password123', 'Sanath', 'Nevagi');
    const quizIndex1 = adminQuizCreate(newUser1.authUserId, 'Test Quiz 1', 'Made by Divakar');
    const quizIndex2 = adminQuizCreate(newUser2.authUserId, 'Test Quiz 2', 'Made by Jason');
    adminQuizCreate(newUser3.authUserId, 'Test Quiz 3', 'Made by Sanath');

    // We wont be able to make new Quizzes
    adminQuizCreate(newUser1.authUserId, 'Test Quiz 1', 'Made by Divakar');
    adminQuizCreate(newUser2.authUserId, 'Test Quiz 2', 'Made by Jason');

    // Now, we remove this quizzes
    expect(adminQuizRemove(newUser1.authUserId, quizIndex1.quizId)).toEqual({});
    expect(adminQuizRemove(newUser2.authUserId, quizIndex2.quizId)).toEqual({});

    // Adding the quizzes again should return us new quizIds and no error
    expect(adminQuizCreate(newUser1.authUserId, 'Test Quiz 1', 'Made by Divakar')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreate(newUser2.authUserId, 'Test Quiz 2', 'Made by Jason')).toEqual({ quizId: expect.any(Number) });
  });
});

describe('Tests for adminQuizDescriptionUpdate', () => {
  test('authUserId is Invalid', () => {
    clear();
    const newUser = adminAuthRegister('tomcruise@gmail.com', 'eight12345', 'Firstname', 'Lastname');
    const newUser1 = adminAuthRegister('Newemail@gmail.com', 'eight12345', 'Firstname', 'Lastname');
    const newquiz = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Made by Ujjwal');
    const newquiz1 = adminQuizCreate(newUser1.authUserId, 'Test Quiz 1', 'Made by Ujjwal');
    // Invalid authUserId
    expect(adminQuizDescriptionUpdate(newUser.authUserId + 1, newquiz.quizId, 'a')).toStrictEqual(ERROR);

    // Error Edge Case
    expect(adminQuizDescriptionUpdate(0, 100, 'a')).toStrictEqual(ERROR);

    // Valid authUserId
    expect(adminQuizDescriptionUpdate(newUser.authUserId, newquiz.quizId, 'a')).toEqual({});
    expect(adminQuizDescriptionUpdate(newUser1.authUserId, newquiz1.quizId, 'b')).toEqual({});
  });

  test('quizId is Invalid', () => {
    clear();
    const newUser = adminAuthRegister('tomcruise@gmail.com', 'eight12345', 'Firstname', 'Lastname');
    const newUser1 = adminAuthRegister('Validemails@gmail.com', 'password123', 'Jack', 'Brooks');
    const newquiz = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Made by Ujjwal');
    const newquiz1 = adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'Made by Ujjwal');
    // Case 1: Invalid quizId testing
    expect(adminQuizDescriptionUpdate(newUser.authUserId, newquiz.quizId + 1, 'a')).toStrictEqual(ERROR);

    // Case 2: Quiz is not owned by the owner
    expect(adminQuizDescriptionUpdate(newUser1.authUserId, newquiz.quizId, '')).toEqual(ERROR);

    // Case 3: Valid quizId testing
    expect(adminQuizDescriptionUpdate(newUser.authUserId, newquiz.quizId, 'a')).toEqual({ });
    expect(adminQuizDescriptionUpdate(newUser.authUserId, newquiz1.quizId, 'b')).toEqual({ });
  });

  test('Description Testing (Invalid and Valid)', () => {
    clear();
    const newUser = adminAuthRegister('kyrieirving@gmail.com', 'eight12345', 'Firstname', 'Lastname');
    const newquiz = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Made by Ujjwal');
    const newquiz2 = adminQuizCreate(newUser.authUserId, 'Test Quiz 2', 'Made by Ujjwal');
    const newquiz3 = adminQuizCreate(newUser.authUserId, 'Test Quiz 3', 'Made by Ujjwal');
    // Case 1: Invalid description testing
    expect(adminQuizDescriptionUpdate(newUser.authUserId, newquiz.quizId, 'ThisStringNOTIsExactly100CharactersLongThisStringNOTIsExactly100CharactersLong Andrew is such a great tutor Andrew is such a great tutor Andrew is such a great tutor Andrew is such a great tutor')).toStrictEqual(ERROR);
    expect(adminQuizDescriptionUpdate(newUser.authUserId, newquiz.quizId, 'Andrew is such a great tutor    LongThisStringIsExactly100CharactersLongThisStringIsExactly100Charact')).toStrictEqual(ERROR);
    expect(adminQuizInfo(newUser.authUserId, newquiz3.quizId)).toEqual({
      quizId: newquiz3.quizId,
      name: 'Test Quiz 3',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Made by Ujjwal',
    });

    expect(adminQuizDescriptionUpdate(newUser.authUserId, newquiz.quizId, '11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111')).toEqual(ERROR);

    expect(adminQuizInfo(newUser.authUserId, newquiz3.quizId)).toEqual({
      quizId: newquiz3.quizId,
      name: 'Test Quiz 3',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Made by Ujjwal',
    });

    // Case 2: Valid description testing (edge cases)
    expect(adminQuizDescriptionUpdate(newUser.authUserId, newquiz2.quizId, 'Andrew is such a great tutor    LongThisStringIsExactly100CharactersLongThisStringIsExactly100Charac')).toEqual({ });
    expect(adminQuizInfo(newUser.authUserId, newquiz2.quizId)).toEqual({
      quizId: newquiz2.quizId,
      name: 'Test Quiz 2',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Andrew is such a great tutor    LongThisStringIsExactly100CharactersLongThisStringIsExactly100Charac',
    });

    expect(adminQuizDescriptionUpdate(newUser.authUserId, newquiz3.quizId, '')).toEqual({ });
    expect(adminQuizInfo(newUser.authUserId, newquiz3.quizId)).toEqual({
      quizId: newquiz3.quizId,
      name: 'Test Quiz 3',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: '',
    });
  });
  test('Valid Tests', () => {
    clear();
    const newUser = adminAuthRegister('kyrieirving@gmail.com', 'eight12345', 'Firstname', 'Lastname');
    const newUser1 = adminAuthRegister('Validemails@gmail.com', 'password123', 'Jack', 'Brooks');
    const newquiz = adminQuizCreate(newUser.authUserId, 'Test Quiz 1', 'Made by Ujjwal');
    const newquiz1 = adminQuizCreate(newUser1.authUserId, 'Test Quiz 2', 'Made by Ujjwal');

    expect(adminQuizInfo(newUser.authUserId, newquiz.quizId)).toEqual({
      quizId: newquiz.quizId,
      name: 'Test Quiz 1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Made by Ujjwal',
    });
    expect(adminQuizDescriptionUpdate(newUser.authUserId, newquiz.quizId, 'Made by Ansh')).toEqual({ });
    expect(adminQuizInfo(newUser.authUserId, newquiz.quizId)).toEqual({
      quizId: newquiz.quizId,
      name: 'Test Quiz 1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Made by Ansh',
    });

    expect(adminQuizDescriptionUpdate(newUser1.authUserId, newquiz1.quizId, '')).toEqual({ });
  });
});

describe('Tests for adminQuizInfo', () => {
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

describe('Tests for adminQuizNameUpdate', () => {
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
*/
