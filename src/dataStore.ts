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

export interface player {
  playerId: number,
  name: string,
  score: number,
  correctQuestionsList: number[]
}

export interface session {
  sessionId: number,
  autoStartNum: number,
  state: string,
  atQuestion: number,
  players: player[],
  metadata: metadata
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

interface DataStore {
  users: user[]
  quizzes: quiz[]
  tokens: token[]
  trash: quiz[]
  sessions: session[]
  quizIdCounter: number
  playerIdCounter: number
  questionIdCounter: number
}

let data: DataStore = {
  users: [],
  quizzes: [],
  tokens: [],
  trash: [],
  quizIdCounter: 0,
  questionIdCounter: 0,
  playerIdCounter: 0,
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
