import { getData, setData } from './dataStore';

export function clear() {
  let data = getData();
  // Original state of data
  data = {
    users: [],
    quizzes: [],
    tokens: [],
    trash: [],
    questions: [],
  };

  // Setting data dataStore to original state
  setData(data);

  return { };
}
