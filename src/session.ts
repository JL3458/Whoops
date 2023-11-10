import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';

/// ////////////////////////  Interface definitions ///////////////////////////////////

interface SessionStartReturn {
    sessionId: number
}

export enum States {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END',
}

/// //////////////////////// Main Functions ///////////////////////////////////

export function adminSessionStart(token: string, quizId: number, autoStartNum: number): SessionStartReturn {
  const data = getData();

  if (checkValidToken(token)) {
    throw HTTPError(401, 'Token is empty or invalid');
  }
  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  const tempQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  if (autoStartNum > 50) {
    throw HTTPError(400, 'AutoStartNum is a number greater than 50');
  }

  const countNotEndState = data.sessions.reduce((counter, session) => (session.state === States.END ? counter : counter + 1), 0);
  console.log(countNotEndState);
  if (countNotEndState === 10) {
    throw HTTPError(400, 'A maximum of 10 sessions that are not in END state currently exist');
  }

  // Checks if quizId refers to an invalid quiz
  if (tempQuiz === undefined) {
    throw HTTPError(403, 'Quiz does not exist');
  }

  if (tempQuiz.questions.length === 0) {
    throw HTTPError(400, 'The quiz does not have any questions in it');
  }

  // Checks if the quiz belongs to the current logged in user
  if (tempQuiz !== undefined && tempQuiz.userId !== tempToken.userId) {
    throw HTTPError(403, 'Valid token is provided, but user is not an owner of this quiz');
  }

  // Find total duration of quiz
  const totalQuestionDuration = tempQuiz.questions.reduce((sum, currQues) => sum + currQues.duration, 0);

  // Create metadata for quiz
  const quizMetadata = {
    quizId: tempQuiz.quizId,
    name: tempQuiz.name,
    description: tempQuiz.description,
    timeCreated: tempQuiz.timeCreated,
    timeLastEdited: tempQuiz.timeLastEdited,
    numQuestions: tempQuiz.questions.length,
    questions: tempQuiz.questions,
    duration: totalQuestionDuration,
    thumbnailUrl: tempQuiz.thumbnailUrl
  };

  // Creates a new session Id for the new session
  const newSessionId = data.sessions.length + 1;

  const newSession = {
    sessionId: newSessionId,
    autoStartNum: autoStartNum,
    state: States.LOBBY,
    atQuestion: 0,
    players: [] as string[],
    metadata: quizMetadata
  };

  data.sessions.push(newSession);
  setData(data);

  // Returns sessionId
  return {
    sessionId: newSessionId
  };
}

/// //////////////////////// Helper Functions ///////////////////////////////////

function checkValidToken(token: string): boolean {
  const data = getData();

  // Checking if a token exists
  if (token === '') {
    return true;
  }

  try {
    // Check the function that might throw a SyntaxError
    JSON.parse(decodeURIComponent(token));
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Handle the SyntaxError here
      return true;
    }
  }

  // convert token to an object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // Checks if there is a valid token
  if (!tempToken ||
      data.tokens.find((currentToken) => currentToken.userId === tempToken.userId) ===
      undefined) {
    return true;
  }

  return false;
}
