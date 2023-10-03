import {getData, setData} from './dataStore.js';

function adminQuizList(authUserId) {
    let data = getData();
    const user = data.users.find((user) => user.userId === authUserId);
    if (!user) {
        return { error: 'Invalid User'};
    }
    const quizzes = data.quizzes.map(
        (quiz) => ({ quizId: quiz.quizId, name: quiz.name }));
    return { 
        quizzes
    };
}


function adminQuizCreate( authUserId, name, description ) {
    return {
        quizId: 2
    }
}

function adminQuizRemove(authUserId, quizId) {
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
    return {}
}

export {adminQuizList}