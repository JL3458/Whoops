// New .ts file to implement tests for session.ts functions through the server

import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';

import { clearRequest } from './other.test';
import { authRegisterRequest } from './auth.test';
import { adminQuizCreateRequest } from './quiz.test';

import { IncomingHttpHeaders } from 'http';
import HTTPError from 'http-errors';
import { adminQuizCreateQuestionRequest } from './question.test';

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

export function adminSessionStartRequest(token: string, quizid: number, autoStartNum: number) {
  return requestHelper('POST', `/v1/admin/quiz/${quizid}/session/start`, { autoStartNum }, { token });
}

export function adminViewSessionsRequest(token: string, quizid: number) {
  return requestHelper('GET', `/v1/admin/quiz/${quizid}/sessions`, {}, { token });
}

/// ////////////////////////// Main Tests /////////////////////////////

beforeEach(() => {
  clearRequest();
});

describe('Tests of adminSessionStart', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Token is Empty or Invalid', () => {
    const User1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Max', 'Verstappen');
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
    expect(() => adminSessionStartRequest('', Quiz1.quizId, 3)).toThrow(HTTPError[401]);
  });
  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const User1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Max', 'Verstappen');
    const User2 = authRegisterRequest('Valid1email@gmail.com', 'password123', 'Steph', 'Curry');
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
    expect(() => adminSessionStartRequest(User2.token, Quiz1.quizId, 3)).toThrow(HTTPError[403]);
  });

  test('autoStartNum is a number greater than 50', () => {
    const User1 = authRegisterRequest('maxverstappen@gmail.com', 'validpassword123', 'Steph', 'Curry');
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
    expect(() => adminSessionStartRequest(User1.token, Quiz1.quizId, 51)).toThrow(HTTPError[400]);
    expect(adminSessionStartRequest(User1.token, Quiz1.quizId, 50)).toEqual({ sessionId: expect.any(Number) });
  });

  test('Quiz does not have any questions in it', () => {
    const User1 = authRegisterRequest('landonorris@gmail.com', 'validpassword12', 'Kyrie', 'Irving');
    const Quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');

    expect(() => adminSessionStartRequest(User1.token, Quiz1.quizId, 4)).toThrow(HTTPError[400]);
  });

  test('Maximum of 10 sessions that are not in END state currently exist', () => {
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

    // Create 10 sessions that are not in END state
    expect(adminSessionStartRequest(User1.token, Quiz1.quizId, 1)).toEqual({ sessionId: expect.any(Number) });
    expect(adminSessionStartRequest(User1.token, Quiz1.quizId, 2)).toEqual({ sessionId: expect.any(Number) });
    expect(adminSessionStartRequest(User1.token, Quiz1.quizId, 3)).toEqual({ sessionId: expect.any(Number) });
    expect(adminSessionStartRequest(User1.token, Quiz1.quizId, 4)).toEqual({ sessionId: expect.any(Number) });
    expect(adminSessionStartRequest(User1.token, Quiz1.quizId, 5)).toEqual({ sessionId: expect.any(Number) });
    expect(adminSessionStartRequest(User1.token, Quiz1.quizId, 6)).toEqual({ sessionId: expect.any(Number) });
    expect(adminSessionStartRequest(User1.token, Quiz1.quizId, 7)).toEqual({ sessionId: expect.any(Number) });
    expect(adminSessionStartRequest(User1.token, Quiz1.quizId, 8)).toEqual({ sessionId: expect.any(Number) });
    expect(adminSessionStartRequest(User1.token, Quiz1.quizId, 9)).toEqual({ sessionId: expect.any(Number) });
    expect(adminSessionStartRequest(User1.token, Quiz1.quizId, 10)).toEqual({ sessionId: expect.any(Number) });

    expect(() => adminSessionStartRequest(User1.token, Quiz1.quizId, 11)).toThrow(HTTPError[400]);
  });

  test('Valid start session', () => {
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
  });
});

describe('Tests of adminViewSessions', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Token is Empty or Invalid', () => {
    const User1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Max', 'Verstappen');
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
    expect(() => adminViewSessionsRequest('', Quiz1.quizId)).toThrow(HTTPError[401]);
  });

  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const User1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Max', 'Verstappen');
    const User2 = authRegisterRequest('Valid1email@gmail.com', 'password123', 'Steph', 'Curry');
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
    expect(() => adminViewSessionsRequest(User2.token, Quiz1.quizId)).toThrow(HTTPError[403]);
  });

  test('Valid View Sessions', () => {
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
    const session1 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);
    const session2 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);
    const session3 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);

    const sortedArrayActive = [session1.sessionId, session2.sessionId, session3.sessionId];
    sortedArrayActive.sort(function(a, b) {
      return a - b;
    });

    expect(adminViewSessionsRequest(User1.token, Quiz1.quizId)).toEqual({ activeSessions: sortedArrayActive, inactiveSessions: [] });
  });
});
