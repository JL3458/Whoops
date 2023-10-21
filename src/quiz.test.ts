// New .ts file to implement tests for quiz.ts functions through the server

import request from 'sync-request-curl';
import { port, url } from './config.json';
import { clearRequest } from './other.test';
import { authRegisterRequest } from './auth.test';
const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };

/// /////////////////// Helper Functions //////////////////////

export function adminQuizCreateRequest(token: string, name: string, description: string) {
  const request1 = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token, name: name, description: description } });
  return JSON.parse(request1.body as string);
}

export function adminQuizRemoveRequest(token: string, quizid: number) {
  const request1 = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizid}`, { json: { token: token } });
  return JSON.parse(request1.body as string);
}

/// ////////////////////// Main Tests /////////////////////////////

describe('Tests of adminQuizCreate', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Token is Empty', () => {
    expect(adminQuizCreateRequest('', 'Test Quiz 1', 'This is a sample test')).toEqual(ERROR);
  });

  test('Normal Case correct output value', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Sample Quiz Testing')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser.token, '              ', '')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser.token, 'Sam', 'The @3xpl0r3rs J0urn3y')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser.token, 'Supercalifragilisticexpialidoc', 'Sample Quiz Testing')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'Exploring the cosmos, seeking answers, and embracing the unknown.')).toEqual({ quizId: expect.any(Number) });
  });

  test('Invalid Quiz Names', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    expect(adminQuizCreateRequest(newUser.token, '@test12345', 'Sample Quiz Testing')).toEqual(ERROR);
    expect(adminQuizCreateRequest(newUser.token, '', 'Sample Quiz Testing')).toEqual(ERROR);
    expect(adminQuizCreateRequest(newUser.token, 'Alexander Bartholomew Fitzwilliam Throckmorton Montgomery III', 'Sample Quiz Testing')).toEqual(ERROR);
    expect(adminQuizCreateRequest(newUser.token, '!!!@@@@##########$$$$$$$$$$$$$**********&&&&&&&&&&&&^^^^^^^^^^', 'Sample Quiz Testing')).toEqual(ERROR);
    expect(adminQuizCreateRequest(newUser.token, '!!!', 'Sample Quiz Testing')).toEqual(ERROR);
    expect(adminQuizCreateRequest(newUser.token, 'J@n3 Sm!th', 'Sample Quiz Testing')).toEqual(ERROR);
    expect(adminQuizCreateRequest(newUser.token, '                                    ', 'Sample Quiz Testing')).toEqual(ERROR);
  });

  test('Invalid Description Names', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    expect(adminQuizCreateRequest(newUser.token, 'Divakar Quiz 1', 'This Quiz is on the magnificent cosmos, seeking answers, and discovering wonders. Fantastic!fdvsvsfbrgberbertrtb')).toEqual(ERROR);
  });

  test('Quiz name already exists', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Sample Quiz Testing');
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Surely, this test doesnt exist anymore???')).toEqual(ERROR);
  });

  test('User makes two quizes', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Sample Quiz Testing');
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'Surely, this test works')).toEqual({ quizId: expect.any(Number) });
  });

  test('Testing with clearRequest', () => {
    let newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Surely, this test works')).toEqual({ quizId: expect.any(Number) });
    expect(clearRequest()).toEqual({});

    // Still able to create quiz with same name and user since previous quiz is cleared
    newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Surely, this test works')).toEqual({ quizId: expect.any(Number) });
  });

  test('Quiz name already exists, but a new user is entering it', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Sample Quiz Testing');
    const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password123', 'Ansh', 'Nimbalkar');
    expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 1', 'This Test should be working')).toEqual({ quizId: expect.any(Number) });
  });

  test('Making Multiple Quizzes with one user', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Made by Divakar')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'Made by Divakar')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'Made by Divakar')).toEqual({ quizId: expect.any(Number) });

    // We get an expected error as the quizzes are already created
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Made by Divakar')).toEqual(ERROR);
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'Made by Divakar')).toEqual(ERROR);
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'Made by Divakar')).toEqual(ERROR);
  });

  test('Making Multiple Quizzes with Multiple Users', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newUser2 = authRegisterRequest('Validemails@gmail.com', 'password123', 'Jason', 'Mascheranous');
    const newUser3 = authRegisterRequest('Validemailt@gmail.com', 'password123', 'Sanath', 'Nevagi');
    expect(adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Made by Divakar')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Made by Jason')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser3.token, 'Test Quiz 3', 'Made by Sanath')).toEqual({ quizId: expect.any(Number) });

    // We get an expected error as the quizes are already created
    expect(adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Made by Divakar')).toEqual(ERROR);
    expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Made by Jason')).toEqual(ERROR);
    expect(adminQuizCreateRequest(newUser3.token, 'Test Quiz 3', 'Made by Sanath')).toEqual(ERROR);
  });
});

describe('Tests of adminQuizRemove', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Token is Invalid', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    expect(adminQuizRemoveRequest('', quizIndex.quizId)).toEqual(ERROR);
  });

  test('QuizId is Invalid', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test');
    expect(adminQuizRemoveRequest(newUser.token, quizIndex.quizId + 1)).toEqual(ERROR);
  });

  test('Removal when there are no quizzes', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    expect(adminQuizRemoveRequest(newUser.token, 100)).toEqual(ERROR);
  });

  test('Quiz is not owned by the owner', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newUser2 = authRegisterRequest('Validemails@gmail.com', 'password123', 'Jason', 'Mascharanous');
    const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(adminQuizRemoveRequest(newUser2.token, quizIndex.quizId)).toEqual(ERROR);
  });

  test('Deleting one quiz, Normal Case', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test');
    adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'This is a test');
    adminQuizCreateRequest(newUser.token, 'Test Quiz 4', 'This is a test');

    // We wont be able to make a new Quiz
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test')).toEqual(ERROR);

    //  Now, we remove this quiz
    expect(adminQuizRemoveRequest(newUser.token, quizIndex.quizId)).toEqual({});

    // Adding the quizes again should return us new quizIds and no error
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test')).toEqual({ quizId: expect.any(Number) });
  });

  test('Multiple Quizzes Deletion from one user, Normal Case', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const quizIndex1 = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const quizIndex2 = adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test');
    const quizIndex3 = adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'This is a test');
    adminQuizCreateRequest(newUser.token, 'Test Quiz 4', 'This is a test');

    // We wont be able to make new Quizzes
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test')).toEqual(ERROR);
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test')).toEqual(ERROR);
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'This is a test')).toEqual(ERROR);

    // Now, we remove this quizzes
    expect(adminQuizRemoveRequest(newUser.token, quizIndex1.quizId)).toEqual({});
    expect(adminQuizRemoveRequest(newUser.token, quizIndex2.quizId)).toEqual({});
    expect(adminQuizRemoveRequest(newUser.token, quizIndex3.quizId)).toEqual({});

    // Adding the quizzes again should return us new quizIds and no error
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'This is a test')).toEqual({ quizId: expect.any(Number) });
  });

  test('Multiple quizzes Deletion with mutiple users, Normal Case', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newUser2 = authRegisterRequest('Validemails@gmail.com', 'password123', 'Jason', 'Mascheranous');
    const newUser3 = authRegisterRequest('Validemailt@gmail.com', 'password123', 'Sanath', 'Nevagi');
    const quizIndex1 = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Made by Divakar');
    const quizIndex2 = adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Made by Jason');
    adminQuizCreateRequest(newUser3.token, 'Test Quiz 3', 'Made by Sanath');

    // We wont be able to make new Quizzes
    adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Made by Divakar');
    adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Made by Jason');

    // Now, we remove this quizzes
    expect(adminQuizRemoveRequest(newUser1.token, quizIndex1.quizId)).toEqual({});
    expect(adminQuizRemoveRequest(newUser2.token, quizIndex2.quizId)).toEqual({});

    // Adding the quizzes again should return us new quizIds and no error
    expect(adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Made by Divakar')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Made by Jason')).toEqual({ quizId: expect.any(Number) });
  });
});

/// /////////////////////// Epilouge //////////////////////////////
// TODO: Add relevant tests calling the server.ts files

test('Nice Test', () => {
  expect(1 + 1).toEqual(2);
});
