// New question.test.ts file to handle questions tests

import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
import { clearRequest } from './other.test';
import { authRegisterRequest } from './auth.test';
import { adminQuizCreateRequest } from './quiz.test';

// ADD LATER
// import (adminQuizInfoRequest} from './quiz.test';

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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg'
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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg'
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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg'
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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg'
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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg'
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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg'
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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg'
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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg'
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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg'
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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg'
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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg'
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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg'
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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg'
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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg'
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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg'
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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg'
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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg'
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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg'
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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg'
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
          thumbnailUrl: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/-1080x675.jpg'
        };
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
  });

  test('Test For Invalid Thumbnail String - Not a Jpeg', () => {
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
          thumbnailUrl: 'https://edstem.org/au/courses/13837/discussion/1687213'
        };
    expect(() => adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toThrow(HTTPError[400]);
  });
});
