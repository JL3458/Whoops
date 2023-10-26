import { adminAuthRegister } from './auth';
import { getData, setData, answer } from './dataStore';
import { adminQuizCreate, adminQuizInfo } from './quiz';

/// ///////////////// Function Return Interfaces ///////////////////

export interface questionBody {
    question: string,
    duration: number,
    points: number,
    answers: answer[]
}

interface ErrorReturn {
    error: string;
}

interface QuestionCreateReturn {
    questionId: number,
}

/// //////////////////// Helper Functions //////////////////////////

/// //////////////////// Main Functions ///////////////////////////

export function adminQuizCreateQuestion (token: string, quizId: number, question: questionBody){
  const data = getData();

  // If Token is an empty string
  if (token === '') {
    return { error: 'Token is empty or invalid' };
  }

  // Converts token string to token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // Checks if Token is Empty or invalid
  if (!tempToken || data.tokens.find((currentToken) => currentToken.userId === tempToken.userId) === undefined) {
    return { error: 'Token is empty or invalid' };
  }

  // Checks if quizId refers to an invalid quiz
  const tempQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  if (tempQuiz === undefined) {
    return { error: 'quizId is not of a valid quiz' };
  }

  // Checks if the quiz belongs to the current logged in user
  if (tempQuiz !== undefined && tempQuiz.userId !== tempToken.userId) {
    return { error: 'Valid token is provided, but user is not an owner of this quiz' };
  }

  // Checks if Question string is valid
  if (question.question.length < 5 || question.question.length > 50) {
    return { error: 'Question string should be between 3 and 30 characters' };
  }

  // Checks if the question has between 2 to 6 answers
  if (question.answers.length < 2 || question.answers.length > 6) {
    return { error: 'The question should have between 2 to 6 answers' };
  }

  // Checks if question.duration is positive
  if (question.duration < 0) {
    return { error: 'Question duration must be a positive number' };
  }

  // Checks if total duration of all questions are above 3 minutes
  const totalQuestionDuration = tempQuiz.questions.reduce((sum, currQues) => sum + currQues.duration, 0);
  if ((totalQuestionDuration + question.duration) > 180) {
    return { error: 'The sum of the question durations in the quiz exceeds 3 minutes' };
  }

  // Checks if question points are valid
  if (question.points < 1 || question.points > 10) {
    return { error: 'The points awarded for the question should be between 1 and 10' };
  }

  // Check if Answer Length is Invalid
  const invalidAnswer = question.answers.find((answer) => answer.answer.length < 1 || answer.answer.length > 30);
  if (invalidAnswer !== undefined) {
    return { error: 'Answer length should be between 1 and 30 characters' };
  }

  // Check if answer titles contain a duplicate
  const answers = question.answers.map(answer => answer.answer);
  if (answers.some((title, index) => answers.indexOf(title) !== index)) {
    return { error: 'Answers should not contain duplicates' };
  }

  // Checks if there are no correct answers
  const correctAnswer = question.answers.find((answer) => answer.correct === true);
  if (correctAnswer === undefined) {
    return { error: 'There are no correct answers' };
  }

  const questionIdGenerator = tempQuiz.questions.length + 1;
  const tempQuestion = {
    questionId: questionIdGenerator,
    question: question.question,
    duration: question.duration,
    points: question.points,
    answers: question.answers
  };
  tempQuiz.questions.push(tempQuestion);
  tempQuiz.timeLastEdited = Math.floor(Date.now() / 1000);

  setData(data);

  return {
    questionId: tempQuestion.questionId
  };
}

export function adminQuizQuestionUpdate(token: string, quizId: number, questionId: number, updatedQuestion: questionBody): QuestionCreateReturn | ErrorReturn {
  const data = getData();

  // If Token is an empty string
  if (token === '') {
    return { error: 'Token is empty or invalid' };
  }

  // Converts token string to token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // Checks if Token is Empty or invalid
  if (!tempToken || data.tokens.find((currentToken) => currentToken.userId === tempToken.userId) === undefined) {
    return { error: 'Token is empty or invalid' };
  }

  // Checks if quizId refers to a valid quiz
  const tempQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  if (tempQuiz === undefined) {
    return { error: 'quizId is not of a valid quiz' };
  }

  // Checks if the quiz belongs to the current logged-in user
  if (tempQuiz.userId !== tempToken.userId) {
    return { error: 'Valid token is provided, but the user is not the owner of this quiz' };
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

  tempQuiz.timeLastEdited = Math.floor(Date.now() / 1000);

  setData(data);
  return {
    questionId: existingQuestion.questionId
  };
}

export function adminQuizQuestionDelete(token: string, quizId: number, questionId: number): object | ErrorReturn {
  const data = getData();

  // If Token is an empty string
  if (token === '') {
    return { error: 'Token is empty or invalid' };
  }

  // Converts token string to token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // Checks if Token is Empty or invalid
  if (!tempToken || data.tokens.find((currentToken) => currentToken.userId === tempToken.userId) === undefined) {
    return { error: 'Token is empty or invalid' };
  }

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
    return { error: 'Valid token is provided, but the user is not the owner of this quiz' };
  }

  // Delete the question
  tempQuiz.questions.splice(existingQuestion, 1); 

  setData(data);
  return {};
}
