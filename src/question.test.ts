// New question.test.ts file to handle questions tests

import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
import { clearRequest } from './other.test';
import { authRegisterRequest } from './auth.test';
import { adminQuizCreateRequest, adminQuizInfoRequest } from './quiz.test';
import { adminSessionStartRequest } from './session.test';

import { questionBody } from './question';
import { IncomingHttpHeaders } from 'http';
import HTTPError from 'http-errors';

const SERVER_URL = `${url}:${port}`;
const QUESTIONID = { questionId: expect.any(Number) };
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

export function adminQuizCreateQuestionRequest(token: string, quizid: number, questionBody : questionBody) {
  return requestHelper('POST', `/v2/admin/quiz/${quizid}/question`, { questionBody }, { token });
}

export function adminQuizQuestionMoveRequest(token: string, newPosition: number, quizid: number, questionid: number) {
  return requestHelper('PUT', `/v2/admin/quiz/${quizid}/question/${questionid}/move`, { newPosition }, { token });
}

export function adminQuizQuestionDuplicateRequest(token: string, quizid: number, questionid: number) {
  return requestHelper('POST', `/v2/admin/quiz/${quizid}/question/${questionid}/duplicate`, { }, { token });
}

export function adminQuizQuestionDeleteRequest(token: string, quizid: number, questionid: number) {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizid}/question/${questionid}`, { }, { token });
}

/// ////////////////////////// Main Tests /////////////////////////////

describe('Tests of adminQuizCreateQuestion', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Token is Empty or Invalid', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const newQuestion =
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

    expect(() => adminQuizCreateQuestionRequest('', newQuiz.quizId, newQuestion)).toThrow(HTTPError[401]);
  });

  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    const newQuestion =
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
    expect(() => adminQuizCreateQuestionRequest(newUser2.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[403]);
  });

  test('Test For Normal Case', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const newQuestion =
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
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(QUESTIONID);
  });

  test('Test For Invalid QuizId', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const newQuestion =
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
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId + 1, newQuestion)).toThrow(HTTPError[400]);
  });

  test('Test For Invalid Question String', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    let newQuestion =
        {
          question: 'Four',
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
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
    newQuestion =
        {
          question: 'Exploring new frontiers broadens our horizons and enriches our lives',
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
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
  });

  test('Test For Number of Answers in Question', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    let newQuestion =
        {
          question: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answer: 'Prince Wales',
              correct: true
            }
          ],
          thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
        };
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
    newQuestion =
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
              answer: 'Prince Raina',
              correct: true
            },
            {
              answer: 'Prince Gill',
              correct: true
            },
            {
              answer: 'Prince Kohli',
              correct: true
            },
            {
              answer: 'Prince Diana',
              correct: true
            },
            {
              answer: 'Prince Diana',
              correct: true
            }
          ],
          thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
        };
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
  });

  test('Test For Question Duration Positive', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    let newQuestion =
        {
          question: 'Sample Question 1',
          duration: -1,
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
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
    newQuestion =
        {
          question: 'Sample Question 1',
          duration: 0,
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
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
  });

  test('Test For Sum of Duration Exceeding 180 seconds/3 minutes', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    let newQuestion =
        {
          question: 'Sample Question 1',
          duration: 90,
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
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(QUESTIONID);
    newQuestion =
        {
          question: 'Sample Question 2',
          duration: 100,
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
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
  });

  test('Test For Invalid Points', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    let newQuestion =
        {
          question: 'Sample Question 1',
          duration: 5,
          points: 0,
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
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
    newQuestion =
        {
          question: 'Sample Question 1',
          duration: 5,
          points: 11,
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
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
  });

  test('Test For Invalid Answer Length', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    let newQuestion =
        {
          question: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answer: '',
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
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
    newQuestion =
        {
          question: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answer: 'Exploring new frontiers broadens our horizons and enriches our lives',
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
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
  });

  test('Test For Duplicate Strings', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    let newQuestion =
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
              answer: 'Prince Wales',
              correct: true
            },
            {
              answer: 'Prince Diana',
              correct: true
            }
          ],
          thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
        };
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
    newQuestion =
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
              answer: 'Prince Wales',
              correct: true
            }
          ],
          thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
        };
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
  });

  test('Test For No Correct Answers', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const newQuestion =
        {
          question: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answer: 'Prince Wales',
              correct: false
            },
            {
              answer: 'Prince Charles',
              correct: false
            },
            {
              answer: 'Prince Diana',
              correct: false
            }
          ],
          thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
        };
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
  });

  test('Test For Empty Thumbnail String', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const newQuestion =
        {
          question: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answer: 'Prince Wales',
              correct: false
            },
            {
              answer: 'Prince Charles',
              correct: false
            },
            {
              answer: 'Prince Diana',
              correct: false
            }
          ],
          thumbnailUrl: ''
        };
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
  });

  test('Test For Invalid Thumbnail String', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const newQuestion =
        {
          question: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answer: 'Prince Wales',
              correct: false
            },
            {
              answer: 'Prince Charles',
              correct: false
            },
            {
              answer: 'Prince Diana',
              correct: false
            }
          ],
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/-1080x675.svg'
        };
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
  });

  test('Test For Invalid Thumbnail String - Doesnt start with https', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    let newQuestion =
        {
          question: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answer: 'Prince Wales',
              correct: false
            },
            {
              answer: 'Prince Charles',
              correct: false
            },
            {
              answer: 'Prince Diana',
              correct: false
            }
          ],
          thumbnailUrl: 'htt://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/-1080x675.jpeg'
        };
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
    newQuestion =
        {
          question: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answer: 'Prince Wales',
              correct: false
            },
            {
              answer: 'Prince Charles',
              correct: false
            },
            {
              answer: 'Prince Diana',
              correct: false
            }
          ],
          thumbnailUrl: 'www.dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/-1080x675.jpeg'
        };
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
  });
});

describe('Tests of adminQuizQuestionMove', () => {
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
    const newQuestion = adminQuizCreateQuestionRequest(User1.token, Quiz1.quizId, Question1);
    expect(() => adminQuizQuestionMoveRequest('', 0, Quiz1.quizId, newQuestion.questionId)).toThrow(HTTPError[401]);
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
    const newQuestion = adminQuizCreateQuestionRequest(User1.token, Quiz1.quizId, Question1);
    expect(() => adminQuizQuestionMoveRequest(User2.token, 0, Quiz1.quizId, newQuestion.questionId)).toThrow(HTTPError[403]);
  });

  test('QuestionId does not refer to a valid question within this quiz', () => {
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
    const newQuestion = adminQuizCreateQuestionRequest(User1.token, Quiz1.quizId, Question1);
    expect(() => adminQuizQuestionMoveRequest(User1.token, 0, Quiz1.quizId, newQuestion.questionId + 1)).toThrow(HTTPError[400]);
  });

  test('NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions', () => {
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
    const Question2 =
      {
        question: 'Sample Question 2',
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
    const newQuestion = adminQuizCreateQuestionRequest(User1.token, Quiz1.quizId, Question1);
    const newQuestion1 = adminQuizCreateQuestionRequest(User1.token, Quiz1.quizId, Question2);
    expect(() => adminQuizQuestionMoveRequest(User1.token, -1, Quiz1.quizId, newQuestion.questionId)).toThrow(HTTPError[400]);
    expect(() => adminQuizQuestionMoveRequest(User1.token, 2, Quiz1.quizId, newQuestion1.questionId)).toThrow(HTTPError[400]);
  });

  test('Check newposition is same as current position', () => {
    const User1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Kobe', 'Bryant');
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

    const Question2 =
  {
    question: 'Sample Question 2',
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
    const newQuestion2 = adminQuizCreateQuestionRequest(User1.token, Quiz1.quizId, Question2);

    // expect(adminQuizCreateQuestionRequest(User1.token, Quiz1.quizid, Question2)).toEqual({})
    expect(() => adminQuizQuestionMoveRequest(User1.token, 1, Quiz1.quizId, newQuestion2.questionId)).toThrow(HTTPError[400]);
  });

  test('Valid test', () => {
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
    const Question2 =
  {
    question: 'Sample Question 2',
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

    const newQuestion1 = adminQuizCreateQuestionRequest(User1.token, Quiz1.quizId, Question1);
    const newQuestion2 = adminQuizCreateQuestionRequest(User1.token, Quiz1.quizId, Question2);

    const newOutput1 = adminQuizInfoRequest(User1.token, Quiz1.quizId);

    expect(newOutput1.questions).toEqual([{
      questionId: newQuestion1.questionId,
      question: 'Sample Question 1',
      duration: 5,
      points: 4,
      answers: [
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Wales',
          correct: true
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Charles',
          correct: true
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Diana',
          correct: true
        }
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    },
    {
      questionId: newQuestion2.questionId,
      question: 'Sample Question 2',
      duration: 5,
      points: 4,
      answers: [
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Wales',
          correct: true
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Charles',
          correct: true
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Diana',
          correct: true
        }
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    }]);

    expect(adminQuizQuestionMoveRequest(User1.token, 0, Quiz1.quizId, newQuestion2.questionId)).toEqual({});

    const newOutput2 = adminQuizInfoRequest(User1.token, Quiz1.quizId);

    expect(newOutput2.questions).toEqual([{
      questionId: newQuestion2.questionId,
      question: 'Sample Question 2',
      duration: 5,
      points: 4,
      answers: [
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Wales',
          correct: true
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Charles',
          correct: true
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Diana',
          correct: true
        }
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    },
    {
      questionId: newQuestion1.questionId,
      question: 'Sample Question 1',
      duration: 5,
      points: 4,
      answers: [
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Wales',
          correct: true
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Charles',
          correct: true
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Diana',
          correct: true
        }
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    }]);
  });
});

describe('Tests of adminQuizQuestionDuplicate', () => {
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
    const newQuestion = adminQuizCreateQuestionRequest(User1.token, Quiz1.quizId, Question1);
    expect(() => adminQuizQuestionDuplicateRequest('', Quiz1.quizId, newQuestion.questionId)).toThrow(HTTPError[401]);
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
    const newQuestion = adminQuizCreateQuestionRequest(User1.token, Quiz1.quizId, Question1);
    expect(() => adminQuizQuestionDuplicateRequest(User2.token, Quiz1.quizId, newQuestion.questionId)).toThrow(HTTPError[403]);
  });

  test('QuestionId does not refer to a valid question within this quiz', () => {
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
    const newQuestion = adminQuizCreateQuestionRequest(User1.token, Quiz1.quizId, Question1);
    expect(() => adminQuizQuestionDuplicateRequest(User1.token, Quiz1.quizId, newQuestion.questionId + 1)).toThrow(HTTPError[400]);
  });

  test('Valid test', () => {
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
    const Question2 =
  {
    question: 'Sample Question 2',
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

    const newQuestion1 = adminQuizCreateQuestionRequest(User1.token, Quiz1.quizId, Question1);
    const newQuestion2 = adminQuizCreateQuestionRequest(User1.token, Quiz1.quizId, Question2);

    const newOutput1 = adminQuizInfoRequest(User1.token, Quiz1.quizId);

    expect(newOutput1.questions).toEqual([{
      questionId: newQuestion1.questionId,
      question: 'Sample Question 1',
      duration: 5,
      points: 4,
      answers: [
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Wales',
          correct: true
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Charles',
          correct: true
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Diana',
          correct: true
        }
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    },
    {
      questionId: newQuestion2.questionId,
      question: 'Sample Question 2',
      duration: 5,
      points: 4,
      answers: [
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Wales',
          correct: true
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Charles',
          correct: true
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Diana',
          correct: true
        }
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    }]);

    const newOutput3 = adminQuizQuestionDuplicateRequest(User1.token, Quiz1.quizId, newQuestion2.questionId);

    const newOutput2 = adminQuizInfoRequest(User1.token, Quiz1.quizId);

    expect(newOutput2.questions).toEqual([{
      questionId: newQuestion1.questionId,
      question: 'Sample Question 1',
      duration: 5,
      points: 4,
      answers: [
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Wales',
          correct: true
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Charles',
          correct: true
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Diana',
          correct: true
        }
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    },
    {
      questionId: newQuestion2.questionId,
      question: 'Sample Question 2',
      duration: 5,
      points: 4,
      answers: [
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Wales',
          correct: true
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Charles',
          correct: true
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Diana',
          correct: true
        }
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    },
    {
      questionId: newOutput3.newQuestionId,
      question: 'Sample Question 2',
      duration: 5,
      points: 4,
      answers: [
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Wales',
          correct: true
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Charles',
          correct: true
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Diana',
          correct: true
        }
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    }]);
  });
});

describe('Tests of adminQuizQuestionDelete', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Delete Question Successfully', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const newQuestion = {
      question: 'Sample Question 1',
      duration: 5,
      points: 4,
      answers: [
        {
          answer: 'Prince Wales',
          correct: true,
        },
        {
          answer: 'Prince Charles',
          correct: true,
        },
        {
          answer: 'Prince Diana',
          correct: true,
        },
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    };

    // Create the initial question and get its ID
    const createdQuestionResponse = adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion);
    const questionId = createdQuestionResponse.questionId;
    let quizInfo = adminQuizInfoRequest(newUser.token, newQuiz.quizId);
    // Storing questions quizinfo returns to check
    const quizInfoOutput = {
      questionId: quizInfo.questions[0].questionId,
      question: 'Sample Question 1',
      duration: 5,
      points: 4,
      answers: [
        {
          answerId: expect.any(Number),
          answer: 'Prince Wales',
          colour: expect.any(String),
          correct: true,
        },
        {
          answerId: expect.any(Number),
          answer: 'Prince Charles',
          colour: expect.any(String),
          correct: true,
        },
        {
          answerId: expect.any(Number),
          answer: 'Prince Diana',
          colour: expect.any(String),
          correct: true,
        },
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    };
    // Check if question is in questions array
    expect(quizInfo.questions).toEqual([quizInfoOutput]);
    expect(adminQuizQuestionDeleteRequest(newUser.token, newQuiz.quizId, questionId)).toEqual({});
    quizInfo = adminQuizInfoRequest(newUser.token, newQuiz.quizId);
    // Should be an emoty array after deleting question
    expect(quizInfo.questions).toEqual([]);
  });

  test('Delete Question from multiple Successfully', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const newQuestion1 =
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
    const newQuestion2 = {
      question: 'Sample Question 2',
      duration: 5,
      points: 4,
      answers: [
        {
          answer: 'Prince Wales',
          correct: true,
        },
        {
          answer: 'Prince Charles',
          correct: true,
        },
        {
          answer: 'Prince Diana',
          correct: true,
        },
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    };
    const newQuestion3 = {
      question: 'Sample Question 3',
      duration: 5,
      points: 4,
      answers: [
        {
          answer: 'Prince Wales',
          correct: true,
        },
        {
          answer: 'Prince Charles',
          correct: true,
        },
        {
          answer: 'Prince Diana',
          correct: true,
        },
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    };

    // Create the initial question and get its ID
    const createdQuestionResponse1 = adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion1);
    const createdQuestionResponse2 = adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion2);
    const createdQuestionResponse3 = adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion3);
    const questionId1 = createdQuestionResponse1.questionId;
    const questionId2 = createdQuestionResponse2.questionId;
    const questionId3 = createdQuestionResponse3.questionId;
    let quizInfo = adminQuizInfoRequest(newUser.token, newQuiz.quizId);
    // Storing questions quizinfo returns to check
    const newQuestionOutput1 = {
      questionId: questionId1,
      question: 'Sample Question 1',
      duration: 5,
      points: 4,
      answers: [
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Wales',
          correct: true,
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Charles',
          correct: true,
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Diana',
          correct: true,
        },
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    };
    const newQuestionOutput2 = {
      questionId: questionId2,
      question: 'Sample Question 2',
      duration: 5,
      points: 4,
      answers: [
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Wales',
          correct: true,
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Charles',
          correct: true,
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Diana',
          correct: true,
        },
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    };
    const newQuestionOutput3 = {
      questionId: questionId3,
      question: 'Sample Question 3',
      duration: 5,
      points: 4,
      answers: [
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Wales',
          correct: true,
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Charles',
          correct: true,
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Diana',
          correct: true,
        },
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    };
    // Confirm if questions are in questions array
    expect(quizInfo.questions).toEqual([newQuestionOutput1, newQuestionOutput2, newQuestionOutput3]);
    // Delete the question
    expect(adminQuizQuestionDeleteRequest(newUser.token, newQuiz.quizId, questionId2)).toEqual({});
    quizInfo = adminQuizInfoRequest(newUser.token, newQuiz.quizId);
    // Should be an array with 2 questions after deleting question as shown below
    const quizInfoOutput = [{
      questionId: questionId1,
      question: 'Sample Question 1',
      duration: 5,
      points: 4,
      answers: [
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Wales',
          correct: true,
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Charles',
          correct: true,
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Diana',
          correct: true,
        },
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    },
    {
      questionId: questionId3,
      question: 'Sample Question 3',
      duration: 5,
      points: 4,
      answers: [
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Wales',
          correct: true,
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Charles',
          correct: true,
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Diana',
          correct: true,
        },
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    }];
    expect(quizInfo.questions).toEqual(quizInfoOutput);
  });

  test('Attempt to delete Non-Existent Question', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const newQuestion = {
      question: 'Sample Question 1',
      duration: 5,
      points: 4,
      answers: [
        {
          answer: 'Prince Wales',
          correct: true,
        },
        {
          answer: 'Prince Charles',
          correct: true,
        },
        {
          answer: 'Prince Diana',
          correct: true,
        },
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    };

    // Create the initial question and get its ID
    const createdQuestionResponse = adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion);

    // Attempt to delete a non-existent question (use a non-existent questionId)
    expect(() => adminQuizQuestionDeleteRequest(newUser.token, newQuiz.quizId, createdQuestionResponse.questionId + 1)).toThrow(HTTPError[400]);
  });

  test('Invalid Token Provided for Delete', () => {
    const newUser1 = authRegisterRequest('Validemail1@gmail.com', 'password123', 'Shervin', 'Erfanian');
    const newQuiz = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    const newQuestion = {
      question: 'Sample Question 1',
      duration: 5,
      points: 4,
      answers: [
        {
          answer: 'Prince Wales',
          correct: true,
        },
        {
          answer: 'Prince Charles',
          correct: true,
        },
        {
          answer: 'Prince Diana',
          correct: true,
        },
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    };

    // Create the initial question and get its ID
    const createdQuestionResponse = adminQuizCreateQuestionRequest(newUser1.token, newQuiz.quizId, newQuestion);
    const questionId = createdQuestionResponse.questionId;

    expect(() => adminQuizQuestionDeleteRequest('', newQuiz.quizId, questionId)).toThrow(HTTPError[401]);
  });

  test('Valid token but not of user', () => {
    const newUser1 = authRegisterRequest('Validemail1@gmail.com', 'password123', 'Shervin', 'Erfanian');
    const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password123', 'Jane', 'Choi');
    const newQuiz = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    const newQuestion = {
      question: 'Sample Question 1',
      duration: 5,
      points: 4,
      answers: [
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Wales',
          correct: true,
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Charles',
          correct: true,
        },
        {
          answerId: expect.any(Number),
          colour: expect.any(String),
          answer: 'Prince Diana',
          correct: true,
        },
      ],
      thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
    };

    // Create the initial question and get its ID
    const createdQuestionResponse = adminQuizCreateQuestionRequest(newUser1.token, newQuiz.quizId, newQuestion);
    const questionId = createdQuestionResponse.questionId;

    expect(() => adminQuizQuestionDeleteRequest(newUser2.token, newQuiz.quizId, questionId)).toThrow(HTTPError[403]);
  });

  test('Tests for sessions are not in END state', () => {
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
    const question1 = adminQuizCreateQuestionRequest(User1.token, Quiz1.quizId, Question1);
    expect(adminSessionStartRequest(User1.token, Quiz1.quizId, 1)).toEqual({ sessionId: expect.any(Number) });
    expect(() => adminQuizQuestionDeleteRequest(User1.token, Quiz1.quizId, question1.questionId)).toThrow(HTTPError[400]);
  });
});
