// New .ts file to implement tests for quiz.ts functions through the server

import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';

import { clearRequest } from './other.test';
import { authRegisterRequest } from './auth.test';
import { adminQuizCreateQuestionRequest } from './question.test';
import { adminSessionStartRequest } from './session.test';

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

export function adminQuizDescriptionUpdateRequest(token: string, quizid: number, description: string) {
  return requestHelper('PUT', `/v2/admin/quiz/${quizid}/description`, { description }, { token });
}

export function adminQuizRemoveRequest(token: string, quizid: number) {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizid}`, {}, { token });
}

export function adminQuizTrashEmptyRequest(token: string, quizIds: string) {
  return requestHelper('DELETE', '/v2/admin/quiz/trash/empty', { quizIds }, { token });
}

export function adminQuizNameUpdateRequest(token: string, quizid: number, name: string) {
  return requestHelper('PUT', `/v2/admin/quiz/${quizid}/name`, { name }, { token });
}

function adminQuizListRequest(token: string) {
  return requestHelper('GET', '/v2/admin/quiz/list', {}, { token });
}

export function adminQuizViewTrashRequest(token: string) {
  return requestHelper('GET', '/v2/admin/quiz/trash', {}, { token });
}

export function adminQuizRestoreRequest(token: string, quizid: number) {
  return requestHelper('POST', `/v2/admin/quiz/${quizid}/restore`, {}, { token });
}

export function adminQuizTransferRequest(token: string, quizid: number, userEmail: string) {
  return requestHelper('POST', `/v2/admin/quiz/${quizid}/transfer`, { userEmail }, { token });
}

export function adminQuizInfoRequest(token: string, quizid: number) {
  return requestHelper('GET', `/v2/admin/quiz/${quizid}`, {}, { token });
}

export function adminQuizThumbnailUpdateRequest(token: string, quizid: number, imgUrl: string) {
  return requestHelper('PUT', `/v1/admin/quiz/${quizid}/thumbnail`, { imgUrl }, { token });
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
      numQuestions: expect.any(Number),
      thumbnailUrl: ''
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

  test('Removal when sessions are not in END state', () => {
    const User1 = authRegisterRequest('landonorris@gmail.com', 'validpassword12', 'Kyrie', 'Irving');
    const Quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
    const Question1 =
    {
      question: 'Sample Question 1',
      duration: 5,
      points: 4,
      answers: [
        {
          answer: 'Prince Wales',
          correct: true
        },
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Prince Diana',
          correct: true
        }
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    };
    adminQuizCreateQuestionRequest(User1.token, Quiz1.quizId, Question1);
    expect(adminSessionStartRequest(User1.token, Quiz1.quizId, 1)).toEqual({ sessionId: expect.any(Number) });
    expect(() => adminQuizRemoveRequest(User1.token, Quiz1.quizId)).toThrow(HTTPError[400]);
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

  test('Tests for sessions are not in END state', () => {
    const User1 = authRegisterRequest('landonorris@gmail.com', 'validpassword12', 'Kyrie', 'Irving');
    authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
    const Quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
    const Question1 =
    {
      question: 'Sample Question 1',
      duration: 5,
      points: 4,
      answers: [
        {
          answer: 'Prince Wales',
          correct: true
        },
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Prince Diana',
          correct: true
        }
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    };
    adminQuizCreateQuestionRequest(User1.token, Quiz1.quizId, Question1);
    expect(adminSessionStartRequest(User1.token, Quiz1.quizId, 1)).toEqual({ sessionId: expect.any(Number) });
    expect(() => adminQuizTransferRequest(User1.token, Quiz1.quizId, 'Validemail2@gmail.com')).toThrow(HTTPError[400]);
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

describe('Tests of adminQuizNameUpdate', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Token is Invalid', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
    const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizNameUpdateRequest('', quizIndex.quizId, 'New Name')).toThrow(HTTPError[401]);
  });

  test('QuizId is Invalid', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
    adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test');
    expect(() => adminQuizNameUpdateRequest(newUser.token, quizIndex.quizId + 1, 'New Name')).toThrow(HTTPError[403]);
  });

  test('Quiz is not owned by the owner', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
    const newUser2 = authRegisterRequest('Validemails@gmail.com', 'password123', 'Jane', 'Choi');
    const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizNameUpdateRequest(newUser2.token, quizIndex.quizId, 'New Name')).toThrow(HTTPError[403]);
  });

  test('Invalid Quiz Names', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
    const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizNameUpdateRequest(newUser.token, quizIndex.quizId, '')).toThrow(HTTPError[400]);
    expect(() => adminQuizNameUpdateRequest(newUser.token, quizIndex.quizId, 'Alexander Bartholomew Fitzwilliam Throckmorton Montgomery III')).toThrow(HTTPError[400]);
    expect(() => adminQuizNameUpdateRequest(newUser.token, quizIndex.quizId, '!!!@@@@##########$$$$$$$$$$$$$**********&&&&&&&&&&&&^^^^^^^^^^')).toThrow(HTTPError[400]);
    expect(() => adminQuizNameUpdateRequest(newUser.token, quizIndex.quizId, '!!!')).toThrow(HTTPError[400]);
    expect(() => adminQuizNameUpdateRequest(newUser.token, quizIndex.quizId, 'J@n3 Sm!th')).toThrow(HTTPError[400]);
    expect(() => adminQuizNameUpdateRequest(newUser.token, quizIndex.quizId, '                                    ')).toThrow(HTTPError[400]);
  });

  test('Quiz name already exists', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
    const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'Sample Quiz Testing');
    expect(() => adminQuizNameUpdateRequest(newUser.token, quizIndex.quizId, 'Test Quiz 2')).toThrow(HTTPError[400]);
  });

  test('Changing Name Successfully', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
    const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    expect(adminQuizNameUpdateRequest(newUser.token, quizIndex.quizId, 'Test Quiz 2')).toEqual({});
  });
});
describe('Tests for adminQuizRestore', () => {
  test('Empty or Invalid token', () => {
    const newUser1 = authRegisterRequest('Validemail1@gmail.com', 'password123', 'Jonathan', 'Leung');
    const quiz1 = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizRestoreRequest('no valid', quiz1.quizId)).toThrow(HTTPError[401]);
    expect(() => adminQuizRestoreRequest('', quiz1.quizId)).toThrow(HTTPError[401]);
  });

  test('quizId does not exist', () => {
    const newUser1 = authRegisterRequest('Validemail1@gmail.com', 'password123', 'Jonathan', 'Leung');
    adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizRestoreRequest(newUser1.token, 456234)).toThrow(HTTPError[400]);
  });

  test('Invalid user/owner', () => {
    const newUser1 = authRegisterRequest('Validemail1@gmail.com', 'password123', 'Jonathan', 'Leung');
    const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password1234', 'Random', 'Person');
    const quiz1 = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(adminQuizRemoveRequest(newUser1.token, quiz1.quizId)).toEqual({});
    expect(() => adminQuizRestoreRequest(newUser2.token, quiz1.quizId)).toThrow(HTTPError[403]);
  });

  test('Valid Test quizRestore with 1 quiz', () => {
    const newUser1 = authRegisterRequest('Validemail1@gmail.com', 'password123', 'Jonathan', 'Leung');
    const quiz1 = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    expect(adminQuizRemoveRequest(newUser1.token, quiz1.quizId)).toEqual({});
    expect(adminQuizViewTrashRequest(newUser1.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 1' }] });
    expect(adminQuizRestoreRequest(newUser1.token, quiz1.quizId)).toEqual({});
    expect(adminQuizViewTrashRequest(newUser1.token)).toEqual({ quizzes: [] });
    expect(adminQuizListRequest(newUser1.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 1' }] });
    // authLogoutRequest(newUser1.token);
    const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password1234', 'Random', 'Person');
    // expect(authLoginRequest('Validemail2@gmail.com', 'password1234')).toEqual({ token: expect.any(String) });
    const quiz2 = adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Testing');
    expect(adminQuizRemoveRequest(newUser2.token, quiz2.quizId)).toEqual({});
    expect(adminQuizViewTrashRequest(newUser2.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 2' }] });
    expect(adminQuizRestoreRequest(newUser2.token, quiz2.quizId)).toEqual({});
    expect(adminQuizViewTrashRequest(newUser2.token)).toEqual({ quizzes: [] });
    expect(adminQuizListRequest(newUser2.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 2' }] });
  });

  test('Valid Test quizRestore with multiple quizzes', () => {
    const newUser3 = authRegisterRequest('Validemail2@gmail.com', 'password1234', 'Random', 'Person');
    const quiz3 = adminQuizCreateRequest(newUser3.token, 'Test Quiz 3', 'Testing');
    const quiz4 = adminQuizCreateRequest(newUser3.token, 'Test Quiz 4', 'Testing');
    const quiz5 = adminQuizCreateRequest(newUser3.token, 'Test Quiz 5', 'Testing?');
    const quiz6 = adminQuizCreateRequest(newUser3.token, 'Test Quiz 6', 'Testing!');
    expect(adminQuizRemoveRequest(newUser3.token, quiz3.quizId)).toEqual({});
    expect(adminQuizRemoveRequest(newUser3.token, quiz4.quizId)).toEqual({});
    expect(adminQuizRemoveRequest(newUser3.token, quiz5.quizId)).toEqual({});
    expect(adminQuizRemoveRequest(newUser3.token, quiz6.quizId)).toEqual({});
    expect(adminQuizRestoreRequest(newUser3.token, quiz5.quizId)).toEqual({});
    expect(adminQuizListRequest(newUser3.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 5' }] });
    expect(adminQuizViewTrashRequest(newUser3.token)).toEqual({
      quizzes:
              [{ quizId: expect.any(Number), name: 'Test Quiz 3' },
                { quizId: expect.any(Number), name: 'Test Quiz 4' },
                { quizId: expect.any(Number), name: 'Test Quiz 6' }
              ]
    });

    // KNOWN BUG - userId of the quizzes randomly switches to the wrong one
    // remove the clear request to see.
    // I have tried using authlogout and authlogin but it didn't change anything.
    clearRequest();
    const newUser1 = authRegisterRequest('Validemail3@gmail.com', 'password123234', 'Jagfhj', 'Leudfghng');
    const quiz1 = adminQuizCreateRequest(newUser1.token, 'Test Quiz 456', 'Sample Quiz Testing');
    const quiz2 = adminQuizCreateRequest(newUser1.token, 'Test Quiz 123', 'Testing');
    expect(adminQuizRemoveRequest(newUser1.token, quiz1.quizId)).toEqual({});
    expect(adminQuizRemoveRequest(newUser1.token, quiz2.quizId)).toEqual({});
    expect(adminQuizRestoreRequest(newUser1.token, quiz2.quizId)).toEqual({});
    expect(adminQuizViewTrashRequest(newUser1.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 456' }] });
    expect(adminQuizListRequest(newUser1.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 123' }] });
  });
});

describe('Tests for adminQuizTrashEmpty', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Token is Invalid', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const quizIndexString = JSON.stringify([quizIndex.quizId]);
    expect(adminQuizRemoveRequest(newUser.token, quizIndex.quizId)).toEqual({});
    expect(() => adminQuizTrashEmptyRequest('', quizIndexString)).toThrow(HTTPError[401]);
  });

  test('QuizId is Invalid', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test');
    const quizIndexString = JSON.stringify([quizIndex.quizId + 1]);
    expect(adminQuizRemoveRequest(newUser.token, quizIndex.quizId)).toEqual({});
    expect(() => adminQuizTrashEmptyRequest(newUser.token, quizIndexString)).toThrow(HTTPError[400]);
  });

  test('Removal when there are no quizzes', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    expect(() => adminQuizTrashEmptyRequest(newUser.token, JSON.stringify([100]))).toThrow(HTTPError[400]);
  });

  test('Quiz is not owned by the owner', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newUser2 = authRegisterRequest('Validemails@gmail.com', 'password123', 'Jason', 'Mascharanous');
    const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    const quizIndexString = JSON.stringify([quizIndex.quizId]);
    expect(adminQuizRemoveRequest(newUser1.token, quizIndex.quizId)).toEqual({});
    expect(() => adminQuizTrashEmptyRequest(newUser2.token, quizIndexString)).toThrow(HTTPError[403]);
  });

  test('Deleting one quiz, Normal Case', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const quizIndexString = JSON.stringify([quizIndex.quizId]);
    adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test');
    adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'This is a test');
    adminQuizCreateRequest(newUser.token, 'Test Quiz 4', 'This is a test');
    //  Now, we remove this quiz
    expect(adminQuizRemoveRequest(newUser.token, quizIndex.quizId)).toEqual({});
    // Empty trash
    expect(adminQuizTrashEmptyRequest(newUser.token, quizIndexString)).toEqual({});
    // check if its really gone
    expect(adminQuizViewTrashRequest(newUser.token)).toEqual({ quizzes: [] });
  });

  test('Multiple Quizzes Deletion from one user, Normal Case', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const quizIndex1 = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const quizIndex2 = adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test');
    const quizIndex3 = adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'This is a test');
    const combinedQuizIds = JSON.stringify([quizIndex1.quizId, quizIndex2.quizId, quizIndex3.quizId]);
    adminQuizCreateRequest(newUser.token, 'Test Quiz 4', 'This is a test');

    // We wont be able to make new Quizzes
    // expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test')).toEqual(ERROR);
    // expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test')).toEqual(ERROR);
    // expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'This is a test')).toEqual(ERROR);

    // Now, we remove this quizzes
    expect(adminQuizRemoveRequest(newUser.token, quizIndex1.quizId)).toEqual({});
    expect(adminQuizRemoveRequest(newUser.token, quizIndex2.quizId)).toEqual({});
    expect(adminQuizRemoveRequest(newUser.token, quizIndex3.quizId)).toEqual({});

    // Empty all of them
    expect(adminQuizTrashEmptyRequest(newUser.token, combinedQuizIds)).toEqual({});

    // Adding the quizzes again should return us new quizIds and no error
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test')).toEqual({ quizId: expect.any(Number) });
    expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'This is a test')).toEqual({ quizId: expect.any(Number) });
    // check if its really gone
    expect(adminQuizViewTrashRequest(newUser.token)).toEqual({ quizzes: [] });
  });
});

describe('Tests of adminQuizDescriptionUpdate', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Token is empty', () => {
    const User1 = authRegisterRequest('landonorris@gmail.com', 'validpassword12', 'Kyrie', 'Irving');
    const quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizDescriptionUpdateRequest('', quiz1.quizId, 'Valid description')).toThrow(HTTPError[401]);
  });

  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const User1 = authRegisterRequest('landonorris@gmail.com', 'validpassword12', 'Kyrie', 'Irving');
    const quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
    const User2 = authRegisterRequest('validddemail@gmail.com', 'validpassword12', 'Yuki', 'Tsunoda');
    expect(() => adminQuizDescriptionUpdateRequest(User2.token, quiz1.quizId, 'Valid description')).toThrow(HTTPError[403]);
  });

  test('QuizId does not refer to a valid quiz', () => {
    const User1 = authRegisterRequest('maxverstappen@gmail.com', 'validpassword123', 'Steph', 'Curry');
    adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
    const quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 2', 'This is a test');
    expect(() => adminQuizDescriptionUpdateRequest(User1.token, quiz1.quizId + 1, 'Valid description')).toThrow(HTTPError[403]);
  });

  test('Description names are invalid', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Lando', 'Norris');
    expect(() => adminQuizCreateRequest(newUser.token, 'Valid quiz name 1', 'ThisStringNOTIsExactly100CharactersLongThisStringNOTIsExactly100CharactersLong Andrew is such a great tutor Andrew is such a great tutor Andrew is such a great tutor Andrew is such a great tutor')).toThrow(HTTPError[400]);
  });

  test('Checking if description update is working', () => {
    const User1 = authRegisterRequest('landonorris@gmail.com', 'validpassword12', 'Kyrie', 'Irving');
    const quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
    expect(adminQuizInfoRequest(User1.token, quiz1.quizId)).toEqual({
      quizId: quiz1.quizId,
      name: 'Test Quiz 1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'This is a test',
      questions: [],
      duration: expect.any(Number),
      numQuestions: expect.any(Number),
      thumbnailUrl: ''
    });
    expect(adminQuizDescriptionUpdateRequest(User1.token, quiz1.quizId, 'Valid description')).toEqual({});
    expect(adminQuizInfoRequest(User1.token, quiz1.quizId)).toEqual({
      quizId: quiz1.quizId,
      name: 'Test Quiz 1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Valid description',
      questions: [],
      duration: expect.any(Number),
      numQuestions: expect.any(Number),
      thumbnailUrl: ''
    });
    expect(adminQuizDescriptionUpdateRequest(User1.token, quiz1.quizId, 'Valid testing for description')).toEqual({});
    expect(adminQuizInfoRequest(User1.token, quiz1.quizId)).toEqual({
      quizId: quiz1.quizId,
      name: 'Test Quiz 1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Valid testing for description',
      questions: [],
      duration: expect.any(Number),
      numQuestions: expect.any(Number),
      thumbnailUrl: ''
    });
  });
});

describe('Tests of adminQuizThumbnailUpdate', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Token is empty', () => {
    const User1 = authRegisterRequest('landonorris@gmail.com', 'validpassword12', 'Kyrie', 'Irving');
    const quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizThumbnailUpdateRequest('', quiz1.quizId, 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png')).toThrow(HTTPError[401]);
  });

  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const User1 = authRegisterRequest('landonorris@gmail.com', 'validpassword12', 'Kyrie', 'Irving');
    const quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
    const User2 = authRegisterRequest('validddemail@gmail.com', 'validpassword12', 'Yuki', 'Tsunoda');
    expect(() => adminQuizThumbnailUpdateRequest(User2.token, quiz1.quizId, 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png')).toThrow(HTTPError[403]);
  });

  test('QuizId does not refer to a valid quiz', () => {
    const User1 = authRegisterRequest('maxverstappen@gmail.com', 'validpassword123', 'Steph', 'Curry');
    const quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 2', 'This is a test');
    expect(() => adminQuizThumbnailUpdateRequest(User1.token, quiz1.quizId + 1, 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png')).toThrow(HTTPError[400]);
  });

  test('imgUrl when fetch is not a JPG or PNG image', () => {
    const User1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Lando', 'Norris');
    const quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizThumbnailUpdateRequest(User1.token, quiz1.quizId, 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Apollo_17_Image_Of_Earth_From_Space_%28cropped%29.jpeg')).toThrow(HTTPError[400]);
    expect(() => adminQuizThumbnailUpdateRequest(User1.token, quiz1.quizId, 'https://www.adobe.com/au/creativecloud/file-types/image/raster/png-file.html')).toThrow(HTTPError[400]);
    expect(() => adminQuizThumbnailUpdateRequest(User1.token, quiz1.quizId, 'https://files.eric.ed.gov/fulltext/ED252173.pdf')).toThrow(HTTPError[400]);
  });

  test('imgUrl when fetched does not return a valid file', () => {
    const User1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Lando', 'Norris');
    const quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
    expect(() => adminQuizThumbnailUpdateRequest(User1.token, quiz1.quizId, 'https://nw-syd-gitlab.cseunsw.tech/COMP1531/23T3/groups/W18A_BOOST/project-backend/-/blob/master/swagger.yaml?ref_type=heads')).toThrow(HTTPError[400]);
  });

  test('To check for whether adminQuizThumbnailUpdateRequest works appropriately', () => {
    const User1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Lando', 'Norris');
    const quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
    expect(adminQuizThumbnailUpdateRequest(User1.token, quiz1.quizId, 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png')).toEqual({});
    expect(adminQuizInfoRequest(User1.token, quiz1.quizId)).toEqual({
      quizId: quiz1.quizId,
      name: 'Test Quiz 1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'This is a test',
      questions: [],
      duration: expect.any(Number),
      numQuestions: expect.any(Number),
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    });
    expect(adminQuizThumbnailUpdateRequest(User1.token, quiz1.quizId, 'https://static.vecteezy.com/system/resources/previews/008/505/783/original/cricket-ball-illustration-png.png')).toEqual({});
    expect(adminQuizInfoRequest(User1.token, quiz1.quizId)).toEqual({
      quizId: quiz1.quizId,
      name: 'Test Quiz 1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'This is a test',
      questions: [],
      duration: expect.any(Number),
      numQuestions: expect.any(Number),
      thumbnailUrl: 'https://static.vecteezy.com/system/resources/previews/008/505/783/original/cricket-ball-illustration-png.png'
    });
  });
});
