import {getData, setData} from './dataStore.js';

import validator from 'validator';

function adminAuthRegister( email, password, nameFirst, nameLast ) {
    let data = getData();
    if (validator.isEmail(email) === false) {
        return {error: 'Invalid Entry'};
    }
    for (let i in data.users) {
        if (data.users[i].email === email) {
            return {error: 'Email Already Exists'};
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

    data.users.push({userId: Id, email: email, password: password, nameFirst: nameFirst, nameLast: nameLast, numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 0});
    setData(data);

    return {
        authUserId: data.users[arrayindex].userId
    }
}

function adminAuthLogin( email, password ) {
    let data = getData();
    let found = 0;
    let index = 0;
    for (let i in data.users) {
        if (data.users[i].email === email) {
            ++found;
            index = i;
        }
    }
    if (found === 0) {
        return {error: 'Email does not exist'};
    }
    if (data.users[index].password !== password) {
        data.users[index].numFailedPasswordsSinceLastLogin = data.users[index].numFailedPasswordsSinceLastLogin + 1;
        return {error: 'Incorrect Password'};
    }
    data.users[index].numFailedPasswordsSinceLastLogin = 0;
    data.users[index].numSuccessfulLogins = data.users[index].numSuccessfulLogins + 1;
    
    return {
        authUserId: data.users[index].userId
    }
}

function adminUserDetails(authUserId) {
    let data = getData();
    const Id = authUserId;
    let userindex = data.users.find(({ userId }) => userId === Id);
    if (userindex === undefined || Id === 0) {
        return {error: 'Invalid Entry'};
    }

    let fullname = userindex.nameFirst + ' ' + userindex.nameLast;

    return {
        user: {
            userId: Id,
            name: fullname,
            email: userindex.email,
            numSuccessfulLogins: userindex.numSuccessfulLogins,
            numFailedPasswordsSinceLastLogin: userindex.numFailedPasswordsSinceLastLogin,
        } 
    };
};

export {adminAuthRegister} 
export {adminUserDetails}
export {adminAuthLogin}
