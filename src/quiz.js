import {getData, setData} from './dataStore.js';

function adminQuizList(authUserId) {
    let data = getData();

    let userindex = data.users.find((user) => user.userId === authUserId);
    // Checks if authUserId refers to an invalid user
    if (userindex === undefined || authUserId === 0) {
        return { error: 'Invalid Entry'};
    }

    // Retrieves the names of the quizzes and respective quizIds
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

    // Checks if authUserId refers to an invalid user
    if (data.users.find((user) => user.userId === authUserId) === undefined || authUserId === 0) {
        return {error: 'AuthUserId is not a valid user'};
    }  

    // Checks if entered quiz name is invalid
    const validCharacter = /^[a-zA-Z0-9\s]*$/;
    if (validCharacter.test(name) === false) {
        return {error: 'Name contains characters other than alphanumeric and spaces'};
    }

    // Checks whether name meets the length requirements 
    if (name.length < 3 || name.length > 30) {
        return {error: 'Name should be between 3 and 30 characters'};
    }

    // Checks whether name is already used by the current logged in user for another quiz
    const tempQuiz = data.quizzes.find((quiz) => quiz.name === name);
    if (tempQuiz !== undefined && tempQuiz.userId === authUserId) {
        return {error: 'Quiz name same to the previous quiz made by the user'};
    }

    // Checks whether description meets length requirements(< 100 characters) 
    if (description.length > 100) {
        return {error: 'Description is more than 100 characters in length'};
    }

    // Defines the new quiz which is to be added in format required.
    let quizIdGenerator = data.quizzes[data.quizzes.length - 1].quizId + 10;
    const tempQuizStorage = {
        quizId: quizIdGenerator,
        name: name,
        description: description,
        timeCreated: Math.floor(Date.now()/1000),
        timeLastEdited: Math.floor(Date.now()/1000),
        userId: authUserId
    };

    data.quizzes.push(tempQuizStorage);
    setData(data);
    
    return {
        quizId: tempQuizStorage.quizId,
    };
}

function adminQuizRemove(authUserId, quizId) {
    let data = getData();

    // Checks if authUserId refers to an invalid user
    if (data.users.find((user) => user.userId === authUserId) === undefined || authUserId === 0) {
        return {error: 'AuthUserId is not a valid user'};
    } 

    let tempQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

    // Checks if quizId refers to an invalid quiz
    if (tempQuiz === undefined || tempQuiz.quizId === 100) {
        return {error: 'quizId is not of a valid quiz'};
    } 

    // Checks if the quiz belongs to the current logged in user
    if (tempQuiz !== undefined && tempQuiz.userId !== authUserId) {
        return {error: 'quizId does not refer to a quiz that this user owns'};
    } 

    // Removes the quiz from data
    let quizIndex = data.quizzes.findIndex((quiz) => quiz.quizId == quizId);
    data.quizzes.splice(quizIndex, 1);

    setData(data);
   
    return {};
}

function adminQuizInfo(authUserId,quizId) {
    let data = getData();

    // Checks if authUserId refers to an invalid user
    let userIndex = data.users.find((user) => user.userId === authUserId);
    if (userIndex === undefined || authUserId === 0) {
        return { error: 'Invalid User' };
    }

    let quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
    // Checks whether quizId refers to a valid quiz and refers to a quiz that the current user owns
    if (quiz === undefined || quiz.userId !== authUserId) {
        return { error: 'Quiz not found or not owned by the user' };
    }

    // Returns quiz info
    return {
        quizId: quiz.quizId,
        name: quiz.name,
        timeCreated: quiz.timeCreated,
        timeLastEdited: quiz.timeLastEdited,
        description: quiz.description
    };
}

function adminQuizNameUpdate(authUserId, quizId, name) {
    let data = getData();

    // Checks if authUserId refers to an invalid user
    const user = data.users.find((user) => user.userId === authUserId);
    if (!user || authUserId === 0) {
        return { error: 'AuthUserId is not a valid user' };
    }

    // Checks if quizId refers to an invalid quiz
    const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
    if (!quiz || quiz.quizId === 100) {
        return { error: 'quizId does not refer to a valid quiz' };
    }

    // Checks whether quizId does not refer to a quiz that this user owns
    if (quiz.userId !== authUserId) {
        return { error: 'quizId does not refer to a quiz that this user owns' };
    }

    // Checks if name contains invalid characters. Valid characters are alphanumeric and spaces
    const validCharacter = /^[a-zA-Z0-9\s]*$/;
    if (!validCharacter.test(name)) {
        return { error: 'Name contains characters other than alphanumeric and spaces' };
    }

    // Checks if name is either less than 3 characters long or more than 30 characters long (Invalid case)
    if (name.length < 3 || name.length > 30) {
        return { error: 'Name should be between 3 and 30 characters' };
    }

    // Checks if name is already used by the current logged in user for another quiz
    const otherQuizWithSameName = data.quizzes.find((q) => q.userId === authUserId && q.quizId !== quizId && q.name === name);
    if (otherQuizWithSameName) {
        return { error: 'Name is already used by another quiz made by the user' };
    }

    // Updates the quiz name
    quiz.name = name;
    quiz.timeLastEdited = Math.floor(Date.now()/1000);
    setData(data);
    

    return {};
}

function adminQuizDescriptionUpdate( authUserId, quizId, description ) {
    let data = getData();

    // Checks if authUserId refers to an invalid user
    if (data.users.find(item => item.userId === authUserId) === undefined || authUserId === 0) {
        return { error: "authUserId does not exist" };
    }

    // Checks if quizId refers to an invalid quiz
    if (data.quizzes.find(item => item.quizId === quizId) === undefined || quizId === 100) {
        return { error: "quizId does not exist" };
    }

    // Checks if description si more than 100 characters in length (Invalid case)
    if ((/^.{101,}$/.test(description))) {
        return { error: "description is not valid"};
    }

    // Checks whether quizId does not refer to a quiz that this user owns
    const quizToUpdate = data.quizzes.find(item => item.quizId === quizId);
    if (quizToUpdate !== undefined && quizToUpdate.userId !== authUserId) {
        return {error: 'quizId does not refer to a quiz that this user owns'};
    } 

    // Updates the quiz description
    if (quizToUpdate) {
        quizToUpdate.description = description;
        quizToUpdate.timeLastEdited = Math.floor(Date.now()/1000)
    }
    return {};
}

export {adminQuizList, adminQuizCreate, adminQuizRemove, adminQuizInfo, adminQuizNameUpdate, adminQuizDescriptionUpdate};



