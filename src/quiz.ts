import { getData, setData, question } from './dataStore';
import request from 'sync-request-curl';
import HTTPError from 'http-errors';
import { States } from './session';
/// //////////////////////// Functions Return Interface ///////////////////////////////////

interface ErrorReturn {
    error: string;
}

interface QuizListReturn {
    quizzes: [
      {
      quizId: number,
      name: string
    }
  ]
}

interface QuizCreateReturn {
    quizId: number,
}

interface QuizInfoReturn {
    quizId: number,
    name: string,
    timeCreated: number,
    timeLastEdited: number,
    description: string,
    questions: question[]
    duration: number,
    numQuestions: number,
    thumbnailUrl: string
}

interface QuizViewTrashReturn {
    quizzes: [
      {
      quizId: number,
      name: string
    }
  ]
}

/// //////////////////////// Helper Functions ///////////////////////////////////

export function checkValidToken(token: string): boolean {
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

function isValidImageFileType(fileType: string): boolean {
  return ['jpg', 'png'].includes(fileType.toLowerCase());
}

/// /////////////////////// Main Functions ///////////////////////////////////

export function adminQuizList(token: string): QuizListReturn | ErrorReturn {
  const data = getData();
  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    throw HTTPError(401, 'Token is empty or invalid (does not refer to valid logged in user session');
  }

  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // Retrieves the names of the quizzes and respective quizIds
  const quizDetails = data.quizzes.filter((quiz) => quiz.userId === tempToken.userId);

  // returns the quiz information in the format
  const quizArray = quizDetails.map((quiz) => ({
    quizId: quiz.quizId,
    name: quiz.name
  })) as QuizListReturn['quizzes'];
  return {
    quizzes: quizArray
  };
}

export function adminQuizCreate(token: string, name: string, description: string): QuizCreateReturn | ErrorReturn {
  const data = getData();

  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    throw HTTPError(401, 'Token is empty or invalid');
  }
  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // Checks if entered quiz name is invalid
  const validCharacter = /^[a-zA-Z0-9\s]*$/;
  if (validCharacter.test(name) === false) {
    throw HTTPError(400, 'Name contains characters other than alphanumeric and space');
  }

  // Checks whether name meets the length requirements
  if (name.length < 3 || name.length > 30) {
    throw HTTPError(400, 'Name should be between 3 and 30 characters');
  }

  // Checks whether name is already used by the current logged in user for another quiz
  const tempQuiz = data.quizzes.find((quiz) => quiz.name === name);
  if (tempQuiz !== undefined && tempQuiz.userId === tempToken.userId) {
    throw HTTPError(400, 'Quiz name same to the previous quiz made by the user');
  }

  // Checks whether description meets length requirements(< 100 characters)
  if (description.length > 100) {
    throw HTTPError(400, 'Description is more than 100 characters in length');
  }

  // Defines the new quiz which is to be added in format required.
  const quizIdGenerator = data.quizIdCounter + 10;

  // Keeping track of number of quizzes

  data.quizIdCounter++;

  const tempQuizStorage = {
    quizId: quizIdGenerator,
    name: name,
    description: description,
    timeCreated: Math.floor(Date.now() / 1000),
    timeLastEdited: Math.floor(Date.now() / 1000),
    userId: tempToken.userId,
    questions: [] as question[],
    thumbnailUrl: '',
  };

  data.quizzes.push(tempQuizStorage);
  setData(data);

  return {
    quizId: tempQuizStorage.quizId,
  };
}

export function adminQuizRemove(token: string, quizId: number): object | ErrorReturn {
  const data = getData();
  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    throw HTTPError(401, 'Token is empty or invalid');
  }
  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  const tempQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  // Checking if all sessions for this quiz are in END state
  const quizSessions = data.sessions.filter((session) => session.metadata.quizId === quizId);
  if (quizSessions.find((session) => session.state !== States.END) !== undefined) {
    throw HTTPError(400, 'All sessions for this quiz must be in END state');
  }

  // Checks if quizId refers to an invalid quiz
  if (tempQuiz === undefined) {
    throw HTTPError(400, 'quizId is not of a valid quiz');
  }

  // Checks if the quiz belongs to the current logged in user
  if (tempQuiz !== undefined && tempQuiz.userId !== tempToken.userId) {
    throw HTTPError(403, 'Valid token is provided, but user is not an owner of this quiz');
  }

  // Push Quiz in Trash in DataStore
  tempQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  data.trash.push(tempQuiz);

  // Removes the quiz from quizes list
  const quizIndex = data.quizzes.findIndex((quiz) => quiz.quizId === quizId);
  data.quizzes.splice(quizIndex, 1);

  setData(data);

  return {};
}

export function adminQuizInfo(token: string, quizId: number): QuizInfoReturn | ErrorReturn {
  const data = getData();

  if (checkValidToken(token)) {
    throw HTTPError(401, 'Token is empty or invalid');
  }
  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  const tempQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  // Checks if quizId refers to an invalid quiz
  if (tempQuiz === undefined) {
    throw HTTPError(403, 'Quiz does not exist');
  }

  // Checks if the quiz belongs to the current logged in user
  if (tempQuiz !== undefined && tempQuiz.userId !== tempToken.userId) {
    throw HTTPError(403, 'User does not own this quiz');
  }

  const totalQuestionDuration = tempQuiz.questions.reduce((sum, currQues) => sum + currQues.duration, 0);
  const numQuestions = tempQuiz.questions.length;

  // Returns quiz info
  return {
    quizId: tempQuiz.quizId,
    name: tempQuiz.name,
    timeCreated: tempQuiz.timeCreated,
    timeLastEdited: tempQuiz.timeLastEdited,
    description: tempQuiz.description,
    numQuestions: numQuestions,
    questions: tempQuiz.questions,
    duration: totalQuestionDuration,
    thumbnailUrl: tempQuiz.thumbnailUrl,
  };
}

export function adminQuizNameUpdate(token: string, quizId: number, name: string): ErrorReturn | object {
  const data = getData();

  if (checkValidToken(token)) {
    throw HTTPError(401, 'Token is empty or invalid');
  }

  // Converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));
  const tempQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  if (tempQuiz === undefined) {
    throw HTTPError(403, 'Quiz does not exist');
  }

  // Checks if the quiz belongs to the current logged-in user
  if (tempQuiz.userId !== tempToken.userId) {
    throw HTTPError(403, 'User does not own this quiz');
  }

  // Checks if name contains invalid characters. Valid characters are alphanumeric and spaces
  const validCharacter = /^[a-zA-Z0-9\s]*$/;
  if (!validCharacter.test(name)) {
    throw HTTPError(400, 'Name contains characters other than alphanumeric and space');
  }

  // Checks if name is either less than 3 characters long or more than 30 characters long (Invalid case)
  if (name.length < 3 || name.length > 30) {
    throw HTTPError(400, 'Name should be between 3 and 30 characters');
  }

  // Checks if the new name is the same as the old name (no need to proceed)
  if (tempQuiz.name === name) {
    throw HTTPError(400, 'Quiz name same to the previous quiz made by the user');
  }

  // Checks if name is already used by the current logged-in user for another quiz
  const otherQuizWithSameName = data.quizzes.find((q) => q.userId === tempToken.userId && q.quizId !== quizId && q.name === name);

  if (otherQuizWithSameName) {
    throw HTTPError(400, 'Quiz name same to the previous quiz made by the user');
  }

  // Update the quiz name
  tempQuiz.name = name;
  tempQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);
  return {};
}

export function adminQuizDescriptionUpdate(token: string, quizId: number, description: string): ErrorReturn | object {
  const data = getData();
  const Quiz1 = data.quizzes.find((quiz) => quiz.quizId === quizId);

  if (checkValidToken(token)) {
    throw HTTPError(401, 'Token is empty or invalid');
  }

  const Token1 = JSON.parse(decodeURIComponent(token));

  // Checks if quizId is invalid
  if (Quiz1 === undefined) {
    throw HTTPError(403, 'Quiz does not exist');
  }

  // Checks if the quiz belongs to the current logged in user
  if (Quiz1 !== undefined && Quiz1.userId !== Token1.userId) {
    throw HTTPError(403, 'User does not own this quiz');
  }

  // Checks whether description is more than 100 characters in length
  if (description.length > 100) {
    throw HTTPError(400, 'Description is more than 100 characters in length');
  }

  // Updates the quiz description
  if (Quiz1) {
    Quiz1.description = description;
    Quiz1.timeLastEdited = Math.floor(Date.now() / 1000);

    setData(data);
  }
  return {};
}

export function adminQuizTransfer(token: string, quizId: number, userEmail: string): object | ErrorReturn {
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

  // Checking if all sessions for this quiz are in END state
  const quizSessions = data.sessions.filter((session) => session.metadata.quizId === quizId);
  if (quizSessions.find((session) => session.state !== States.END) !== undefined) {
    throw HTTPError(400, 'All sessions for this quiz must be in END state');
  }

  // Check if userEmail is valid
  const tempTargertUser = data.users.find((user) => user.email === userEmail);
  if (tempTargertUser === undefined) {
    throw HTTPError(400, 'userEmail is not a real user');
  }

  // Check if userEmail is the current logged in user
  if (tempTargertUser !== undefined && tempTargertUser.userId === tempToken.userId) {
    throw HTTPError(400, 'userEmail is the current logged in user');
  }

  // Checks if the quiz belongs to the current logged in user
  if (tempQuiz !== undefined && tempQuiz.userId !== tempToken.userId) {
    throw HTTPError(403, 'Valid token is provided, but user is not an owner of this quiz');
  }

  // Check if Quiz ID refers to a quiz that has a name that is already used by the target user
  const targetUserQuizzes = data.quizzes.filter((quiz) => quiz.userId === tempTargertUser.userId);
  if (targetUserQuizzes.find((quiz) => quiz.name === tempQuiz.name) !== undefined) {
    throw HTTPError(400, 'The target user already has a quiz with the same name');
  }

  tempQuiz.userId = tempTargertUser.userId;
  setData(data);

  return {};
}

export function adminQuizViewTrash (token: string): QuizViewTrashReturn | ErrorReturn {
  const data = getData();
  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    throw HTTPError(401, 'Token is empty or invalid (does not refer to valid logged in user session)');
  }
  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  const quizDetails = data.trash.filter((quiz) => quiz.userId === tempToken.userId);

  // returns the quiz information in the correct format
  const quizArray = quizDetails.map((quiz) => ({
    quizId: quiz.quizId,
    name: quiz.name
  })) as QuizViewTrashReturn['quizzes'];
  return {
    quizzes: quizArray
  };
}

export function adminQuizRestore(token: string, quizId: number): object | ErrorReturn {
  const data = getData();
  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    throw HTTPError(401, 'Token is empty or invalid (does not refer to valid logged in user session)');
  }
  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // Checks if quizId refers to an invalid quiz
  const tempQuiz = data.trash.find((quiz) => quiz.quizId === quizId);

  if (tempQuiz === undefined) {
    throw HTTPError(400, 'QuizID refers to a quiz that is not currently in the trash');
  }

  // TODO: CHECK FOR All sessions for this quiz must be in END state (HTTPError 400)

  // Checks if the quiz belongs to the current logged in user
  if (tempQuiz !== undefined && tempQuiz.userId !== tempToken.userId) {
    throw HTTPError(403, 'Valid token is provided, but user is not an owner of this quiz');
  }

  // Checks if Quiz ID refers to a quiz that has a name that is already used by the target user
  const targetTrashQuizzes = data.quizzes.filter((quiz) => quiz.userId === tempToken.userId);
  if (targetTrashQuizzes.find((quiz) => quiz.name === tempQuiz.name) !== undefined) {
    throw HTTPError(400, 'Quiz name of the restored quiz is already used by another active quiz');
  }

  // find the position of the targetted quiz in the trash array.
  const tempQuizIndex = data.trash.findIndex((quiz) => quiz.quizId === quizId);

  // removes the targetted quiz from the trash array.
  data.trash.splice(tempQuizIndex, 1);

  // updates the timeLastEdited of the target quiz.
  tempQuiz.timeLastEdited = Math.floor(Date.now() / 1000);

  // adds the targetted quiz onto the end of the quiz array.
  data.quizzes.push(tempQuiz);

  setData(data);
  return {};
}

export function adminQuizTrashEmpty (token: string, quizIds: string): object | ErrorReturn {
  const data = getData();
  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    throw HTTPError(401, 'Token is empty or invalid (does not refer to valid logged in user session)');
  }
  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // converts the quizIds string into an array
  const quizIdArray = JSON.parse(quizIds);

  for (const quizId of quizIdArray) {
    const tempQuiz = data.trash.find((quiz) => quiz.quizId === quizId);

    // Checks if quizId refers to an invalid quiz
    if (tempQuiz === undefined) {
      throw HTTPError(400, 'QuizID refers to a quiz that is not currently in the trash');
    }

    // Checks if the quiz belongs to the current logged in user
    if (tempQuiz !== undefined && tempQuiz.userId !== tempToken.userId) {
      throw HTTPError(403, 'Valid token is provided, but user is not an owner of this quiz');
    }

    // Removes the quiz from quizzes list
    const quizIndex = data.trash.findIndex((quiz) => quiz.quizId === quizId);
    data.trash.splice(quizIndex, 1);

    setData(data);
  }
  return {};
}

export function adminQuizThumbnailUpdate(token: string, quizId: number, imgUrl: string) {
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

  // Check if the imgUrl when fetched does not return a valid file - PNG/JPG
  try {
    const response = request('GET', imgUrl);
    if (response.statusCode === 200) {
      const contentType = response.headers['content-type'];
      const fileExtension = contentType.split('/')[1];

      if (!isValidImageFileType(fileExtension)) {
        throw HTTPError(400, 'The imgUrl should be a JPG or PNG file');
      }
    } else {
      throw HTTPError(400, 'imgUrl, when fetched does not return a valid file');
    }
  } catch (error) {
    if (error.message.includes('The imgUrl should be a JPG or PNG file')) {
      throw HTTPError(400, 'The imgUrl should be a JPG or PNG file');
    } else {
      throw HTTPError(400, 'imgUrl, when fetched does not return a valid file');
    }
  }

  tempQuiz.thumbnailUrl = imgUrl;
  setData(data);
  return {};
}

// const User1 = adminAuthRegister('landonorris@gmail.com', 'validpassword12', 'Kyrie', 'Irving');
// const quiz1 = adminQuizCreate(User1.token, 'Test Quiz 1', 'This is a test');
// const newQuestion =
//         {
//           question: 'Sample Question 1',
//           duration: 5,
//           points: 4,
//           answers: [
//             {
//               answer: 'Prince Wales',
//               correct: true
//             },
//             {
//               answer: 'Prince Charles',
//               correct: true
//             },
//             {
//               answer: 'Prince Diana',
//               correct: true
//             }
//           ],
//           thumbnailUrl: 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'
//         };
// const question1 = adminQuizCreateQuestion(User1.token, quiz1.quizId, newQuestion)
// const Session1 = adminSessionStart(User1.token, quiz1.quizId, 3)
// console.log(adminQuizGetSession(User1.token, Session1.sessionId, quiz1.quizId))
// console.log(getData().sessions[0].metadata.questions)
// https://s29.q4cdn.com/175625835/files/doc_downloads/test.pdf
// console.log(adminQuizThumbnailUpdate(User1.token, quiz1.quizId, 'https://s29.q4cdn.com/175625835/files/doc_downloads/test.pdf'));
// console.log(adminQuizThumbnailUpdate(User1.token, quiz1.quizId, 'https://upload.wikimedia.org//commons/e/e0/Apollo_17_Image_Of_Earth_From_Space_%28cropped%29'));
// console.log(adminQuizInfo(User1.token, quiz1.quizId));
// console.log(adminQuizThumbnailUpdate(User1.token, quiz1.quizId, 'https://files.softicons.com/download/folder-icons/alumin-folders-icons-by-wil-nichols/png/512x512/Downloads%202.png'));
// console.log(adminQuizInfo(User1.token, quiz1.quizId));
