import { setData } from './dataStore';

export function clear() {
  // Original state of data
  const data = {
    users: [],
    quizzes: []
  };

  // Setting data dataStore to original state
  setData(data);

  return { };
}


