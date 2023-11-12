import { getData, setData, States } from './dataStore';
import HTTPError from 'http-errors';

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
console.log(playerJoin(Session1.sessionId, 'Hayden'));
console.log(playerStatus(1));
console.log(getData());
*/
