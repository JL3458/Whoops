import {getData, setData} from './dataStore.js';

import validator from 'validator';

function adminAuthRegister( email, password, nameFirst, nameLast ) {
    let data = getData();
    if (validator.isEmail(email) === false) {
        return {error: 'Invalid Entry'};
    }
    for (let i in data.users) {
        if (data.users[i].email === email) {
            return {error: 'Email not found'};
        }
    }
    const pattern = /^[a-zA-Z\s\-']+$/;
    if (nameFirst.length < 2 || nameFirst.length > 20 || pattern.test(nameFirst) === false) {
        return {error: 'Invalid First Name'};
    }
    if (nameLast.length < 2 || nameLast.length > 20 || pattern.test(nameLast) === false) {
        return {error: 'Invalid Last Name'};
    }
    const letters = /[a-zA-Z]/;
    const nums = /\d/;
    if (password.length < 8 || letters.test(password) === false || nums.test(password) === false) {
        return {error: 'Invalid Password'};
    }

    const arrayindex = data.users.length;
    const Id = data.users[arrayindex - 1].userId + 10;

    data.users.push({userId: Id, email: email, password: password, nameFirst: nameFirst, nameLast: nameLast, numSuccessfulLogins: 0, numFailedPasswordsSinceLastLogin: 0});
    setData(data);

    return {
        authUserId: data.users[arrayindex].userId
    }
}

function adminAuthLogin( email, password ) {
    return {
        authUserId: 1
    }
}

function adminUserDetails(authUserId) {
    return {
        user:
            {
              userId: 1,
              name: 'Hayden Smith',
              email: 'hayden.smith@unsw.edu.au',
              numSuccessfulLogins: 3,
              numFailedPasswordsSinceLastLogin: 1,
            }
    }
}

/*console.log(adminAuthRegister('validemail@gmail.com', 'password123', 'pedri', 'gonzalez'));
console.log(adminAuthRegister('validemail1@gmail.com', 'PASSword1', 'pedri', 'gonzalez'));
console.log(getData());*/

export {adminAuthRegister} 