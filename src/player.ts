import { getData, setData, States } from './dataStore';
import HTTPError from 'http-errors';
// import { adminAuthRegister } from './auth';
// import { adminQuizCreate } from './quiz';
// import { adminQuizCreateQuestion } from './question';
// import { adminSessionStart, adminUpdateSessionState } from './session';

/// ////////////////////////  Interface definitions /////////////////////////////

interface playerStatusReturn {
  state: string,
  atQuestion: number,
  numQuestions: number
}

interface playerJoinReturn {
  playerId: number
}

interface ErrorReturn {
  error: string;
}

/// //////////////////////// Helper Functions ///////////////////////////////////

export function generateRandomName(): string {
  const data = getData();

  // Defining all the alphabets
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';

  // Defining all the numbers
  const numbers = '0123456789';

  // Defining shuffleString to carry out Randomizing
  const shuffleString = (string: string): string => {
    const tempArray = string.split('');
    for (let currentLetter = tempArray.length - 1; currentLetter > 0; currentLetter--) {
      const randomizerIndex = Math.floor(Math.random() * (currentLetter + 1));
      [tempArray[currentLetter], tempArray[randomizerIndex]] = [tempArray[randomizerIndex], tempArray[currentLetter]];
    }
    return tempArray.join('');
  };

  // Get a random string of 5 letters from the alphabet
  const randomString = shuffleString(alphabet).substring(0, 5);

  // Get a random string of 3 numbers
  const randomNumbers = shuffleString(numbers).substring(0, 3);

  let randomizedUserName = `${randomString}${randomNumbers}`;

  if (data.sessions.find((session) => session.players.find((player) => player.name === randomizedUserName)) !== undefined) {
    randomizedUserName = generateRandomName();
  }

  return randomizedUserName;
}

/// //////////////////////// Main Functions ///////////////////////////////////

export function playerJoin(sessionId: number, name: string): playerJoinReturn | ErrorReturn {
  const data = getData();

  // find the current session correspsonding to the correct sessionId
  const tempSession = data.sessions.find((session) => session.sessionId === sessionId);
  if (tempSession === undefined) {
    throw HTTPError(400, 'Session is invalid');
  }

  if (tempSession !== undefined && tempSession.state !== States.LOBBY) {
    throw HTTPError(400, 'Session is not in LOBBY state');
  }

  // Name of user entered is not unique (compared to other users who have already joined)
  if (name !== '' && data.sessions.find((session) => session.players.find((player) => player.name === name)) !== undefined) {
    throw HTTPError(400, 'Name of user entered is not unique (compared to other users who have already joined)');
  }

  // If the name string is empty generate a new name
  if (name === '') {
    name = generateRandomName();
  }

  const playerIdGenerator = data.playerIdCounter + 1;

  data.playerIdCounter++;

  const tempPlayer =
    {
      playerId: playerIdGenerator,
      name: name,
      score: 0,
      correctQuestionsList: [] as number[],
    };

  tempSession.players.push(tempPlayer);
  setData(data);
  return {
    playerId: tempPlayer.playerId
  };
}

export function playerCurrentQuestionInfo(playerId: number, questionPosition: number) {
  const data = getData();

  // Find the player corresponding to the given playerId
  const player = data.sessions
    .flatMap((session) => session.players)
    .find((player) => player.playerId === playerId);

  // Check if the player exists
  if (!player) {
    throw HTTPError(400, 'Player ID does not exist');
  }

  // Check if the question position is valid for the session
  const session = data.sessions.find((session) => session.players.includes(player));

  if (!session || questionPosition < 1 || questionPosition > session.metadata.numQuestions) {
    throw HTTPError(400, 'Invalid question position for the session this player is in');
  }

  // Check if the session is not in LOBBY or END state
  if (session.state === States.LOBBY || session.state === States.END) {
    throw HTTPError(400, 'Session is in LOBBY or END state');
  }
  // Check if the session is currently on this question
  if (session.atQuestion !== questionPosition) {
    throw HTTPError(400, 'Session is not currently on this question');
  }

  // Get the current question information
  const currentQuestion = session.metadata.questions[questionPosition - 1];
  setData(data);
  // Build the response object
  const response = {
    questionId: currentQuestion.questionId,
    question: currentQuestion.question,
    duration: currentQuestion.duration,
    thumbnailUrl: currentQuestion.thumbnailUrl,
    points: currentQuestion.points,
    answers: currentQuestion.answers.map((answer) => ({
      answerId: answer.answerId,
      answer: answer.answer,
      colour: answer.colour,
    })),
  };

  return response;
}

export function playerStatus(playerId: number): playerStatusReturn | ErrorReturn {
  const data = getData();

  // Check if Player ID does not exists or not
  const tempSession = data.sessions.find((session) => session.players.find((player) => player.playerId === playerId));
  if (tempSession === undefined) {
    throw HTTPError(400, 'Player ID does not exist');
  }

  return {
    state: tempSession.state,
    numQuestions: tempSession.metadata.numQuestions,
    atQuestion: tempSession.atQuestion
  };
}

export function playerAnswerSubmission(playerId: number, questionPosition: number, answerIds: number[]) {
  const data = getData();

  // Find the session the player is in
  const session = data.sessions.find((session) => session.players.find((player) => player.playerId === playerId));

  // Check if the session exists
  if (!session) {
    throw HTTPError(400, 'Session does not exist');
  }

  // Check if the session is in the correct state for answering questions
  if (session.state !== States.QUESTION_OPEN) {
    throw HTTPError(400, 'Session is not in QUESTION_OPEN state');
  }

  // Check if the session is up to the specified question
  if (session.atQuestion < questionPosition) {
    throw HTTPError(400, 'Session is not yet up to this question');
  }

  if (session.atQuestion > questionPosition) {
    throw HTTPError(400, 'Session is past this question');
  }

  // Find the current question
  const currentQuestion = session.metadata.questions[questionPosition - 1];

  // Check if the provided answerId is valid for this question
  const validAnswerIds = currentQuestion.answers.map((answer) => answer.answerId);
  const invalidAnswerIds = answerIds.filter((answerId) => !validAnswerIds.includes(answerId));

  if (invalidAnswerIds.length > 0 || answerIds.length < 1) {
    throw HTTPError(400, 'Invalid answer IDs provided');
  }

  if (new Set(answerIds).size !== answerIds.length) {
    throw HTTPError(400, 'Duplicate answer IDs provided');
  }

  // Find the player and update the player's most recent answer for this question
  const player = session.players.find((p) => p.playerId === playerId);

  if (!player) {
    throw HTTPError(400, 'PlayerId does not exist');
  }

  answerIds.forEach((answerId) => {
    const previousAnswerIndex = player.correctQuestionsList.findIndex((entry) => entry === questionPosition);

    const selectedAnswer = currentQuestion.answers.find((answer) => answer.answerId === answerId);

    if (previousAnswerIndex !== -1) {
      player.score -= currentQuestion.points;
      player.correctQuestionsList.splice(previousAnswerIndex, 1);
    }

    if (selectedAnswer && selectedAnswer.correct) {
      player.score += currentQuestion.points;
      player.correctQuestionsList.push(questionPosition);
    }
  });

  setData(data);
  return {};
}

export function playerQuestionResult(playerId: number, questionPosition: number) {
  const data = getData();

  // Find the player corresponding to the given playerId
  const player = data.sessions
    .flatMap((session) => session.players)
    .find((player) => player.playerId === playerId);

  // Check if the player exists
  if (!player) {
    throw HTTPError(400, 'Player ID does not exist');
  }

  // Find the session the player is in
  const session = data.sessions.find((session) => session.players.includes(player));

  // Check if the session exists
  if (!session) {
    throw HTTPError(400, 'Session does not exist');
  }

  // Check if the question position is valid for the session
  if (!session.metadata.questions[questionPosition - 1] || questionPosition < 1 || questionPosition > session.metadata.numQuestions) {
    throw HTTPError(400, 'Invalid question position for the session this player is in');
  }

  // Check if the session is in the ANSWER_SHOW state
  if (session.state !== States.ANSWER_SHOW) {
    throw HTTPError(400, 'Session is not in ANSWER_SHOW state');
  }

  // Check if the session is up to the specified question
  if (session.atQuestion < questionPosition) {
    throw HTTPError(400, 'Session is not yet up to this question');
  }

  if (session.atQuestion > questionPosition) {
    throw HTTPError(400, 'Session is past this question');
  }

  // Find the current question
  const currentQuestion = session.metadata.questions[questionPosition - 1];

  // Calculate average answer time and percent correct for the question
  const playersForQuestion = session.players.filter((p) => p.correctQuestionsList.includes(questionPosition));
  const totalAnswerTime = playersForQuestion.reduce((sum, p) => sum + p.correctQuestionsList.indexOf(questionPosition), 0);
  const averageAnswerTime = totalAnswerTime / playersForQuestion.length;
  const percentCorrect = (playersForQuestion.length / session.players.length) * 100;

  setData(data);
  const result = {
    questionId: currentQuestion.questionId,
    playersCorrectList: playersForQuestion.map((p) => p.name),
    averageAnswerTime,
    percentCorrect,
  };

  return result;
}

/*
const User1 = adminAuthRegister('landonorris@gmail.com', 'validpassword12', 'Kyrie', 'Irving');
const Quiz1 = adminQuizCreate(User1.token, 'Test Quiz 1', 'This is a test');
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
adminQuizCreateQuestion(User1.token, Quiz1.quizId, Question1);
const Session1 = adminSessionStart(User1.token, Quiz1.quizId, 1);
const Player1 = playerJoin(Session1.sessionId, 'Shervin');
adminUpdateSessionState(User1.token, Quiz1.quizId, Session1.sessionId, 'NEXT_QUESTION');
adminUpdateSessionState(User1.token, Quiz1.quizId, Session1.sessionId, 'SKIP_COUNTDOWN');
console.log(playerAnswerSubmission(Player1.playerId, 1, [1,2]))
console.log(playerAnswerSubmission(Player1.playerId, 1, [2,3]))
console.log(playerAnswerSubmission(Player1.playerId, 1, [4]))
*/
