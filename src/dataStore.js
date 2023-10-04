// YOU SHOULD MODIFY THIS OBJECT BELOW
let data = {
  users: [
      {
          userId: 0,
          email: '',
          password: '',
          nameFirst: '',
          nameLast: '',
          numSuccessfulLogins: 0,
          numFailedPasswordsSinceLastLogin: 0,
      }
  ],

  quizzes: [
      {
          quizId: 100,
          name: '',
          description: '',
          timeCreated: 0,
          timeLastEdited: 0,
          userId: 0,
      }
  ],
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData) {
  data = newData;
}

export { getData, setData };
