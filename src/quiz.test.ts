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

export function adminQuizListRequest(token: string) {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token } });
  return JSON.parse(res.body.toString());
}

export function adminQuizTransferRequest(token: string, quizid: number, userEmail: string) {
  const request1 = request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/transfer`, { json: { token: token, userEmail: userEmail } });
  return JSON.parse(request1.body as string);
}

export function adminQuizViewTrashRequest(token: string) {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/trash', { qs: { token } });
  return JSON.parse(res.body.toString());
}
/// ////////////////////// Main Tests /////////////////////////////

describe('Tests for adminQuizList', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Invalid token', () => {
    expect(adminQuizListRequest('234097634')).toEqual(ERROR);
    expect(adminQuizListRequest('1248734')).toEqual(ERROR);
    expect(adminQuizListRequest('24763')).toEqual(ERROR);
    expect(adminQuizListRequest('5487')).toEqual(ERROR);
  });

  test('Valid Test quizList with 1 quiz', () => {
    const newUser1 = authRegisterRequest('Validemail1@gmail.com', 'password123', 'Jonathan', 'Leung');
    expect(adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Sample Quiz Testing')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizListRequest(newUser1.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 1' }] });
    const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password1234', 'Random', 'Person');
    expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Testing')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizListRequest(newUser2.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 2' }] });
  });

  test('Valid Test quizList with multiple quizzes', () => {
    const newUser1 = authRegisterRequest('Validemail1@gmail.com', 'password123', 'Jonathan', 'Leung');
    expect(adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Sample Quiz Testing')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser1.token, 'Test Quiz 2', 'Testing')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizListRequest(newUser1.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 1' }, { quizId: expect.any(Number), name: 'Test Quiz 2' }] });
    const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password1234', 'Random', 'Person');
    expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 1', 'Sample Quiz Testing')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Testing')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 3', 'Testing?')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 4', 'Testing!')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizListRequest(newUser2.token)).toEqual({
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

describe('Tests of adminQuizTransfer', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Token is Invalid', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(adminQuizTransferRequest('', quizIndex.quizId, 'Validemail2@gmail.com')).toEqual(ERROR);
  });

  test('Tests for Invalid Quiz', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(adminQuizTransferRequest(newUser1.token, quizIndex.quizId + 1, 'Validemail2@gmail.com')).toEqual(ERROR);
  });

  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(adminQuizTransferRequest(newUser2.token, quizIndex.quizId, 'Validemail2@gmail.com')).toEqual(ERROR);
  });

  test('Test for Normal Cases', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(adminQuizTransferRequest(newUser1.token, quizIndex.quizId, 'Validemail2@gmail.com')).toEqual({});

    // Doesn't add a new quiz as the quiz already exists for the userId
    expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 1', 'This is a test')).toEqual(ERROR);
  });

  test('Test for Invalid Email', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(adminQuizTransferRequest(newUser1.token, quizIndex.quizId, 'Validemail5@gmail.com')).toEqual(ERROR);
  });

  test('Test for Current User Email is Same as Current User ', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(adminQuizTransferRequest(newUser1.token, quizIndex.quizId, 'Validemail@gmail.com')).toEqual(ERROR);
  });

  test('Test for when Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    adminQuizCreateRequest(newUser2.token, 'Test Quiz 1', 'This is a test');
    expect(adminQuizTransferRequest(newUser1.token, quizIndex.quizId, 'Validemail2@gmail.com')).toEqual(ERROR);
  });
});

describe('Tests for adminQuizViewTrash', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Invalid token', () => {
    expect(adminQuizViewTrashRequest('234097634')).toEqual(ERROR);
    expect(adminQuizViewTrashRequest('1248734')).toEqual(ERROR);
    expect(adminQuizViewTrashRequest('24763')).toEqual(ERROR);
    expect(adminQuizViewTrashRequest('5487')).toEqual(ERROR);
  });

  test('Valid Test quizViewTrash with 1 quiz', () => {
    const newUser1 = authRegisterRequest('Validemail1@gmail.com', 'password123', 'Jonathan', 'Leung');
    const quiz1 = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(adminQuizRemoveRequest(newUser1.token, quiz1.quizId)).toEqual({});
    expect(adminQuizViewTrashRequest(newUser1.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 1' }] });
    const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password1234', 'Random', 'Person');
    const quiz2 = adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Testing');
    expect(adminQuizRemoveRequest(newUser2.token, quiz2.quizId)).toEqual({});
    expect(adminQuizViewTrashRequest(newUser2.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 2' }] });
  });

  test('Valid Test quizViewTrash with multiple quizzes', () => {
    const newUser1 = authRegisterRequest('Validemail1@gmail.com', 'password123', 'Jonathan', 'Leung');
    const quiz1 = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Sample Quiz Testing');
    const quiz2 = adminQuizCreateRequest(newUser1.token, 'Test Quiz 2', 'Testing');
    expect(adminQuizRemoveRequest(newUser1.token, quiz1.quizId)).toEqual({});
    expect(adminQuizRemoveRequest(newUser1.token, quiz2.quizId)).toEqual({});
    expect(adminQuizViewTrashRequest(newUser1.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 1' }, { quizId: expect.any(Number), name: 'Test Quiz 2' }] });
    const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password1234', 'Random', 'Person');
    const quiz3 = adminQuizCreateRequest(newUser2.token, 'Test Quiz 1', 'Sample Quiz Testing');
    const quiz4 = adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Testing');
    const quiz5 = adminQuizCreateRequest(newUser2.token, 'Test Quiz 3', 'Testing?');
    const quiz6 = adminQuizCreateRequest(newUser2.token, 'Test Quiz 4', 'Testing!');
    expect(adminQuizRemoveRequest(newUser2.token, quiz3.quizId)).toEqual({});
    expect(adminQuizRemoveRequest(newUser2.token, quiz4.quizId)).toEqual({});
    expect(adminQuizRemoveRequest(newUser2.token, quiz5.quizId)).toEqual({});
    expect(adminQuizRemoveRequest(newUser2.token, quiz6.quizId)).toEqual({});
    expect(adminQuizViewTrashRequest(newUser2.token)).toEqual({
      quizzes:
            [{ quizId: expect.any(Number), name: 'Test Quiz 1' },
              { quizId: expect.any(Number), name: 'Test Quiz 2' },
              { quizId: expect.any(Number), name: 'Test Quiz 3' },
              { quizId: expect.any(Number), name: 'Test Quiz 4' }
            ]
    });
  });
});
/// /////////////////////// Epilouge //////////////////////////////
// TODO: Add relevant tests calling the server.ts files

test('Nice Test', () => {
  expect(1 + 1).toEqual(2);
});
