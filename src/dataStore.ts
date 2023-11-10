export interface user {
  userId: number,
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
  numSuccessfulLogins: number,
  numFailedPasswordsSinceLastLogin: number,
  oldPasswords: string[]
}

export interface answer {
  answerId: number,
  answer: string,
  correct: boolean,
  colour: string
}

export interface question {
  questionId: number,
  question: string,
  duration: number,
  points: number,
  answers: answer[],
  thumbnailUrl: string
}

export interface quiz {
  quizId: number,
  name: string,
  description: string,
  timeCreated: number,
  timeLastEdited: number,
  userId: number,
  questions: question[],
  thumbnailUrl: string
}

export interface token {
  userId: number,
  sessionId: string
}

export interface metadata {
  quizId: number,
  name: string,
  description: string,
  timeCreated: number,
  timeLastEdited: number,
  numQuestions: number,
  questions: question[],
  duration: number,
  thumbnailUrl: string
}

export interface session {
  sessionId: number,
  autoStartNum: number,
  state: string,
  atQuestion: number,
  players: string[],
  metadata: metadata
}

interface DataStore {
  users: user[]
  quizzes: quiz[]
  tokens: token[]
  trash: quiz[]
  sessions: session[]
  quizIdCounter: number
  questionIdCounter: number
}

let data: DataStore = {
  users: [],
  quizzes: [],
  tokens: [],
  trash: [],
  quizIdCounter: 0,
  questionIdCounter: 0,
  sessions: [],
};

// Use get() to access the data
export function getData(): DataStore {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
export function setData(newData: DataStore) {
  data = newData;
}
