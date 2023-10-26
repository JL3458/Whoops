import { getData, setData, question } from './dataStore';

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

function CheckValidUserId(authUserId: number): boolean {
  const data = getData();
  if (data.users.find((user) => user.userId === authUserId) === undefined) {
    return true;
  }
  return false;
}

function checkValidToken(token: string): boolean {
  const data = getData();

  // Checking if a token exists
  if (token === '') {
    return true;
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

/// //////////////////////// Main Functions ///////////////////////////////////

export function adminQuizList(token: string): QuizListReturn | ErrorReturn {
  const data = getData();
  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    return { error: 'Token is empty or invalid' };
  }

  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  const userToken = data.tokens.find((currentToken) => currentToken.sessionId === tempToken.sessionId);
  if (CheckValidUserId(userToken.userId)) {
    return { error: 'AuthUserId is not a valid user' };
  }
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

export function adminQuizCreate(token: string, name: string, description: string) : QuizCreateReturn | ErrorReturn {
  const data = getData();

  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    return { error: 'Token is empty or invalid' };
  }
  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // Checks if entered quiz name is invalid
  const validCharacter = /^[a-zA-Z0-9\s]*$/;
  if (validCharacter.test(name) === false) {
    return { error: 'Name contains characters other than alphanumeric and spaces' };
  }

  // Checks whether name meets the length requirements
  if (name.length < 3 || name.length > 30) {
    return { error: 'Name should be between 3 and 30 characters' };
  }

  // Checks whether name is already used by the current logged in user for another quiz
  const tempQuiz = data.quizzes.find((quiz) => quiz.name === name);
  if (tempQuiz !== undefined && tempQuiz.userId === tempToken.userId) {
    return { error: 'Quiz name same to the previous quiz made by the user' };
  }

  // Checks whether description meets length requirements(< 100 characters)
  if (description.length > 100) {
    return { error: 'Description is more than 100 characters in length' };
  }

  // Defines the new quiz which is to be added in format required.
  const quizIdGenerator = data.quizzes.length + 10;
  const tempQuizStorage = {
    quizId: quizIdGenerator,
    name: name,
    description: description,
    timeCreated: Math.floor(Date.now() / 1000),
    timeLastEdited: Math.floor(Date.now() / 1000),
    userId: tempToken.userId,
    questions: [] as question[]
  };

  data.quizzes.push(tempQuizStorage);
  setData(data);

  return {
    quizId: tempQuizStorage.quizId,
  };
}

export function adminQuizRemove(token: string, quizId: number) {
  const data = getData();
  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    return { error: 'Token is empty or invalid' };
  }
  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  const tempQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  // Checks if quizId refers to an invalid quiz
  if (tempQuiz === undefined) {
    return { error: 'quizId is not of a valid quiz' };
  }

  // Checks if the quiz belongs to the current logged in user
  if (tempQuiz !== undefined && tempQuiz.userId !== tempToken.userId) {
    return { error: 'Valid token is provided, but user is not an owner of this quiz' };
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

  if (token === '') {
    return { error: 'Token is empty or invalid' };
  }

  // Converts token string to token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // Checks if Token is empty or invalid
  if (!tempToken || data.tokens.find((currentToken) => currentToken.userId === tempToken.userId) === undefined) {
    return { error: 'Token is empty or invalid' };
  }

  const tempQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  // Checks if quizId refers to an invalid quiz
  if (tempQuiz === undefined) {
    return { error: 'quizId is not of a valid quiz' };
  }

  // Checks if the quiz belongs to the current logged in user
  if (tempQuiz !== undefined && tempQuiz.userId !== tempToken.userId) {
    return { error: 'Valid token is provided, but user is not an owner of this quiz' };
  }

  // Returns quiz info
  return {
    quizId: tempQuiz.quizId,
    name: tempQuiz.name,
    timeCreated: tempQuiz.timeCreated,
    timeLastEdited: tempQuiz.timeLastEdited,
    description: tempQuiz.description
  };
}

export function adminQuizNameUpdate(token: string, quizId: number, name: string): ErrorReturn | object {
  const data = getData();

  if (checkValidToken(token)) {
    return { error: 'Token is empty or invalid' };
  }

  // Converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));
  const tempQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  if (tempQuiz === undefined) {
    return { error: 'quizId is not of a valid quiz' };
  }

  // Checks if the quiz belongs to the current logged-in user
  if (tempQuiz.userId !== tempToken.userId) {
    return { error: 'Valid token is provided, but the user is not the owner of this quiz' };
  }

  // Checks if name contains invalid characters. Valid characters are alphanumeric and spaces
  const validCharacter = /^[a-zA-Z0-9\s]*$/;
  if (!validCharacter.test(name)) {
    return { error: 'Name contains characters other than alphanumeric and spaces' };
  }

  // Checks if name is either less than 3 characters long or more than 30 characters long (Invalid case)
  if (name.length < 3 || name.length > 30) {
    return { error: 'Name should be between 3 and 30 characters' };
  }

  // Checks if the new name is the same as the old name (no need to proceed)
  if (tempQuiz.name === name) {
    return {};
  }

  // Checks if name is already used by the current logged-in user for another quiz
  const otherQuizWithSameName = data.quizzes.find((q) => q.userId === tempToken.userId && q.quizId !== quizId && q.name === name);

  if (otherQuizWithSameName) {
    return { error: 'Name is already used by another quiz made by the user' };
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
    return { error: 'Token is empty or invalid' };
  }

  const Token1 = JSON.parse(decodeURIComponent(token));

  // Checks if quizId is invalid
  if (Quiz1 === undefined) {
    return { error: 'QuizId does not refer to a valid quizId' };
  }

  // Checks if the quiz belongs to the current logged in user
  if (Quiz1 !== undefined && Quiz1.userId !== Token1.userId) {
    return { error: 'Valid token is provided, but user is not an owner of this quiz' };
  }

  // Checks whether description is more than 100 characters in length
  if (description.length > 100) {
    return { error: 'Description is more than 100 characters in length' };
  }

  // Updates the quiz description
  if (Quiz1) {
    Quiz1.description = description;
    Quiz1.timeLastEdited = Math.floor(Date.now() / 1000);

    setData(data);
  }
  return {};
}

export function adminQuizTransfer(token: string, quizId: number, userEmail: string) {
  const data = getData();

  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    return { error: 'Token is empty or invalid' };
  }
  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // Checks if Token is empty or invalid
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

  // Check if userEmail is valid
  const tempTargertUser = data.users.find((user) => user.email === userEmail);
  if (tempTargertUser === undefined) {
    return { error: 'userEmail is not a real user' };
  }

  // Check if userEmail is the current logged in user
  if (tempTargertUser !== undefined && tempTargertUser.userId === tempToken.userId) {
    return { error: 'userEmail is the current logged in user' };
  }

  // Check if Quiz ID refers to a quiz that has a name that is already used by the target user
  const targetUserQuizzes = data.quizzes.filter((quiz) => quiz.userId === tempTargertUser.userId);
  if (targetUserQuizzes.find((quiz) => quiz.name === tempQuiz.name) !== undefined) {
    return { error: 'The target user already has a quiz with the same name' };
  }

  tempQuiz.userId = tempTargertUser.userId;
  setData(data);

  return {};
}

export function adminQuizViewTrash (token: string): QuizViewTrashReturn | ErrorReturn {
  const data = getData();
  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    return { error: 'Token is empty or invalid' };
  }
  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  const userToken = data.tokens.find((currentToken) => currentToken.sessionId === tempToken.sessionId);
  // if (CheckValidUserId(userToken.userId)) {
  //   return { error: 'AuthUserId is not a valid user' };
  // }
  // Retrieves the names of the quizzes and respective quizIds from the trash
  const quizDetails = data.trash.filter((quiz) => quiz.userId === userToken.userId);

  // returns the quiz information in the correct format
  const quizArray = quizDetails.map((quiz) => ({
    quizId: quiz.quizId,
    name: quiz.name
  })) as QuizViewTrashReturn['quizzes'];
  return {
    quizzes: quizArray
  };
}

export function adminQuizRestore(token: string, quizId: number) {
  const data = getData();
  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    return { error: 'Token is empty or invalid' };
  }
  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // Checks if quizId refers to an invalid quiz
  const tempQuiz = data.trash.find((quiz) => quiz.quizId === quizId);

  if (tempQuiz === undefined) {
    return { error: 'quizId is not of a valid quiz' };
  }

  // Checks if the quiz belongs to the current logged in user
  if (tempQuiz !== undefined && tempQuiz.userId !== tempToken.userId) {
    return { error: 'Valid token is provided, but user is not an owner of this quiz' };
  }

  // Checks if Quiz ID refers to a quiz that has a name that is already used by the target user
  const targetTrashQuizzes = data.quizzes.filter((quiz) => quiz.userId === tempToken.userId);
  if (targetTrashQuizzes.find((quiz) => quiz.name === tempQuiz.name) !== undefined) {
    return { error: 'The target user already has a quiz with the same name' };
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

export function adminQuizTrashEmpty (token: string, quizIds: string) {
  const data = getData();
  // Calling helper function which tests for valid token
  if (checkValidToken(token)) {
    return { error: 'Token is empty or invalid' };
  }
  // converts the token string into the token object
  const tempToken = JSON.parse(decodeURIComponent(token));

  // converts the quizIds string into an array
  const quizIdArray: number[] = quizIds.split(',').map(Number);

  for (const quizId of quizIdArray) {
    const tempQuiz = data.trash.find((quiz) => quiz.quizId === quizId);

    // Checks if quizId refers to an invalid quiz
    if (tempQuiz === undefined) {
      return { error: 'One or more of the quizIds is not of a valid quiz' };
    }

    // Checks if the quiz belongs to the current logged in user
    if (tempQuiz !== undefined && tempQuiz.userId !== tempToken.userId) {
      return { error: 'Valid token is provided, but user is not an owner of this quiz' };
    }

    // Removes the quiz from quizzes list
    const quizIndex = data.trash.findIndex((quiz) => quiz.quizId === quizId);
    data.trash.splice(quizIndex, 1);

    setData(data);
  }
  return {};
}
