import { getData, setData, States, player, metadata, session } from './dataStore';
import HTTPError from 'http-errors';

/// ////////////////////////  Interface definitions ///////////////////////////////////

interface SessionStartReturn {
    sessionId: number
}

interface QuizGetSessionReturn {
  state: string,
  atQuestion: number,
  players: string[],
  metadata: metadata,
}

interface ErrorReturn {
  error: string;
}

interface ViewSessionsReturn {
  activeSessions: number[],
  inactiveSessions: number[]
}

export interface scheduledCountdown {
  sessionId: number,
  currentCountdown: ReturnType<typeof setTimeout>
}

// Global array to store all the Timeout Objects
export let scheduledCountdowns: scheduledCountdown[] = [];

// This function intialises the countdowns to empty array when clear is called.
export function intialiseCountdowns() {
  scheduledCountdowns = [];
}

export enum Action {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END'
}

/*
// Kept for reference
export enum States {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END',
}
*/

/// //////////////////////// Main Functions ///////////////////////////////////

export function adminViewSessions(token: string, quizId: number): ViewSessionsReturn {
  const data = getData();

  if (checkValidToken(token)) {
    throw HTTPError(401, 'Token is empty or invalid');
  }
  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  const tempQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  // Checks if the quiz belongs to the current logged in user
  if (tempQuiz !== undefined && tempQuiz.userId !== tempToken.userId) {
    throw HTTPError(403, 'Valid token is provided, but user is not an owner of this quiz');
  }

  // Finds all sessions of a quiz
  const sessionsOfQuiz = data.sessions.filter((session) => session.metadata.quizId === quizId);

  const activeSessions = sessionsOfQuiz.filter((session) => session.state !== States.END);
  const inactiveSessions = sessionsOfQuiz.filter((session) => session.state === States.END);

  const activeSessionsIds = activeSessions.map((session) => session.sessionId);
  const inactiveSessionsIds = inactiveSessions.map((session) => session.sessionId);

  // Returns active and inactive sessions
  return {
    activeSessions: activeSessionsIds,
    inactiveSessions: inactiveSessionsIds
  };
}

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

  // Finds all sessions of a quiz
  const sessionsOfQuiz = data.sessions.filter((session) => session.metadata.quizId === quizId);
  const countNotEndState = sessionsOfQuiz.reduce((counter, session) => (session.state === States.END ? counter : counter + 1), 0);
  if (countNotEndState === 10) {
    throw HTTPError(400, 'A maximum of 10 sessions that are not in END state currently exist');
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
    players: [] as player[],
    metadata: quizMetadata,
  };

  data.sessions.push(newSession);
  setData(data);

  // Returns sessionId
  return {
    sessionId: newSessionId
  };
}

export function adminUpdateSessionState(token: string, quizId: number, sessionId: number, action: string): object {
  const data = getData();

  if (checkValidToken(token)) {
    throw HTTPError(401, 'Token is empty or invalid');
  }
  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  const tempQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  // Finds all sessions of a quiz
  const sessionsOfQuiz = data.sessions.filter((session) => session.metadata.quizId === quizId);
  const currentSession = sessionsOfQuiz.find((session) => session.sessionId === sessionId);
  if (sessionsOfQuiz === undefined || currentSession === undefined) {
    throw HTTPError(400, 'Session Id does not refer to a valid session within this quiz');
  }

  if (!(action in Action)) {
    throw HTTPError(400, 'Action provided is not a valid Action enum');
  }

  if (checkValidAction(currentSession.state, action)) {
    throw HTTPError(400, 'Action enum cannot be applied in the current state');
  }

  // Checks if the quiz belongs to the current logged in user
  if (tempQuiz !== undefined && tempQuiz.userId !== tempToken.userId) {
    throw HTTPError(403, 'Valid token is provided, but user is not an owner of this quiz');
  }

  if (action === Action.NEXT_QUESTION) {
    if (currentSession.state === States.LOBBY) {
      countdown(currentSession);
    } else {
      if (currentSession.atQuestion === currentSession.metadata.numQuestions) {
        currentSession.state = States.END;
        currentSession.atQuestion = 0;
      } else {
        countdown(currentSession);
      }
    }
  }

  if (action === Action.GO_TO_ANSWER) {
    currentSession.state = States.ANSWER_SHOW;
  }

  if (action === Action.GO_TO_FINAL_RESULTS) {
    currentSession.state = States.FINAL_RESULTS;
    currentSession.atQuestion = 0;
  }

  if (action === Action.END) {
    currentSession.state = States.END;
    currentSession.atQuestion = 0;
  }

  if (action === Action.SKIP_COUNTDOWN) {
    // Find the countdown to be skipped
    const findTimer = scheduledCountdowns.find((countdown) => countdown.sessionId === currentSession.sessionId);
    clearTimeout(findTimer.currentCountdown);

    // Finding the where the timout object was stored (to be deleted)
    const timerIndex = scheduledCountdowns.findIndex((countdown) => countdown.sessionId === currentSession.sessionId);
    scheduledCountdowns.splice(timerIndex, 1);

    // Moving to question_open state
    currentSession.state = States.QUESTION_OPEN;
    setTimeout(() => {
      currentSession.state = States.QUESTION_CLOSE;
    }, currentSession.metadata.questions[currentSession.atQuestion - 1].duration * 1000);
  }

  return {};
}

export function adminQuizGetSession(token: string, sessionId: number, quizId: number): QuizGetSessionReturn | ErrorReturn {
  const data = getData();
  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    throw HTTPError(401, 'Token is empty or invalid (does not refer to valid logged in user session)');
  }

  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // Retrieves the names of the quizzes and respective quizIds
  const tempQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  // compares the session number with the unhashed version
  const session = data.sessions.find((session) => session.sessionId === sessionId);

  // checks if the quiz exists (NOT IN SWAGGER FOR SOME REASON) but this is to remove the ts error.
  if (tempQuiz === undefined) {
    throw HTTPError(403, 'Quiz does not exist');
  }
  // checks if the session exists (NOT IN SWAGGER FOR SOME REASON) but this is to remove the ts error.
  if (session === undefined) {
    throw HTTPError(400, 'Session not found');
  }

  if (session.sessionId !== sessionId) {
    throw HTTPError(400, 'Session Id does not refer to a valid session within this quiz');
  }

  if (tempQuiz.userId !== tempToken.userId) {
    throw HTTPError(403, 'Valid token is provided, but user is not authorised to view this session');
  }

  const quizMetadata = data.quizzes.find((quiz) => quiz.quizId === session.metadata.quizId);
  // checks if the metadata exists (NOT IN SWAGGER FOR SOME REASON) but this is to remove the ts error.
  if (quizMetadata === undefined) {
    throw HTTPError(400, 'no metadata');
  }

  // Mapping a new array containing the names of the players
  const playerNames = session.players.map((player) => player.name);

  const returnValue: QuizGetSessionReturn = {
    state: session.state,
    atQuestion: session.atQuestion,
    players: playerNames,
    metadata: {
      quizId: quizMetadata.quizId,
      name: quizMetadata.name,
      timeCreated: quizMetadata.timeCreated,
      timeLastEdited: quizMetadata.timeLastEdited,
      description: quizMetadata.description,
      numQuestions: quizMetadata.questions.length,
      questions: quizMetadata.questions,
      duration: 1,
      thumbnailUrl: quizMetadata.thumbnailUrl,
    },
  };
  // returns the session information in the format
  return returnValue;
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

function checkValidAction(currentState: string, action: string) {
  if (currentState === States.LOBBY) {
    if (action !== Action.NEXT_QUESTION && action !== Action.END) {
      return true;
    }
  }

  if (currentState === States.QUESTION_COUNTDOWN) {
    if (action !== Action.SKIP_COUNTDOWN && action !== Action.END) {
      return true;
    }
  }

  if (currentState === States.QUESTION_OPEN) {
    if (action !== Action.GO_TO_ANSWER && action !== Action.END) {
      return true;
    }
  }

  if (currentState === States.QUESTION_CLOSE) {
    if (action === Action.SKIP_COUNTDOWN) {
      return true;
    }
  }

  if (currentState === States.ANSWER_SHOW) {
    if (action !== Action.NEXT_QUESTION && action !== Action.END && action !== Action.GO_TO_FINAL_RESULTS) {
      return true;
    }
  }

  if (currentState === States.FINAL_RESULTS) {
    if (action !== Action.END) {
      return true;
    }
  }

  if (currentState === States.END) {
    return true;
  }

  return false;
}

// Starts countdown for question
export function countdown(currentSession: session) {
  ++currentSession.atQuestion;

  currentSession.state = States.QUESTION_COUNTDOWN;

  const timer = setTimeout(() => {
    currentSession.state = States.QUESTION_OPEN;
    // Start a question timer
    setTimeout(() => {
      currentSession.state = States.QUESTION_CLOSE;
    }, currentSession.metadata.questions[currentSession.atQuestion - 1].duration * 1000);
  }, 3 * 1000);

  scheduledCountdowns.push({ sessionId: currentSession.sessionId, currentCountdown: timer });
}

// // Function to block execution (i.e. sleep)
// // Not ideal (inefficent/poor performance) and should not be used often.
// //
// // Alternatives include:
// // - https://www.npmjs.com/package/atomic-sleep
// // - or use async (not covered in this course!)
// function sleepSync(ms: number) {
//   const startTime = new Date().getTime();
//   while (new Date().getTime() - startTime < ms) {
//     // zzzZZ - comment needed so eslint doesn't complain
//   }
// }

// const User1 = adminAuthRegister('landonorris@gmail.com', 'validpassword12', 'Kyrie', 'Irving');
// const Quiz1 = adminQuizCreate(User1.token, 'Test Quiz 1', 'This is a test');
// const Question1 =
//     {
//       question: 'Sample Question 1',
//       duration: 5,
//       points: 4,
//       answers: [
//         {
//           answer: 'Prince Wales',
//           correct: true
//         },
//         {
//           answer: 'Prince Charles',
//           correct: true
//         },
//         {
//           answer: 'Prince Diana',
//           correct: true
//         }
//       ],
//       thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
//     };
// adminQuizCreateQuestion(User1.token, Quiz1.quizId, Question1);

// // Create 10 sessions that are not in END state
// const session1 = adminSessionStart(User1.token, Quiz1.quizId, 1)
// const session2 = adminSessionStart(User1.token, Quiz1.quizId, 2)
// const session3 = adminSessionStart(User1.token, Quiz1.quizId, 3)

// // console.log(getData().sessions);

// console.log(adminUpdateSessionState(User1.token, Quiz1.quizId, session2.sessionId, Action.NEXT_QUESTION));
// sleepSync(3 * 1000)
// console.log(getData().sessions);
// sleepSync(3 * 1000)
// console.log(getData().sessions);
