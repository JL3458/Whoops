import { getData, setData } from './dataStore';
import { intialiseCountdowns } from './session';

export function clear() {
  let data = getData();
  // Original state of data
  data = {
    users: [],
    quizzes: [],
    tokens: [],
    trash: [],
    quizIdCounter: 0,
    questionIdCounter: 0,
    playerIdCounter: 0,
    sessions: []
  };

  // Reset the current Timeouts
  intialiseCountdowns();

  // Setting data dataStore to original state
  setData(data);

  return { };
}
