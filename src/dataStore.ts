export interface user {
  userId: number,
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
  numSuccessfulLogins: number,
  numFailedPasswordsSinceLastLogin: number
}

export interface quiz {
  quizId: number,
  name: string,
  description: string,
  timeCreated: number,
  timeLastEdited: number,
  userId: number
}

export interface token {
  userId: number,
  sessionId: string
}

interface DataStore {
  users: user[]
  quizzes: quiz[]
  tokens: token[]
  trash: quiz[]
}

let data: DataStore = {
  users: [],
  quizzes: [],
  tokens: [],
  trash: []
};

// Use get() to access the data
export function getData(): DataStore {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
export function setData(newData: DataStore) {
  data = newData;
}
