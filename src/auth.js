import {getData, setData} from './dataStore.js';
import validator from 'validator';

function adminAuthRegister( email, password, nameFirst, nameLast ) {
    let data = getData();

    // Checking if email is valid
    if (validator.isEmail(email) === false) {
        return {error: 'Invalid Entry'};
    }

    // Checking if email is in use by another user
    for (let i in data.users) {
        if (data.users[i].email === email) {
            return {error: 'Email Already in Use'};
        }
    }
    // Checking if first and last name meet the required conditions
    const pattern = /^[a-zA-Z\s\-']+$/;
    if (nameFirst.length < 2 || nameFirst.length > 20 || pattern.test(nameFirst) === false) {
        return {error: 'Invalid First Name'};
    }
    if (nameLast.length < 2 || nameLast.length > 20 || pattern.test(nameLast) === false) {
        return {error: 'Invalid Last Name'};
    }

    // Checking if password meets the required conditions
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
    };
}

function adminAuthLogin( email, password ) {
    let data = getData();
    let found = 0;
    let index = 0;
    // Checking if user with email exists
    for (let i in data.users) {
        if (data.users[i].email === email) {
            ++found;
            index = i;
        }
    }
    if (found === 0) {
        return {error: 'Email does not exist'};
    }

    // Checking whether password entered is incorrect
    if (data.users[index].password !== password) {
        data.users[index].numFailedPasswordsSinceLastLogin = data.users[index].numFailedPasswordsSinceLastLogin + 1;
        return {error: 'Incorrect Password'};
    }

    // Updating details about user
    data.users[index].numFailedPasswordsSinceLastLogin = 0;
    data.users[index].numSuccessfulLogins = data.users[index].numSuccessfulLogins + 1;
    
    return {
        authUserId: data.users[index].userId
    };
}

function adminUserDetails(authUserId) {
    let data = getData();
    const Id = authUserId;
    // Checking if authUserId refers to an invalid user
    let userindex = data.users.find(({ userId }) => userId === Id);
    if (userindex === undefined || Id === 0) {
        return {error: 'Invalid Entry'};
    }

    // Concatenating first and last name
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

export {adminAuthRegister, adminAuthLogin, adminUserDetails}; 
