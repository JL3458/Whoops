import {getData, setData} from './dataStore.js';
import {adminAuthRegister} from './auth.js';

function adminQuizList(authUserId) {
    let data = getData();
    let userindex = data.users.find((user) => user.userId === authUserId);
    // Case 1 - authUserId is not a valid user.
    if (userindex === undefined || authUserId === 0) {
        return { error: 'Invalid Entry'};
    }

    // retrieves the name of the quiz and quizId from data.md
    let quizzes = data.quizzes.filter((quiz) => quiz.userId === authUserId);

    // returns the quiz information in the format 
    /* quizzes: {
        quizId: 
        name: 
    }*/
    return {
        quizzes: quizzes.map((quiz) => ({
            quizId: quiz.quizId,
            name: quiz.name,
        })),
    };
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
        timeLastEdited: Date.now()/1000,
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
    let data = getData();
    // Case 1 - AuthUserId is not a valid user
    let userIndex = data.users.find((user) => user.userId === authUserId);
    if (userIndex === undefined || authUserId === 0) {
        return { error: 'Invalid User' };
    }
    let quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
    // Case 2 - Quiz doesn't exist or is not owned
    if (quiz === undefined || quiz.userId !== authUserId) {
        return { error: 'Quiz not found or not owned by the user' };
    }
    // Returns quiz
    return {
        quizId: quiz.quizId,
        name: quiz.name,
        timeCreated: quiz.timeCreated,
        timeLastEdited: quiz.timeLastEdited,
        description: quiz.description
    }
}

function adminQuizNameUpdate(authUserId, quizId, name) {
    let data = getData();

    // Case 1 - AuthUserId is not a valid user
    const user = data.users.find((user) => user.userId === authUserId);
    if (!user || authUserId === 0) {
        return { error: 'AuthUserId is not a valid user' };
    }

    // Case 2 - QuizId does not refer to a valid quiz
    const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
    if (!quiz || quiz.quizId === 100) {
        return { error: 'quizId does not refer to a valid quiz' };
    }

    // Case 3 - QuizId does not refer to a quiz that this user owns
    if (quiz.userId !== authUserId) {
        return { error: 'quizId does not refer to a quiz that this user owns' };
    }

    // Case 4 - Name contains invalid characters. Valid characters are alphanumeric and spaces
    const validCharacter = /^[a-zA-Z0-9\s]*$/;
    if (!validCharacter.test(name)) {
        return { error: 'Name contains characters other than alphanumeric and spaces' };
    }

    // Case 5 - Name is either less than 3 characters long or more than 30 characters long
    if (name.length < 3 || name.length > 30) {
        return { error: 'Name should be between 3 and 30 characters' };
    }

    // Case 6 - Name is already used by the current logged in user for another quiz
    const otherQuizWithSameName = data.quizzes.find((q) => q.userId === authUserId && q.quizId !== quizId && q.name === name);
    if (otherQuizWithSameName) {
        return { error: 'Name is already used by another quiz made by the user' };
    }

    // Update the quiz name
    quiz.name = name;
    quiz.timeLastEdited = Date.now()/1000
    setData(data);
    

    return {};
}

function adminQuizDescriptionUpdate( authUserId, quizId, description ) {
    return {}
}

///////////////////////////////


export {adminQuizList, adminQuizCreate, adminQuizRemove, adminQuizInfo, adminQuizNameUpdate};


