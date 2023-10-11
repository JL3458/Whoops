import {setData} from './dataStore.js'

function clear() {
    // Original state of data
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
                userId: 0
            }
        ],
    };

    // Setting data dataStore to original state
    setData(data);

    return { };
}

export {clear};