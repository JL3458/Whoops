import request from 'sync-request-curl';
import { port, url } from './config.json';
import { clearRequest } from './other.test';
import { authRegisterRequest } from './auth.test';
import { adminQuizCreateRequest } from './quiz.test';
import { questionBody } from './question';

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };
const QUESTIONID = { questionId: expect.any(Number) };

/// //////////////////// Helper Functions //////////////////////

export function adminQuizCreateQuestionRequest(token: string, quizid: number, question: questionBody) {
  const request1 = request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/question`, { json: { token: token, question: question } });
  return JSON.parse(request1.body as string);
}
export function adminQuizUpdateQuestionRequest(token: string, quizid: number, questionId: number, updatedQuestion: questionBody) {
  const request1 = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizid}/question/${questionId}`, {
    json: { token: token, updatedQuestion: updatedQuestion },
  });
  return JSON.parse(request1.body as string);
}

/// /////////////////////// Main Tests /////////////////////////////
// TODO: Add relevant tests calling the server.ts files

describe('Tests of adminQuizCreateQuestion', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Token is Empty or Invalid', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const newQuestion =
        {
          questionTitle: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answerTitle: 'Prince Wales',
              correct: true
            },
            {
              answerTitle: 'Prince Charles',
              correct: true
            },
            {
              answerTitle: 'Prince Diana',
              correct: true
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest('', newQuiz.quizId, newQuestion)).toEqual(ERROR);
  });

  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    const newQuestion =
        {
          questionTitle: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answerTitle: 'Prince Wales',
              correct: true
            },
            {
              answerTitle: 'Prince Charles',
              correct: true
            },
            {
              answerTitle: 'Prince Diana',
              correct: true
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser2.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
  });

  test('Test For Normal Case', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const newQuestion =
        {
          questionTitle: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answerTitle: 'Prince Wales',
              correct: true
            },
            {
              answerTitle: 'Prince Charles',
              correct: true
            },
            {
              answerTitle: 'Prince Diana',
              correct: true
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(QUESTIONID);
  });

  test('Test For Invalid QuizId', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const newQuestion =
        {
          questionTitle: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answerTitle: 'Prince Wales',
              correct: true
            },
            {
              answerTitle: 'Prince Charles',
              correct: true
            },
            {
              answerTitle: 'Prince Diana',
              correct: true
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId + 1, newQuestion)).toEqual(ERROR);
  });

  test('Test For Invalid Question String', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    let newQuestion =
        {
          questionTitle: 'Four',
          duration: 5,
          points: 4,
          answers: [
            {
              answerTitle: 'Prince Wales',
              correct: true
            },
            {
              answerTitle: 'Prince Charles',
              correct: true
            },
            {
              answerTitle: 'Prince Diana',
              correct: true
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
    newQuestion =
        {
          questionTitle: 'Exploring new frontiers broadens our horizons and enriches our lives',
          duration: 5,
          points: 4,
          answers: [
            {
              answerTitle: 'Prince Wales',
              correct: true
            },
            {
              answerTitle: 'Prince Charles',
              correct: true
            },
            {
              answerTitle: 'Prince Diana',
              correct: true
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
  });

  test('Test For Number of Answers in Question', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    let newQuestion =
        {
          questionTitle: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answerTitle: 'Prince Wales',
              correct: true
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
    newQuestion =
        {
          questionTitle: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answerTitle: 'Prince Wales',
              correct: true
            },
            {
              answerTitle: 'Prince Charles',
              correct: true
            },
            {
              answerTitle: 'Prince Raina',
              correct: true
            },
            {
              answerTitle: 'Prince Gill',
              correct: true
            },
            {
              answerTitle: 'Prince Kohli',
              correct: true
            },
            {
              answerTitle: 'Prince Diana',
              correct: true
            },
            {
              answerTitle: 'Prince Diana',
              correct: true
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
  });

  test('Test For Invalid QuizId', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const newQuestion =
        {
          questionTitle: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answerTitle: 'Prince Wales',
              correct: true
            },
            {
              answerTitle: 'Prince Charles',
              correct: true
            },
            {
              answerTitle: 'Prince Diana',
              correct: true
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId + 1, newQuestion)).toEqual(ERROR);
  });

  test('Test For Question Duration Positive', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    let newQuestion =
        {
          questionTitle: 'Sample Question 1',
          duration: -1,
          points: 4,
          answers: [
            {
              answerTitle: 'Prince Wales',
              correct: true
            },
            {
              answerTitle: 'Prince Charles',
              correct: true
            },
            {
              answerTitle: 'Prince Diana',
              correct: true
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
    newQuestion =
        {
          questionTitle: 'Sample Question 1',
          duration: 0,
          points: 4,
          answers: [
            {
              answerTitle: 'Prince Wales',
              correct: true
            },
            {
              answerTitle: 'Prince Charles',
              correct: true
            },
            {
              answerTitle: 'Prince Diana',
              correct: true
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(QUESTIONID);
  });

  test('Test For Sum of Duration Exceeding 180 seconds/3 minutes', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    let newQuestion =
        {
          questionTitle: 'Sample Question 1',
          duration: 90,
          points: 4,
          answers: [
            {
              answerTitle: 'Prince Wales',
              correct: true
            },
            {
              answerTitle: 'Prince Charles',
              correct: true
            },
            {
              answerTitle: 'Prince Diana',
              correct: true
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(QUESTIONID);
    newQuestion =
        {
          questionTitle: 'Sample Question 2',
          duration: 100,
          points: 4,
          answers: [
            {
              answerTitle: 'Prince Wales',
              correct: true
            },
            {
              answerTitle: 'Prince Charles',
              correct: true
            },
            {
              answerTitle: 'Prince Diana',
              correct: true
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
  });

  test('Test For Invalid Points', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    let newQuestion =
        {
          questionTitle: 'Sample Question 1',
          duration: 5,
          points: 0,
          answers: [
            {
              answerTitle: 'Prince Wales',
              correct: true
            },
            {
              answerTitle: 'Prince Charles',
              correct: true
            },
            {
              answerTitle: 'Prince Diana',
              correct: true
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
    newQuestion =
        {
          questionTitle: 'Sample Question 1',
          duration: 5,
          points: 11,
          answers: [
            {
              answerTitle: 'Prince Wales',
              correct: true
            },
            {
              answerTitle: 'Prince Charles',
              correct: true
            },
            {
              answerTitle: 'Prince Diana',
              correct: true
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
  });

  test('Test For Invalid Answer Length', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    let newQuestion =
        {
          questionTitle: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answerTitle: '',
              correct: true
            },
            {
              answerTitle: 'Prince Charles',
              correct: true
            },
            {
              answerTitle: 'Prince Diana',
              correct: true
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
    newQuestion =
        {
          questionTitle: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answerTitle: 'Exploring new frontiers broadens our horizons and enriches our lives',
              correct: true
            },
            {
              answerTitle: 'Prince Charles',
              correct: true
            },
            {
              answerTitle: 'Prince Diana',
              correct: true
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
  });

  test('Test For Duplicate Strings', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    let newQuestion =
        {
          questionTitle: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answerTitle: 'Prince Wales',
              correct: true
            },
            {
              answerTitle: 'Prince Wales',
              correct: true
            },
            {
              answerTitle: 'Prince Diana',
              correct: true
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
    newQuestion =
        {
          questionTitle: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answerTitle: 'Prince Wales',
              correct: true
            },
            {
              answerTitle: 'Prince Wales',
              correct: true
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
  });

  test('Test For No Correct Answers', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const newQuestion =
        {
          questionTitle: 'Sample Question 1',
          duration: 5,
          points: 4,
          answers: [
            {
              answerTitle: 'Prince Wales',
              correct: false
            },
            {
              answerTitle: 'Prince Charles',
              correct: false
            },
            {
              answerTitle: 'Prince Diana',
              correct: false
            }
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
  });
});

describe('Tests of adminQuizUpdateQuestion', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Update Question Successfully', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
    const newQuestion = {
      questionTitle: 'Sample Question 1',
      duration: 5,
      points: 4,
      answers: [
        {
          answerTitle: 'Prince Wales',
          correct: true,
        },
        {
          answerTitle: 'Prince Charles',
          correct: true,
        },
        {
          answerTitle: 'Prince Diana',
          correct: true,
        },
      ]
    };

    // Create the initial question and get its ID
    const createdQuestionResponse = adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion);
    const questionId = createdQuestionResponse.questionId;

    // Update the question
    const updatedQuestion = {
      questionTitle: 'Updated Sample Question',
      duration: 10,
      points: 6,
      answers: [
        {
          answerTitle: 'Updated Prince Wales',
          correct: false,
        },
        {
          answerTitle: 'Updated Prince Charles',
          correct: true,
        },
        {
          answerTitle: 'Updated Prince Diana',
          correct: true,
        },
      ]
    };

    expect(adminQuizUpdateQuestionRequest(newUser.token, newQuiz.quizId, questionId, updatedQuestion)).toEqual(QUESTIONID);
  });

  test('Attempt to Update Non-Existent Question', () => {
    const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
    const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');

    // Attempt to update a non-existent question (use a non-existent questionId)
    const nonExistentQuestionId = 12345; // Assuming this questionId doesn't exist
    const updatedQuestion = {
      questionTitle: 'Updated Sample Question',
      duration: 10,
      points: 6,
      answers: [
        {
          answerTitle: 'Updated Prince Wales',
          correct: false,
        },
        {
          answerTitle: 'Updated Prince Charles',
          correct: true,
        },
        {
          answerTitle: 'Updated Prince Diana',
          correct: true,
        },
      ]
    };

    expect(adminQuizUpdateQuestionRequest(newUser.token, newQuiz.quizId, nonExistentQuestionId, updatedQuestion)).toEqual(ERROR);
  });

  test('Invalid Token Provided for Update', () => {
    const newUser1 = authRegisterRequest('Validemail1@gmail.com', 'password123', 'Shervin', 'Erfanian');
    const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password123', 'Jane', 'Choi');
    const newQuiz = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
    const newQuestion = {
      questionTitle: 'Sample Question 1',
      duration: 5,
      points: 4,
      answers: [
        {
          answerTitle: 'Prince Wales',
          correct: true,
        },
        {
          answerTitle: 'Prince Charles',
          correct: true,
        },
        {
          answerTitle: 'Prince Diana',
          correct: true,
        },
      ]
    };

    // Create the initial question and get its ID
    const createdQuestionResponse = adminQuizCreateQuestionRequest(newUser1.token, newQuiz.quizId, newQuestion);
    const questionId = createdQuestionResponse.questionId;

    // Attempt to update the question with an invalid token (newUser2's token)
    const updatedQuestion = {
      questionTitle: 'Updated Sample Question',
      duration: 10,
      points: 6,
      answers: [
        {
          answerTitle: 'Updated Prince Wales',
          correct: false,
        },
        {
          answerTitle: 'Updated Prince Charles',
          correct: true,
        },
        {
          answerTitle: 'Updated Prince Diana',
          correct: true,
        },
      ]
    };

    expect(adminQuizUpdateQuestionRequest(newUser2.token, newQuiz.quizId, questionId, updatedQuestion)).toEqual(ERROR);
  });
});
/// //////////////////////// Epilouge //////////////////////////////

/*

/For ease of coding/

 test('Test For Normal Case', () => {
        const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
        const newQuiz = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
        const newQuestion =
        {
            questionTitle: 'Sample Question 1',
            duration: 5,
            points: 4,
            answers: [
                {
                    answerTitle: 'Prince Wales',
                    correct: true
                },
                {
                    answerTitle: 'Prince Charles',
                    correct: true
                },
                {
                    answerTitle: 'Prince Diana',
                    correct: true
                }
            ]
        }
        expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(QUESTIONID);
    });

*/
