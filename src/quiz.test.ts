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

/// /////////////////////// Epilouge //////////////////////////////
// TODO: Add relevant tests calling the server.ts files

test('Nice Test', () => {
  expect(1 + 1).toEqual(2);
});
