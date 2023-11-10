import { getData, setData } from './dataStore';
import { checkValidToken } from './quiz';
import request from 'sync-request-curl';
import HTTPError from 'http-errors';

/// ///////////////// Function Return Interfaces ///////////////////

interface answer {
  answer: string,
  correct: boolean
}

export interface questionBody {
  question: string,
  duration: number,
  points: number,
  answers: answer[],
  thumbnailUrl: string
}

interface ErrorReturn {
    error: string;
}

interface QuestionCreateReturn {
    questionId: number,
}

interface DuplicateQuestionReturn {
    newQuestionId: number
}

/// //////////////////// Helper Functions //////////////////////////

// Helper function to generate random colour names
function generateRandomColorName() {
  const colorNames = ['red', 'blue', 'green', 'yellow', 'purple', 'brown', 'orange'];
  const randomIndex = Math.floor(Math.random() * colorNames.length);
  return colorNames[randomIndex];
}

function isValidImageFileType(fileType: string): boolean {
  return ['jpg', 'jpeg', 'png'].includes(fileType.toLowerCase());
}

/// //////////////////// Main Functions ///////////////////////////

export function adminQuizCreateQuestion (token: string, quizId: number, question: questionBody): QuestionCreateReturn | ErrorReturn {
  const data = getData();

  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    throw HTTPError(401, 'Token is empty or invalid');
  }
  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // Checks if quizId refers to an invalid quiz
  const tempQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  if (tempQuiz === undefined) {
    throw HTTPError(400, 'quizId is not of a valid quiz');
  }

  // Checks if the quiz belongs to the current logged in user
  if (tempQuiz !== undefined && tempQuiz.userId !== tempToken.userId) {
    throw HTTPError(403, 'Valid token is provided, but user is not an owner of this quiz');
  }

  // Checks if Question string is valid
  if (question.question.length < 5 || question.question.length > 50) {
    throw HTTPError(400, 'Question string should be between 3 and 30 characters');
  }

  // Checks if the question has between 2 to 6 answers
  if (question.answers.length < 2 || question.answers.length > 6) {
    throw HTTPError(400, 'The question should have between 2 to 6 answers');
  }

  // Checks if question.duration is positive
  if (question.duration <= 0) {
    throw HTTPError(400, 'Question duration must be a positive number');
  }

  // Checks if total duration of all questions is above 3 minutes
  const totalQuestionDuration = tempQuiz.questions.reduce((sum, currQues) => sum + currQues.duration, 0);
  if ((totalQuestionDuration + question.duration) > 180) {
    throw HTTPError(400, 'The sum of the question durations in the quiz exceeds 3 minutes');
  }

  // Checks if question points are valid
  if (question.points < 1 || question.points > 10) {
    throw HTTPError(400, 'The points awarded for the question should be between 1 and 10');
  }

  // Check if Answer Length is Invalid
  const invalidAnswer = question.answers.find((answer) => answer.answer.length < 1 || answer.answer.length > 30);
  if (invalidAnswer !== undefined) {
    throw HTTPError(400, 'Answer length should be between 1 and 30 characters');
  }

  // Check if answer titles contain a duplicate
  const answers = question.answers.map(answer => answer.answer);
  if (answers.some((title, index) => answers.indexOf(title) !== index)) {
    throw HTTPError(400, 'Answers should not contain duplicates');
  }

  // Checks if there are no correct answers
  const correctAnswer = question.answers.find((answer) => answer.correct === true);
  if (correctAnswer === undefined) {
    throw HTTPError(400, 'There are no correct answers');
  }

  if (question.thumbnailUrl === '') {
    throw HTTPError(400, 'The thumbnailUrl is not an empty string');
  }

  try {
    const response = request('GET', question.thumbnailUrl);
    if (response.statusCode === 200) {
      const contentType = response.headers['content-type'];
      const fileExtension = contentType.split('/')[1];

      if (!isValidImageFileType(fileExtension)) {
        throw HTTPError(400, 'The thumbnailUrl should be a JPG or PNG file');
      }
    } else {
      throw HTTPError(400, 'The thumbnailUrl does not return a valid file');
    }
  } catch (error) {
    throw HTTPError(400, 'Error in fetching thumbnail');
  }

  interface answerDescription extends answer {
    answerId: string,
    colour: string,
  }

  let answerIdGenerator = 1;
  question.answers.forEach((answer) => {
    answer.answerId = answerIdGenerator++;
    answer.colour = generateRandomColorName();
  });

  const questionIdGenerator = data.questionIdCounter + 1;
  data.questionIdCounter++;
  const tempQuestion = {
    questionId: questionIdGenerator,
    question: question.question,
    duration: question.duration,
    points: question.points,
    answers: question.answers as answerDescription[],
    thumbnailUrl: question.thumbnailUrl,
  };

  tempQuiz.questions.push(tempQuestion);
  tempQuiz.timeLastEdited = Math.floor(Date.now() / 1000);

  setData(data);

  return {
    questionId: tempQuestion.questionId
  };
}

export function adminQuizQuestionUpdate(token: string, quizId: number, questionId: number, updatedQuestion: questionBody): object | ErrorReturn {
  const data = getData();

  // If Token is an empty string
  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    return { error: 'Token is empty or invalid' };
  }
  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // Checks if quizId refers to a valid quiz
  const tempQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  if (tempQuiz === undefined) {
    return { error: 'quizId is not of a valid quiz' };
  }

  // Checks if the quiz belongs to the current logged-in user
  if (tempQuiz.userId !== tempToken.userId) {
    return { error: 'Valid token is provided, but user is not an owner of this quiz' };
  }

  // Find the question in the quiz by questionId
  const existingQuestion = tempQuiz.questions.find((ques) => ques.questionId === questionId);

  // Check if the question with the specified questionId exists
  if (existingQuestion === undefined) {
    return { error: 'Specified questionId does not exist in this quiz' };
  }
  // Checks if the question has between 2 to 6 answers
  if (updatedQuestion.answers.length < 2 || updatedQuestion.answers.length > 6) {
    return { error: 'The updatedQuestion should have between 2 to 6 answers' };
  }

  // Checks if updatedQuestion.duration is positive
  if (updatedQuestion.duration < 0) {
    return { error: 'Question duration must be a positive number' };
  }

  // Checks if total duration of all questions are above 3 minutes
  const totalQuestionDuration = tempQuiz.questions.reduce((sum, currQues) => sum + currQues.duration, 0);
  if ((totalQuestionDuration + updatedQuestion.duration) > 180) {
    return { error: 'The sum of the question durations in the quiz exceeds 3 minutes' };
  }

  // Checks if question points are valid
  if (updatedQuestion.points < 1 || updatedQuestion.points > 10) {
    return { error: 'The points awarded for the question should be between 1 and 10' };
  }

  // Check if Answer Length is Invalid
  const invalidAnswer = updatedQuestion.answers.find((answer) => answer.answer.length < 1 || answer.answer.length > 30);
  if (invalidAnswer !== undefined) {
    return { error: 'Answer length should be between 1 and 30 characters' };
  }

  // Check if answer titles contain a duplicate
  const answers = updatedQuestion.answers.map(answer => answer.answer);
  if (answers.some((title, index) => answers.indexOf(title) !== index)) {
    return { error: 'Answers should not contain duplicates' };
  }

  // Checks if there are no correct answers
  const correctAnswer = updatedQuestion.answers.find((answer) => answer.correct === true);
  if (correctAnswer === undefined) {
    return { error: 'There are no correct answers' };
  }

  // Perform your validation for the updated updatedQuestion here
  if (updatedQuestion.question.length < 5 || updatedQuestion.question.length > 50) {
    return { error: 'Question string should be between 5 and 50 characters' };
  }

  // Check other conditions for the updated question as needed

  // Update the existing question with the new data
  existingQuestion.question = updatedQuestion.question;
  existingQuestion.duration = updatedQuestion.duration;
  existingQuestion.points = updatedQuestion.points;
  existingQuestion.answers = updatedQuestion.answers;

  existingQuestion.answers.forEach((answer) => {
    answer.colour = generateRandomColorName();
  });

  tempQuiz.timeLastEdited = Math.floor(Date.now() / 1000);

  setData(data);
  return {};
}

export function adminQuizQuestionMove(token: string, newPosition: number, quizId: number, questionId: number): object | ErrorReturn {
  const data = getData();

  if (checkValidToken(token)) {
    throw HTTPError(401, 'Token is empty or invalid');
  }
  const quiz1 = data.quizzes.find((q) => q.quizId === quizId);

  const Token1 = JSON.parse(decodeURIComponent(token));

  // Checks if quizId refers to an invalid quiz
  if (!quiz1) {
    throw HTTPError(400, 'Quiz does not exist');
  }

  // Find the question in the quiz
  const currentQuestionIndex = quiz1.questions.findIndex((q) => q.questionId === questionId);

  // Checks if the questionId does not refer to a valid question within this quiz
  if (currentQuestionIndex === -1) {
    throw HTTPError(400, 'Question Id does not refer to a valid question within this quiz');
  }

  // Checks if the quiz belongs to the current logged in user
  if (quiz1 !== undefined && quiz1.userId !== Token1.userId) {
    throw HTTPError(403, 'Valid token is provided but user is not the owner of the quiz');
  }

  // Checks if newPosition is less than 0 or greater than (n-1)
  if (newPosition < 0 || newPosition > (quiz1.questions.length - 1)) {
    throw HTTPError(400, 'NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions');
  }

  // Checks if the newPosition is the same as the current position
  if (newPosition === currentQuestionIndex) {
    throw HTTPError(400, 'NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions');
  }

  // Update timeLastEdited of the quiz
  quiz1.timeLastEdited = Math.floor(Date.now() / 1000);

  // Move the question in the list
  const movedQuestion = quiz1.questions.splice(currentQuestionIndex, 1)[0];
  quiz1.questions.splice(newPosition, 0, movedQuestion);
  setData(data);
  return {};
}

export function adminQuizQuestionDelete(token: string, quizId: number, questionId: number): object | ErrorReturn {
  const data = getData();

  // If Token is an empty string
  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    return { error: 'Token is empty or invalid' };
  }
  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // Finds the quiz
  const tempQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  if (tempQuiz === undefined) {
    return { error: 'quizId is not of a valid quiz' };
  }

  // Find the question in the quiz by questionId
  const existingQuestion = tempQuiz.questions.findIndex((ques) => ques.questionId === questionId);

  // Check if the question with the specified questionId exists
  if (existingQuestion === -1) {
    return { error: 'Specified questionId does not exist in this quiz' };
  }

  // Checks if the quiz belongs to the current logged-in user
  if (tempQuiz.userId !== tempToken.userId) {
    return { error: 'Valid token is provided, but user is not an owner of this quiz' };
  }

  // Delete the question
  tempQuiz.questions.splice(existingQuestion, 1);

  setData(data);
  return {};
}

export function adminQuizQuestionDuplicate(token: string, quizId: number, questionId: number): ErrorReturn | DuplicateQuestionReturn {
  const data = getData();

  // Checks if the token is empty
  if (checkValidToken(token)) {
    throw HTTPError(401, 'Token is empty or invalid');
  }

  const Quiz1 = data.quizzes.find((quiz) => quiz.quizId === quizId);

  // Find the source question in the quiz
  const sourceQuestionIndex = Quiz1.questions.findIndex((question) => question.questionId === questionId);

  // Checks if the source question is not found
  if (sourceQuestionIndex === -1) {
    throw HTTPError(400, 'Question Id does not refer to a valid question within this quiz');
  }

  const Token1 = JSON.parse(decodeURIComponent(token));

  // Checks if the quiz belongs to the current logged-in user
  if (Quiz1 !== undefined && Quiz1.userId !== Token1.userId) {
    throw HTTPError(403, 'Valid token is provided but user is not the owner of the quiz');
  }
  // Duplicate the source question manually
  const sourceQuestion = Quiz1.questions[sourceQuestionIndex];
  const newQuestionId = Quiz1.questions.length + 1;

  const duplicatedQuestion = {
    // Manually copy each property from sourceQuestion
    questionId: newQuestionId,
    question: sourceQuestion.question,
    duration: sourceQuestion.duration,
    points: sourceQuestion.points,
    answers: sourceQuestion.answers,
    thumbnailUrl: sourceQuestion.thumbnailUrl
  };

  // Update timeLastEdited of the quiz
  Quiz1.timeLastEdited = Math.floor(Date.now() / 1000);

  // Insert the duplicated question immediately after the source question
  Quiz1.questions.splice(sourceQuestionIndex + 1, 0, duplicatedQuestion);

  return { newQuestionId: newQuestionId };
}
