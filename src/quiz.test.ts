// New .ts file to implement tests for quiz.ts functions through the server

import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';

import { clearRequest } from './other.test';

// ADD THESE LATER PLEASE
// import { authLoginRequest, authLogoutRequest } from './auth.test';

import { authRegisterRequest } from './auth.test';

import { IncomingHttpHeaders } from 'http';
import HTTPError from 'http-errors';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 10000;

interface Payload {
  [key: string]: any;
}

/// ////////////////////////////// Request Helper Function Wrapper ////////////////////////////////

// Helpers
const requestHelper = (
  method: HttpVerb,
  path: string,
  payload: Payload,
  headers: IncomingHttpHeaders = {}
): any => {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method.toUpperCase())) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }

  const url = SERVER_URL + path;
  const res = request(method, url, { qs, json, headers, timeout: TIMEOUT_MS });

  let responseBody: any;
  try {
    responseBody = JSON.parse(res.body.toString());
  } catch (err: any) {
    if (res.statusCode === 200) {
      throw HTTPError(500,
        `Non-jsonifiable body despite code 200: '${res.body}'.\nCheck that you are not doing res.json(undefined) instead of res.json({}), e.g. in '/clear'`
      );
    }
    responseBody = { error: `Failed to parse JSON: '${err.message}'` };
  }

  const errorMessage = `[${res.statusCode}] ` + responseBody?.error || responseBody || 'No message specified!';

  // NOTE: the error is rethrown in the test below. This is useful becasuse the
  // test suite will halt (stop) if there's an error, rather than carry on and
  // potentially failing on a different expect statement without useful outputs
  switch (res.statusCode) {
    case 400: // BAD_REQUEST
    case 401: // UNAUTHORIZED
      throw HTTPError(res.statusCode, errorMessage);
    case 404: // NOT_FOUND
      throw HTTPError(res.statusCode, `Cannot find '${url}' [${method}]\nReason: ${errorMessage}\n\nHint: Check that your server.ts have the correct path AND method`);
    case 500: // INTERNAL_SERVER_ERROR
      throw HTTPError(res.statusCode, errorMessage + '\n\nHint: Your server crashed. Check the server log!\n');
    default:
      if (res.statusCode !== 200) {
        throw HTTPError(res.statusCode, errorMessage + `\n\nSorry, no idea! Look up the status code ${res.statusCode} online!\n`);
      }
  }
  return responseBody;
};

/// /////////////////////// Server Functions ///////////////////////////

export function adminQuizCreateRequest(token: string, name: string, description: string) {
  return requestHelper('POST', '/v2/admin/quiz', { name, description }, { token });
}

export function adminQuizRemoveRequest(token: string, quizid: number) {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizid}`, {}, { token });
}

export function adminQuizInfoRequest(token: string, quizid: number) {
  return requestHelper('GET', `/v2/admin/quiz/${quizid}`, {}, { token });
}

export function adminQuizListRequest(token: string) {
  return requestHelper('GET', '/v2/admin/quiz/list', {}, { token });
}

export function adminQuizViewTrashRequest(token: string) {
  return requestHelper('GET', '/v2/admin/quiz/trash', {}, { token });
}

export function adminQuizTransferRequest(token: string, quizid: number, userEmail: string) {
  return requestHelper('POST', `/v2/admin/quiz/${quizid}/transfer`, { userEmail }, { token });
}

/// ////////////////////////// Main Tests /////////////////////////////

describe('Tests of adminQuizCreate', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Token is Empty', () => {
    expect(() => adminQuizCreateRequest('', 'Test Quiz 1', 'This is a sample test')).toThrow(HTTPError[401]);
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
    expect(() => adminQuizCreateRequest(newUser.token, '@test12345', 'Sample Quiz Testing')).toThrow(HTTPError[400]);
    expect(() => adminQuizCreateRequest(newUser.token, '', 'Sample Quiz Testing')).toThrow(HTTPError[400]);
    expect(() => adminQuizCreateRequest(newUser.token, 'Alexander Bartholomew Fitzwilliam Throckmorton Montgomery III', 'Sample Quiz Testing')).toThrow(HTTPError[400]);
    expect(() => adminQuizCreateRequest(newUser.token, '!!!@@@@##########$$$$$$$$$$$$$**********&&&&&&&&&&&&^^^^^^^^^^', 'Sample Quiz Testing')).toThrow(HTTPError[400]);
    expect(() => adminQuizCreateRequest(newUser.token, '!!!', 'Sample Quiz Testing')).toThrow(HTTPError[400]);
    expect(() => adminQuizCreateRequest(newUser.token, 'J@n3 Sm!th', 'Sample Quiz Testing')).toThrow(HTTPError[400]);
    expect(() => adminQuizCreateRequest(newUser.token, '                                    ', 'Sample Quiz Testing')).toThrow(HTTPError[400]);
  });

  test('Invalid Description Names', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    expect(() => adminQuizCreateRequest(newUser.token, 'Divakar Quiz 1', 'This Quiz is on the magnificent cosmos, seeking answers, and discovering wonders. Fantastic!fdvsvsfbrgberbertrtb')).toThrow(HTTPError[400]);
  });

  test('Quiz name already exists', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Sample Quiz Testing');
    expect(() => adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Surely, this test doesnt exist anymore???')).toThrow(HTTPError[400]);
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
    expect(() => adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Made by Divakar')).toThrow(HTTPError[400]);
    expect(() => adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'Made by Divakar')).toThrow(HTTPError[400]);
    expect(() => adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'Made by Divakar')).toThrow(HTTPError[400]);
  });

  test('Making Multiple Quizzes with Multiple Users', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newUser2 = authRegisterRequest('Validemails@gmail.com', 'password123', 'Jason', 'Mascheranous');
    const newUser3 = authRegisterRequest('Validemailt@gmail.com', 'password123', 'Sanath', 'Nevagi');
    expect(adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Made by Divakar')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Made by Jason')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser3.token, 'Test Quiz 3', 'Made by Sanath')).toEqual({ quizId: expect.any(Number) });

    // We get an expected error as the quizzes are already created
    expect(() => adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Made by Divakar')).toThrow(HTTPError[400]);
    expect(() => adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Made by Jason')).toThrow(HTTPError[400]);
    expect(() => adminQuizCreateRequest(newUser3.token, 'Test Quiz 3', 'Made by Sanath')).toThrow(HTTPError[400]);
  });
});

describe('Tests of adminQuizInfo', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Token is Invalid', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
    const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizInfoRequest('', quizIndex.quizId)).toThrow(HTTPError[401]);
  });

  test('QuizId is Invalid', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
    adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test');
    expect(() => adminQuizInfoRequest(newUser.token, quizIndex.quizId + 1)).toThrow(HTTPError[403]);
  });

  test('Quiz is not owned by the owner', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
    const newUser2 = authRegisterRequest('Validemails@gmail.com', 'password123', 'Jane', 'Choi');
    const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizInfoRequest(newUser2.token, quizIndex.quizId)).toThrow(HTTPError[403]);
  });

  test('Quiz Info Successful', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
    const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    expect(adminQuizInfoRequest(newUser.token, quizIndex.quizId)).toEqual({
      quizId: quizIndex.quizId,
      name: 'Test Quiz 1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'This is a test',
      questions: [],
      duration: expect.any(Number),
      numQuestions: expect.any(Number)
    });
  });
});

describe('Tests of adminQuizRemove', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Token is Invalid', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizRemoveRequest('', quizIndex.quizId)).toThrow(HTTPError[401]);
  });

  test('QuizId is Invalid', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizRemoveRequest(newUser.token, quizIndex.quizId + 1)).toThrow(HTTPError[400]);
  });

  test('Removal when there are no quizzes', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    expect(() => adminQuizRemoveRequest(newUser.token, 100)).toThrow(HTTPError[400]);
  });

  test('Valid Token Provided but user is not owner of the quiz', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newUser2 = authRegisterRequest('Validemail12@gmail.com', 'password123', 'Shubham', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizRemoveRequest(newUser2.token, quizIndex.quizId)).toThrow(HTTPError[403]);
  });

  test('Deleting one quiz, Normal Case', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test');
    adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'This is a test');
    adminQuizCreateRequest(newUser.token, 'Test Quiz 4', 'This is a test');

    // We wont be able to make a new Quiz
    expect(() => adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test')).toThrow(HTTPError[400]);

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
    expect(() => adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test')).toThrow(HTTPError[400]);
    expect(() => adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test')).toThrow(HTTPError[400]);
    expect(() => adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'This is a test')).toThrow(HTTPError[400]);

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
    expect(() => adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Made by Divakar')).toThrow(HTTPError[400]);
    expect(() => adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Made by Jason')).toThrow(HTTPError[400]);

    // Now, we remove this quizzes
    expect(adminQuizRemoveRequest(newUser1.token, quizIndex1.quizId)).toEqual({});
    expect(adminQuizRemoveRequest(newUser2.token, quizIndex2.quizId)).toEqual({});

    // Adding the quizzes again should return us new quizIds and no error
    expect(adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Made by Divakar')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Made by Jason')).toEqual({ quizId: expect.any(Number) });
  });
});

describe('Tests of adminQuizList', () => {
  beforeEach(() => {
    clearRequest();
  });
  test('Empty or Invalid token', () => {
    expect(() => adminQuizListRequest('not a token')).toThrow(HTTPError[401]);
    expect(() => adminQuizListRequest('')).toThrow(HTTPError[401]);
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

describe('Tests for adminQuizViewTrash', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Empty or Invalid token', () => {
    expect(() => adminQuizListRequest('not a token')).toThrow(HTTPError[401]);
    expect(() => adminQuizListRequest('')).toThrow(HTTPError[401]);
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

describe('Tests of adminQuizTransfer', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Tests for empty or invalid token', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizTransferRequest('', quizIndex.quizId, 'Validemail2@gmail.com')).toThrow(HTTPError[401]);
  });

  test('Tests for Invalid Quiz', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizTransferRequest(newUser1.token, quizIndex.quizId + 1, 'Validemail2@gmail.com')).toThrow(HTTPError[400]);
  });

  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizTransferRequest(newUser2.token, quizIndex.quizId, 'Validemail@gmail.com')).toThrow(HTTPError[403]);
  });

  test('Test for Normal Cases', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(adminQuizTransferRequest(newUser1.token, quizIndex.quizId, 'Validemail2@gmail.com')).toEqual({});

    // Doesn't add a new quiz as the quiz already exists for the userId
    expect(() => adminQuizCreateRequest(newUser2.token, 'Test Quiz 1', 'This is a test')).toThrow(HTTPError[400]);
  });

  test('Test for Invalid Email', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizTransferRequest(newUser1.token, quizIndex.quizId, 'Validemail5@gmail.com')).toThrow(HTTPError[400]);
  });

  test('Test for Current User Email is Same as Current User ', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizTransferRequest(newUser1.token, quizIndex.quizId, 'Validemail@gmail.com')).toThrow(HTTPError[400]);
  });

  test('Test for when Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    adminQuizCreateRequest(newUser2.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizTransferRequest(newUser1.token, quizIndex.quizId, 'Validemail2@gmail.com')).toThrow(HTTPError[400]);
  });
});
