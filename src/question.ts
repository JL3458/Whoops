import { getData, setData, answer } from './dataStore';

/// ///////////////// Function Return Interfaces ///////////////////

export interface questionBody {
    questionTitle: string,
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

export function adminQuizCreateQuestion (token: number, quizId: number, question: questionBody): QuestionCreateReturn | ErrorReturn {
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
  if (question.questionTitle.length < 5 || question.questionTitle.length > 50) {
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

  // Checks if totalQuestionDuration exceeds 3 mintues
  const totalQuestionDuration = data.questions.filter((question) => question.quizId === quizId).reduce((sum, currQues) => sum + currQues.duration, 0);
  if ((totalQuestionDuration + question.duration) > 180) {
    return { error: 'The sum of the question durations in the quiz exceeds 3 minutes' };
  }

  // Checks if question points are valid
  if (question.points < 1 || question.points > 10) {
    return { error: 'The points awarded for the question should be between 1 and 10' };
  }

  // Check if Answer Length is Invalid
  const invalidAnswerTitle = question.answers.find((answer) => answer.answerTitle.length < 1 || answer.answerTitle.length > 30);
  if (invalidAnswerTitle !== undefined) {
    return { error: 'Answer length should be between 1 and 30 characters' };
  }

  // Check if answer titles contain a duplicate
  const answerTitles = question.answers.map(answer => answer.answerTitle);
  if (answerTitles.some((title, index) => answerTitles.indexOf(title) !== index)) {
    return { error: 'Answers should not contain duplicates' };
  }

  // Checks if there are no correct answers
  const correctAnswer = question.answers.find((answer) => answer.correct === true);
  if (correctAnswer === undefined) {
    return { error: 'There are no correct answers' };
  }

  const questionIdGenerator = data.questions.length + 1;
  const tempQuestion = {
    quizId: quizId,
    questionId: questionIdGenerator,
    questionTitle: question.questionTitle,
    duration: question.duration,
    points: question.points,
    answers: question.answers
  };
  data.questions.push(tempQuestion);
  setData(data);

  return {
    questionId: tempQuestion.questionId
  };
}
