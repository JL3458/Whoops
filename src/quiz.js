import {getData, setData} from './dataStore.js';
import {adminAuthRegister} from './auth.js';
import { clear } from './other.js';

function adminQuizList(authUserId) {
    return { 
        quizzes: [
            {
            quizId: 1,
            name: 'My Quiz',
            }
        ]
    }
}

function adminQuizCreate(authUserId, name, description) {
    
    let data = getData();

    // Case 1 - AuthUserId is not a valid user
    if (data.users.find((user) => user.userId === authUserId) === undefined || authUserId === 0)
    {
        return {error: 'AuthUserId is not a valid user'};
    }  

    // Case 2 - Valid characters in name
    const validCharacter = /^[a-zA-Z0-9\s]*$/;
    if (validCharacter.test(name) === false)
    {
        return {error: 'Name contains characters other than alphanumeric and spaces'};
    }

    // Case 3 - Name Length 
    if (name.length < 3 || name.length > 30)
    {
        return {error: 'Name should be between 3 and 30 characters'};
    }

    // Case 4 - Name is already used by the current logged in user for another quiz
    const tempQuiz = data.quizzes.find((quiz) => quiz.name === name);
    if (tempQuiz !== undefined && tempQuiz.userId === authUserId)
    {
        return {error: 'Quiz name same to the previous quiz made by the user'};
    }

    // Case 5 - Description bounds case 
    if (description.length > 100)
    {
        return {error: 'Description is more than 100 characters in length'};
    }

    let quizIdGenerator = data.quizzes[data.quizzes.length - 1].quizId + 10;
    const tempQuizStorage = {
        quizId: quizIdGenerator,
        name: name,
        description: description,
        timeCreated: Date.now()/1000,
        timeLastEdited: 0,
        userId: authUserId
    };

    data.quizzes.push(tempQuizStorage);
    setData(data);
    
    return {
        quizId: tempQuizStorage.quizId,
    }
}

function adminQuizRemove(authUserId, quizId) {
   
    let data = getData();

    // Case 1 - AuthUserId is not a valid user
    if (data.users.find((user) => user.userId === authUserId) === undefined || authUserId === 0)
    {
        return {error: 'AuthUserId is not a valid user'};
    } 

    let tempQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

    // Case 2 - QuizId does not refer to valid quiz
    if (tempQuiz === undefined || tempQuiz.quizId === 100)
    {
        return {error: 'quizId is not of a valid quiz'};
    } 

    // Case 2 - QuizId belongs to the current logged in user
    if (tempQuiz !== undefined && tempQuiz.userId !== authUserId)
    {
        return {error: 'quizId does not refer to a quiz that this user owns'};
    } 

    // Remove a quiz from data
    let quizIndex = data.quizzes.findIndex((quiz) => quiz.quizId == quizId);
    data.quizzes.splice(quizIndex, 1);

    setData(data);
   
    return {
    }
}

function adminQuizInfo(authUserId,quizId) {
    return {
        quizId: 1,
        name: 'My Quiz',
        timeCreated: 1683125870,
        timeLastEdited: 1683125871,
        description: 'This is my quiz',
          
    }
}

function adminQuizNameUpdate(authUserId, quizId, name) {
    return {}
}

function adminQuizDescriptionUpdate( authUserId, quizId, description ) {
    let data = getData();
    if (data.users.find(item => item.userId === authUserId) === undefined || authUserId === 0) {
        return { error: "authUserId does not exist" };
    }
    if (data.quizzes.find(item => item.quizId === quizId) === undefined || quizId === 100) {
        return { error: "quizId does not exist" };
    }
    if ((/^.{101,}$/.test(description))) {
        return { error: "description is not valid"};
    }
    const quizToUpdate = data.quizzes.find(item => item.quizId === quizId);

    if (quizToUpdate !== undefined && quizToUpdate.userId !== authUserId)
    {
        return {error: 'quizId does not refer to a quiz that this user owns'};
    } 

    if (quizToUpdate) {
        quizToUpdate.description = description;
        quizToUpdate.timeLastEdited = Date.now()/1000;
    }
    return { };
}
///////////////////////////////

export {adminQuizCreate, adminQuizRemove, adminQuizDescriptionUpdate};
/*let data = getData()
clear();
console.log(adminAuthRegister('tomcruise@gmail.com','eight12345','Firstname', 'Lastname'));
console.log(adminAuthRegister('becks@gmail.com','eight12345','name', 'name'));
console.log(adminQuizCreate(10, 'Tom', 'aaa'));
console.log(data);
console.log(adminQuizDescriptionUpdate(10,110, ''))
*/

let data = getData();
console.log(data);
console.log(adminAuthRegister('tomcruise@gmail.com','eight12345','Firstname', 'Lastname'));
console.log(adminQuizCreate(10, 'Tom', 'aaa'))
console.log(data)
console.log(adminQuizDescriptionUpdate(10,110,''));
console.log(data);
