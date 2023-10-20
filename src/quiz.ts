import { getData, setData } from './dataStore.ts';

interface ErrorReturn {
    error: string;
}

interface QuizListReturn {
    quizzes: {
        quizId: number,
        name: string
    }
}

interface QuizCreateReturn {
    quizId: number,
}

interface QuizInfoReturn {
    quizId: number,
    name: number,
    timeCreated: number,
    timeLastEdited: number,
    description: number,
}

// Helper Functions

function CheckValidUserId(authUserId: number): boolean {
  const data = getData();
  if (data.users.find((user) => user.userId === authUserId) === undefined) {
    return true;
  }
  return false;
}

export function adminQuizList(authUserId: number): QuizListReturn | ErrorReturn {
  const data = getData();

  // Checks if authUserId refers to an invalid user
  if (CheckValidUserId(authUserId)) {
    return { error: 'AuthUserId is not a valid user' };
  }

  // Retrieves the names of the quizzes and respective quizIds
  const quizzes = data.quizzes.filter((quiz) => quiz.userId === authUserId);

  // returns the quiz information in the format
  /* quizzes: {
        quizId:
        name:
    } */
  return {
    quizzes: quizzes.map((quiz) => ({
      quizId: quiz.quizId,
      name: quiz.name,
    })),
  };
}

export function adminQuizCreate(authUserId: number, name: string, description: string): QuizCreateReturn | ErrorReturn {
  const data = getData();

  // Checks if authUserId refers to an invalid user
  if (CheckValidUserId(authUserId)) {
    return { error: 'AuthUserId is not a valid user' };
  }

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
  if (tempQuiz !== undefined && tempQuiz.userId === authUserId) {
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
    userId: authUserId
  };

  data.quizzes.push(tempQuizStorage);
  setData(data);

  return {
    quizId: tempQuizStorage.quizId,
  };
}

export function adminQuizRemove(authUserId: number, quizId: number): ErrorReturn | null {
  const data = getData();

  // Checks if authUserId refers to an invalid user
  if (CheckValidUserId(authUserId)) {
    return { error: 'AuthUserId is not a valid user' };
  }

  const tempQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  // Checks if quizId refers to an invalid quiz
  if (tempQuiz === undefined) {
    return { error: 'quizId is not of a valid quiz' };
  }

  // Checks if the quiz belongs to the current logged in user
  if (tempQuiz !== undefined && tempQuiz.userId !== authUserId) {
    return { error: 'quizId does not refer to a quiz that this user owns' };
  }

  // Removes the quiz from data
  const quizIndex = data.quizzes.findIndex((quiz) => quiz.quizId === quizId);
  data.quizzes.splice(quizIndex, 1);

  setData(data);

  return {};
}

export function adminQuizInfo(authUserId: number, quizId: number): QuizInfoReturn | ErrorReturn {
  const data = getData();

  // Checks if authUserId refers to an invalid user
  if (CheckValidUserId(authUserId)) {
    return { error: 'Invalid User' };
  }

  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  // Checks whether quizId refers to a valid quiz and refers to a quiz that the current user owns
  if (quiz === undefined || quiz.userId !== authUserId) {
    return { error: 'Quiz not found or not owned by the user' };
  }

  // Returns quiz info
  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description
  };
}

export function adminQuizNameUpdate(authUserId: number, quizId: number, name: string): ErrorReturn | null {
  const data = getData();

  // Checks if authUserId refers to an invalid user
  if (CheckValidUserId(authUserId)) {
    return { error: 'AuthUserId is not a valid user' };
  }

  // Checks if quizId refers to an invalid quiz
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  if (!quiz) {
    return { error: 'quizId does not refer to a valid quiz' };
  }

  // Checks whether quizId does not refer to a quiz that this user owns
  if (quiz.userId !== authUserId) {
    return { error: 'quizId does not refer to a quiz that this user owns' };
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

  // Checks if name is already used by the current logged in user for another quiz
  const otherQuizWithSameName = data.quizzes.find((q) => q.userId === authUserId && q.quizId !== quizId && q.name === name);
  if (otherQuizWithSameName) {
    return { error: 'Name is already used by another quiz made by the user' };
  }

  // Updates the quiz name
  quiz.name = name;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);

  return {};
}

export function adminQuizDescriptionUpdate(authUserId: number, quizId: number, description: string): ErrorReturn | null {
  const data = getData();

  // Checks if authUserId refers to an invalid user
  if (CheckValidUserId(authUserId)) {
    return { error: 'authUserId does not exist' };
  }

  // Checks if quizId refers to an invalid quiz
  if (data.quizzes.find(item => item.quizId === quizId) === undefined) {
    return { error: 'quizId does not exist' };
  }

  // Checks if description si more than 100 characters in length (Invalid case)
  if ((/^.{101,}$/.test(description))) {
    return { error: 'description is not valid' };
  }

  // Checks whether quizId does not refer to a quiz that this user owns
  const quizToUpdate = data.quizzes.find(item => item.quizId === quizId);
  if (quizToUpdate !== undefined && quizToUpdate.userId !== authUserId) {
    return { error: 'quizId does not refer to a quiz that this user owns' };
  }

  // Updates the quiz description
  if (quizToUpdate) {
    quizToUpdate.description = description;
    quizToUpdate.timeLastEdited = Math.floor(Date.now() / 1000);
  }
  return {};
}
