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

export function adminViewSessionsRequest(token: string, quizid: number) {
  return requestHelper('GET', `/v1/admin/quiz/${quizid}/sessions`, {}, { token });
}

export function adminSessionStartRequest(token: string, quizid: number, autoStartNum: number) {
  return requestHelper('POST', `/v1/admin/quiz/${quizid}/session/start`, { autoStartNum }, { token });
}

export function adminUpdateSessionStateRequest(token: string, quizid: number, sessionid: number, action: string) {
  return requestHelper('PUT', `/v1/admin/quiz/${quizid}/session/${sessionid}`, { action }, { token });
}

export function adminQuizGetSessionRequest(token: string, sessionid: number, quizid: number) {
  return requestHelper('GET', `/v1/admin/quiz/${quizid}/session/${sessionid}`, {}, { token });
}

// write request and tests 
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

describe('Tests of adminQuizGetSession', () => {
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
    const session1 = adminSessionStartRequest(User1.token, Quiz1.quizId, 3);
    expect(() => adminQuizGetSessionRequest('', session1.sessionId, Quiz1.quizId)).toThrow(HTTPError[401]);
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

    const session1 = adminSessionStartRequest(User1.token, Quiz1.quizId, 3);
    expect(() => adminQuizGetSessionRequest(User2.token, session1.sessionId, Quiz1.quizId)).toThrow(HTTPError[403]);
  });

  test('Valid get session', () => {
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
    const expectedOutput = {
      state: 'LOBBY',
      atQuestion: 0,
      // players has not been added so an empty array is used.
      players: expect.any(Array),
      metadata: {
        quizId: Quiz1.quizId,
        name: 'Test Quiz 1',
        description: 'This is a test',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        numQuestions: 1,
        questions: [
          {
            questionId: expect.any(Number),
            question: 'Sample Question 1',
            duration: 5,
            points: 4,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Prince Wales',
                correct: true,
                colour: expect.any(String),
              },
              {
                answerId: expect.any(Number),
                answer: 'Prince Charles',
                correct: true,
                colour: expect.any(String),
              },
              {
                answerId: expect.any(Number),
                answer: 'Prince Diana',
                correct: true,
                colour: expect.any(String),
              },

            ],
            thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png',
          },
        ],
        duration: expect.any(Number),
        thumbnailUrl: expect.any(String),
      },
    };
    adminQuizCreateQuestionRequest(User1.token, Quiz1.quizId, Question1);
    const session1 = adminSessionStartRequest(User1.token, Quiz1.quizId, 3);
    expect(adminQuizGetSessionRequest(User1.token, session1.sessionId, Quiz1.quizId)).toEqual(expectedOutput);
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
    const session4 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);
    const session5 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);
    const session6 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);

    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session2.sessionId, 'END')).toEqual({});
    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session4.sessionId, 'END')).toEqual({});
    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session6.sessionId, 'END')).toEqual({});

    const sortedArrayActive = [session1.sessionId, session3.sessionId, session5.sessionId];
    sortedArrayActive.sort(function(a, b) {
      return a - b;
    });
    const sortedArrayInactive = [session2.sessionId, session4.sessionId, session6.sessionId];
    sortedArrayActive.sort(function(a, b) {
      return a - b;
    });

    expect(adminViewSessionsRequest(User1.token, Quiz1.quizId)).toEqual({ activeSessions: sortedArrayActive, inactiveSessions: sortedArrayInactive });
  });
});

describe('Tests of adminUpdateSessionState', () => {
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
    const session1 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);
    expect(() => adminUpdateSessionStateRequest('', Quiz1.quizId, session1.sessionId, 'NEXT_QUESTION')).toThrow(HTTPError[401]);
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
    const session1 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);
    expect(() => adminUpdateSessionStateRequest(User2.token, Quiz1.quizId, session1.sessionId, 'NEXT_QUESTION')).toThrow(HTTPError[403]);
  });

  test('Session Id does not refer to a valid session within this quiz', () => {
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
    const session1 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId + 1, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
  });

  test('Invalid Action Enum', () => {
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
    const session1 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'INVALID_ACTION')).toThrow(HTTPError[400]);
  });

  test('Invalid Actions in LOBBY state', () => {
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
    const session1 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'SKIP_COUNTDOWN')).toThrow(HTTPError[400]);
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'GO_TO_ANSWER')).toThrow(HTTPError[400]);
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'GO_TO_FINAL_RESULTS')).toThrow(HTTPError[400]);
  });

  test('Invalid Actions in END state', () => {
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
    const session1 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);
    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'END')).toEqual({});
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'GO_TO_ANSWER')).toThrow(HTTPError[400]);
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'GO_TO_FINAL_RESULTS')).toThrow(HTTPError[400]);
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'SKIP_COUNTDOWN')).toThrow(HTTPError[400]);
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
  });

  test('Invalid Actions in QUESTION_COUNTDOWN state', () => {
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
    const session1 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);
    expect((adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'NEXT_QUESTION'))).toEqual({});
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'GO_TO_ANSWER')).toThrow(HTTPError[400]);
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'GO_TO_FINAL_RESULTS')).toThrow(HTTPError[400]);
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
  });

  test('Invalid Actions in QUESTION_OPEN state', async () => {
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
    const session1 = adminSessionStartRequest(User1.token, Quiz1.quizId, 1);
    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'NEXT_QUESTION')).toEqual({});

    await new Promise((resolve) => setTimeout(resolve, 3500));

    expect(adminQuizGetSessionRequest(User1.token, session1.sessionId, Quiz1.quizId).state).toEqual('QUESTION_OPEN');
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'GO_TO_FINAL_RESULTS')).toThrow(HTTPError[400]);
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
  });

  test('Invalid Actions in QUESTION_CLOSE state', async () => {
    const User1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Max', 'Verstappen');
    const Quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
    const Question1 =
        {
          question: 'Sample Question 1',
          duration: 2,
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
    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'NEXT_QUESTION')).toEqual({});
    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'SKIP_COUNTDOWN')).toEqual({});

    // Waiting till question duration elapses
    await new Promise((resolve) => setTimeout(resolve, 2500));

    expect(adminQuizGetSessionRequest(User1.token, session1.sessionId, Quiz1.quizId).state).toEqual('QUESTION_CLOSE');
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'SKIP_COUNTDOWN')).toThrow(HTTPError[400]);
  });

  test('Invalid Actions in ANSWER_SHOW state', async () => {
    const User1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Max', 'Verstappen');
    const Quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
    const Question1 =
        {
          question: 'Sample Question 1',
          duration: 2,
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
    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'NEXT_QUESTION')).toEqual({});
    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'SKIP_COUNTDOWN')).toEqual({});

    // Waiting till question duration elapses
    await new Promise((resolve) => setTimeout(resolve, 2500));

    expect(adminQuizGetSessionRequest(User1.token, session1.sessionId, Quiz1.quizId).state).toEqual('QUESTION_CLOSE');
    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'GO_TO_ANSWER')).toEqual({});
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'SKIP_COUNTDOWN')).toThrow(HTTPError[400]);
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'GO_TO_ANSWER')).toThrow(HTTPError[400]);
  });

  test('Invalid Actions in FINAL_RESULTS state', async () => {
    const User1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Max', 'Verstappen');
    const Quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
    const Question1 =
        {
          question: 'Sample Question 1',
          duration: 2,
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
    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'NEXT_QUESTION')).toEqual({});
    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'SKIP_COUNTDOWN')).toEqual({});
    expect(adminQuizGetSessionRequest(User1.token, session1.sessionId, Quiz1.quizId).state).toEqual('QUESTION_OPEN');

    // Waiting till question duration elapses
    await new Promise((resolve) => setTimeout(resolve, 2500));

    expect(adminQuizGetSessionRequest(User1.token, session1.sessionId, Quiz1.quizId).state).toEqual('QUESTION_CLOSE');
    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'GO_TO_FINAL_RESULTS')).toEqual({});
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'SKIP_COUNTDOWN')).toThrow(HTTPError[400]);
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'GO_TO_ANSWER')).toThrow(HTTPError[400]);
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'GO_TO_FINAL_RESULTS')).toThrow(HTTPError[400]);
    expect(() => adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
  });

  test('Succesful SKIP_COUNTDOWN', () => {
    const User1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Max', 'Verstappen');
    const Quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
    const Question1 =
        {
          question: 'Sample Question 1',
          duration: 2,
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
    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'NEXT_QUESTION')).toEqual({});
    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'SKIP_COUNTDOWN')).toEqual({});

    // Skipped 3 seconds and opened question
    expect(adminQuizGetSessionRequest(User1.token, session1.sessionId, Quiz1.quizId).state).toEqual('QUESTION_OPEN');
  });

  test('Valid Actions', async () => {
    const User1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Max', 'Verstappen');
    const Quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
    const Question1 =
        {
          question: 'Sample Question 1',
          duration: 2,
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

    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'NEXT_QUESTION')).toEqual({});
    expect(adminQuizGetSessionRequest(User1.token, session1.sessionId, Quiz1.quizId).state).toEqual('QUESTION_COUNTDOWN');

    // Skipping countdown
    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'SKIP_COUNTDOWN')).toEqual({});
    expect(adminQuizGetSessionRequest(User1.token, session1.sessionId, Quiz1.quizId).state).toEqual('QUESTION_OPEN');

    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'GO_TO_ANSWER')).toEqual({});
    expect(adminQuizGetSessionRequest(User1.token, session1.sessionId, Quiz1.quizId).state).toEqual('ANSWER_SHOW');

    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'GO_TO_FINAL_RESULTS')).toEqual({});
    expect(adminQuizGetSessionRequest(User1.token, session1.sessionId, Quiz1.quizId).state).toEqual('FINAL_RESULTS');

    expect(adminUpdateSessionStateRequest(User1.token, Quiz1.quizId, session1.sessionId, 'END')).toEqual({});
    expect(adminQuizGetSessionRequest(User1.token, session1.sessionId, Quiz1.quizId).state).toEqual('END');
  });
});
