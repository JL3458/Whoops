import request from 'sync-request-curl';
import { port, url } from './config.json';
import { clearRequest } from './other.test';
import { authRegisterRequest } from './auth.test';
import { adminQuizCreateRequest, adminQuizInfoRequest } from './quiz.test';
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
export function adminQuizQuestionDeleteRequest(token: string, quizid: number, questionId: number) {
  const request1 = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizid}/question/${questionId}`, { qs: { token: token } });
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
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser2.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
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
          ]
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
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId + 1, newQuestion)).toEqual(ERROR);
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
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
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
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
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
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
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
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
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
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId + 1, newQuestion)).toEqual(ERROR);
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
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
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
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(QUESTIONID);
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
          ]
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
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
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
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
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
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
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
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
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
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
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
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
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
          ]
        };
    expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(ERROR);
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
      ]
    };

    // Create the initial question and get its ID
    const createdQuestionResponse = adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion);
    const questionId = createdQuestionResponse.questionId;

    // Update the question
    const updatedQuestion = {
      question: 'Updated Sample Question',
      duration: 10,
      points: 6,
      answers: [
        {
          answer: 'Updated Prince Wales',
          correct: false,
        },
        {
          answer: 'Updated Prince Charles',
          correct: true,
        },
        {
          answer: 'Updated Prince Diana',
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
      question: 'Updated Sample Question',
      duration: 10,
      points: 6,
      answers: [
        {
          answer: 'Updated Prince Wales',
          correct: false,
        },
        {
          answer: 'Updated Prince Charles',
          correct: true,
        },
        {
          answer: 'Updated Prince Diana',
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
      ]
    };

    // Create the initial question and get its ID
    const createdQuestionResponse = adminQuizCreateQuestionRequest(newUser1.token, newQuiz.quizId, newQuestion);
    const questionId = createdQuestionResponse.questionId;

    // Attempt to update the question with an invalid token (newUser2's token)
    const updatedQuestion = {
      question: 'Updated Sample Question',
      duration: 10,
      points: 6,
      answers: [
        {
          answer: 'Updated Prince Wales',
          correct: false,
        },
        {
          answer: 'Updated Prince Charles',
          correct: true,
        },
        {
          answer: 'Updated Prince Diana',
          correct: true,
        },
      ]
    };

    expect(adminQuizUpdateQuestionRequest(newUser2.token, newQuiz.quizId, questionId, updatedQuestion)).toEqual(ERROR);
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
      ]
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
      ]
    };
    // Check if question is in questions array
    expect(quizInfo.questions).toEqual([quizInfoOutput]); 
    expect(adminQuizQuestionDeleteRequest(newUser.token, newQuiz.quizId, questionId)).toEqual({});
    quizInfo = adminQuizInfoRequest(newUser.token, newQuiz.quizId);
    //Should be an emoty array after deleting question
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
      ]
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
      ]
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
      ]
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
      ]
    };
    const newQuestionOutput2 = {
      questionId: questionId2,
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
      ]
    };
    const newQuestionOutput3 = {
      questionId: questionId3,
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
      ]
    };
    // Confirm if questions are in questions array
    expect(quizInfo.questions).toEqual([newQuestionOutput1, newQuestionOutput2, newQuestionOutput3]); 
    // Delete the question
    expect(adminQuizQuestionDeleteRequest(newUser.token, newQuiz.quizId, questionId2)).toEqual({});
    quizInfo = adminQuizInfoRequest(newUser.token, newQuiz.quizId);
    //Should be an array with 2 questions after deleting question as shown below
    const quizInfoOutput = [{
      questionId: questionId1,
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
      ]
    },
    {
      questionId: questionId3,
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
      ]
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
      ]
    };

    // Create the initial question and get its ID
    const createdQuestionResponse = adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion);

    // Attempt to delete a non-existent question (use a non-existent questionId)
    expect(adminQuizQuestionDeleteRequest(newUser.token, newQuiz.quizId, createdQuestionResponse.questionId + 1)).toEqual(ERROR);
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
      ]
    };

    // Create the initial question and get its ID
    const createdQuestionResponse = adminQuizCreateQuestionRequest(newUser1.token, newQuiz.quizId, newQuestion);
    const questionId = createdQuestionResponse.questionId;

    expect(adminQuizQuestionDeleteRequest('', newQuiz.quizId, questionId)).toEqual(ERROR);
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
      ]
    };

    // Create the initial question and get its ID
    const createdQuestionResponse = adminQuizCreateQuestionRequest(newUser1.token, newQuiz.quizId, newQuestion);
    const questionId = createdQuestionResponse.questionId;

    expect(adminQuizQuestionDeleteRequest(newUser2.token, newQuiz.quizId, questionId)).toEqual(ERROR);
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
            ]
        }
        expect(adminQuizCreateQuestionRequest(newUser.token, newQuiz.quizId, newQuestion)).toEqual(QUESTIONID);
    });

*/
