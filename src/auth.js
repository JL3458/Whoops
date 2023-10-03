import {getData, setData} from './dataStore.js';

import validator from 'validator';

function adminAuthRegister( email, password, nameFirst, nameLast ) {
    return {
        authUserId: 1
    }
}

function adminAuthLogin( email, password ) {
    return {
        authUserId: 1
    }
}

function adminUserDetails(authUserId) {
    let data = getData();
    const user = data.users.find((user) => user.userId === authUserId);
    if (!user) {
        return { error: 'Invalid User'};
    }
    return {
        user 
    };
     // user:
        //     {
        //       userId: 1,
        //       name: 'Hayden Smith',
        //       email: 'hayden.smith@unsw.edu.au',
        //       numSuccessfulLogins: 3,
        //       numFailedPasswordsSinceLastLogin: 1,
        //     }
};

export {adminUserDetails}