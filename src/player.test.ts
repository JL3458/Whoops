// New .ts file to implement tests for player.ts functions through the server

import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';

import { clearRequest } from './other.test';
import { authRegisterRequest } from './auth.test';
import { adminQuizCreateRequest } from './quiz.test';

import { IncomingHttpHeaders } from 'http';
import HTTPError from 'http-errors';
import { adminQuizCreateQuestionRequest } from './question.test';
import { adminSessionStartRequest } from './session.test';

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

export function playerJoinRequest(sessionId: number, name: string) {
  return requestHelper('POST', '/v1/player/join', { sessionId, name }, { });
}

export function playerStatusRequest(playerid: number) {
  return requestHelper('GET', `/v1/player/${playerid}`, {}, {});
}

/// ////////////////////////// Main Tests /////////////////////////////

beforeEach(() => {
  clearRequest();
});

describe('Tests for playerJoin', () => {
  beforeEach(() => {
    clearRequest();
  });

  // TODO:  throw HTTPError(401, 'Session is not in LOBBY state');

  test('Session is invalid', () => {
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
    const Session1 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);
    expect(() => playerJoinRequest(Session1.sessionId + 1, 'Hayden')).toThrow(HTTPError[400]);
  });

  test('Name of user entered is not unique', () => {
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
    const Session1 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);
    expect(playerJoinRequest(Session1.sessionId, 'Hayden')).toEqual({ playerId: expect.any(Number) });
    expect(() => playerJoinRequest(Session1.sessionId, 'Hayden')).toThrow(HTTPError[400]);
  });

  test('When Name String is Empty', () => {
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
    const Session1 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);
    expect(playerJoinRequest(Session1.sessionId, '')).toEqual({ playerId: expect.any(Number) });
  });

  test('Valid player join', () => {
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
    const Session1 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);
    expect(playerJoinRequest(Session1.sessionId, 'Hayden')).toEqual({ playerId: expect.any(Number) });
  });
});

describe('Tests for playerStatus', () => {
  test('Valid case for Invalid PlayerId', () => {
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
    const Session1 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);
    const playerId1 = playerJoinRequest(Session1.sessionId, 'Hayden');
    expect(() => playerStatusRequest(playerId1.playerId + 1)).toThrow(HTTPError[400]);
  });

  test('Valid case for playerStatus', () => {
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
    const Session1 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);
    const playerId1 = playerJoinRequest(Session1.sessionId, 'Hayden');
    expect(playerStatusRequest(playerId1.playerId)).toEqual({ state: 'LOBBY', numQuestions: 1, atQuestion: 0 });
  });
});
