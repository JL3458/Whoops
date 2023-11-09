// // New .ts file to implement tests for quiz.ts functions through the server

// import request from 'sync-request-curl';
// import { port, url } from './config.json';
// import { clearRequest } from './other.test';
// import { authRegisterRequest, authLoginRequest, authLogoutRequest } from './auth.test';
// const SERVER_URL = `${url}:${port}`;
// const ERROR = { error: expect.any(String) };

// /// /////////////////// Helper Functions //////////////////////

// export function adminQuizListRequest(token: string) {
//   const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token } });
//   return JSON.parse(res.body.toString());
// }

// export function adminQuizDescriptionUpdateRequest(token: string, quizid: number, description: string) {
//   const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizid}/description`, { json: { token, description } });
//   return JSON.parse(res.body as string);
// }

// export function adminQuizCreateRequest(token: string, name: string, description: string) {
//   const request1 = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token, name: name, description: description } });
//   return JSON.parse(request1.body as string);
// }

// export function adminQuizRemoveRequest(token: string, quizid: number) {
//   const request1 = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizid}`, { qs: { token: token } });
//   return JSON.parse(request1.body as string);
// }

// export function adminQuizNameUpdateRequest(token: string, quizid: number, name: string) {
//   const request1 = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizid}/name`, { json: { token, name } });
//   return JSON.parse(request1.body as string);
// }

// export function adminQuizInfoRequest(token: string, quizid: number) {
//   const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quizid}`, { qs: { token } });
//   return JSON.parse(res.body.toString());
// }

// export function adminQuizTransferRequest(token: string, quizid: number, userEmail: string) {
//   const request1 = request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/transfer`, { json: { token: token, userEmail: userEmail } });
//   return JSON.parse(request1.body as string);
// }

// export function adminQuizViewTrashRequest(token: string) {
//   const res = request('GET', SERVER_URL + '/v1/admin/quiz/trash', { qs: { token } });
//   return JSON.parse(res.body.toString());
// }

// export function adminQuizRestoreRequest (token: string, quizid: number) {
//   const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/restore`, { json: { token, quizid } });
//   return JSON.parse(res.body as string);
// }
// export function adminQuizTrashEmptyRequest(token: string, quizIds: string) {
//   const res = request('DELETE', SERVER_URL + '/v1/admin/quiz/trash/empty', { qs: { token, quizIds } });
//   return JSON.parse(res.body.toString());
// }

// /// ////////////////////// Main Tests /////////////////////////////

// describe('Tests for adminQuizList', () => {
//   beforeEach(() => {
//     clearRequest();
//   });

//   test('Invalid token', () => {
//     expect(adminQuizListRequest('234097634')).toEqual(ERROR);
//     expect(adminQuizListRequest('1248734')).toEqual(ERROR);
//     expect(adminQuizListRequest('24763')).toEqual(ERROR);
//     expect(adminQuizListRequest('5487')).toEqual(ERROR);
//   });

//   test('Valid Test quizList with 1 quiz', () => {
//     const newUser1 = authRegisterRequest('Validemail1@gmail.com', 'password123', 'Jonathan', 'Leung');
//     expect(adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Sample Quiz Testing')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizListRequest(newUser1.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 1' }] });
//     const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password1234', 'Random', 'Person');
//     expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Testing')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizListRequest(newUser2.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 2' }] });
//   });

//   test('Valid Test quizList with multiple quizzes', () => {
//     const newUser1 = authRegisterRequest('Validemail1@gmail.com', 'password123', 'Jonathan', 'Leung');
//     expect(adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Sample Quiz Testing')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizCreateRequest(newUser1.token, 'Test Quiz 2', 'Testing')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizListRequest(newUser1.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 1' }, { quizId: expect.any(Number), name: 'Test Quiz 2' }] });
//     const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password1234', 'Random', 'Person');
//     expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 1', 'Sample Quiz Testing')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Testing')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 3', 'Testing?')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 4', 'Testing!')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizListRequest(newUser2.token)).toEqual({
//       quizzes:
//             [{ quizId: expect.any(Number), name: 'Test Quiz 1' },
//               { quizId: expect.any(Number), name: 'Test Quiz 2' },
//               { quizId: expect.any(Number), name: 'Test Quiz 3' },
//               { quizId: expect.any(Number), name: 'Test Quiz 4' }
//             ]
//     });
//   });
// });

// describe('Tests of adminQuizCreate', () => {
//   beforeEach(() => {
//     clearRequest();
//   });

//   test('Token is Empty', () => {
//     expect(adminQuizCreateRequest('', 'Test Quiz 1', 'This is a sample test')).toEqual(ERROR);
//   });

//   test('Normal Case correct output value', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Sample Quiz Testing')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizCreateRequest(newUser.token, '              ', '')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizCreateRequest(newUser.token, 'Sam', 'The @3xpl0r3rs J0urn3y')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizCreateRequest(newUser.token, 'Supercalifragilisticexpialidoc', 'Sample Quiz Testing')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'Exploring the cosmos, seeking answers, and embracing the unknown.')).toEqual({ quizId: expect.any(Number) });
//   });

//   test('Invalid Quiz Names', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     expect(adminQuizCreateRequest(newUser.token, '@test12345', 'Sample Quiz Testing')).toEqual(ERROR);
//     expect(adminQuizCreateRequest(newUser.token, '', 'Sample Quiz Testing')).toEqual(ERROR);
//     expect(adminQuizCreateRequest(newUser.token, 'Alexander Bartholomew Fitzwilliam Throckmorton Montgomery III', 'Sample Quiz Testing')).toEqual(ERROR);
//     expect(adminQuizCreateRequest(newUser.token, '!!!@@@@##########$$$$$$$$$$$$$**********&&&&&&&&&&&&^^^^^^^^^^', 'Sample Quiz Testing')).toEqual(ERROR);
//     expect(adminQuizCreateRequest(newUser.token, '!!!', 'Sample Quiz Testing')).toEqual(ERROR);
//     expect(adminQuizCreateRequest(newUser.token, 'J@n3 Sm!th', 'Sample Quiz Testing')).toEqual(ERROR);
//     expect(adminQuizCreateRequest(newUser.token, '                                    ', 'Sample Quiz Testing')).toEqual(ERROR);
//   });

//   test('Invalid Description Names', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     expect(adminQuizCreateRequest(newUser.token, 'Divakar Quiz 1', 'This Quiz is on the magnificent cosmos, seeking answers, and discovering wonders. Fantastic!fdvsvsfbrgberbertrtb')).toEqual(ERROR);
//   });

//   test('Quiz name already exists', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Sample Quiz Testing');
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Surely, this test doesnt exist anymore???')).toEqual(ERROR);
//   });

//   test('User makes two quizes', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Sample Quiz Testing');
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'Surely, this test works')).toEqual({ quizId: expect.any(Number) });
//   });

//   test('Testing with clearRequest', () => {
//     let newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Surely, this test works')).toEqual({ quizId: expect.any(Number) });
//     expect(clearRequest()).toEqual({});

//     // Still able to create quiz with same name and user since previous quiz is cleared
//     newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Surely, this test works')).toEqual({ quizId: expect.any(Number) });
//   });

//   test('Quiz name already exists, but a new user is entering it', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Sample Quiz Testing');
//     const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password123', 'Ansh', 'Nimbalkar');
//     expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 1', 'This Test should be working')).toEqual({ quizId: expect.any(Number) });
//   });

//   test('Making Multiple Quizzes with one user', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Made by Divakar')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'Made by Divakar')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'Made by Divakar')).toEqual({ quizId: expect.any(Number) });

//     // We get an expected error as the quizzes are already created
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'Made by Divakar')).toEqual(ERROR);
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'Made by Divakar')).toEqual(ERROR);
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'Made by Divakar')).toEqual(ERROR);
//   });

//   test('Making Multiple Quizzes with Multiple Users', () => {
//     const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     const newUser2 = authRegisterRequest('Validemails@gmail.com', 'password123', 'Jason', 'Mascheranous');
//     const newUser3 = authRegisterRequest('Validemailt@gmail.com', 'password123', 'Sanath', 'Nevagi');
//     expect(adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Made by Divakar')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Made by Jason')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizCreateRequest(newUser3.token, 'Test Quiz 3', 'Made by Sanath')).toEqual({ quizId: expect.any(Number) });

//     // We get an expected error as the quizes are already created
//     expect(adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Made by Divakar')).toEqual(ERROR);
//     expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Made by Jason')).toEqual(ERROR);
//     expect(adminQuizCreateRequest(newUser3.token, 'Test Quiz 3', 'Made by Sanath')).toEqual(ERROR);
//   });
// });

// describe('Tests of adminQuizRemove', () => {
//   beforeEach(() => {
//     clearRequest();
//   });

//   test('Token is Invalid', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizRemoveRequest('', quizIndex.quizId)).toEqual(ERROR);
//   });

//   test('QuizId is Invalid', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
//     const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test');
//     expect(adminQuizRemoveRequest(newUser.token, quizIndex.quizId + 1)).toEqual(ERROR);
//   });

//   test('Removal when there are no quizzes', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     expect(adminQuizRemoveRequest(newUser.token, 100)).toEqual(ERROR);
//   });

//   test('Quiz is not owned by the owner', () => {
//     const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     const newUser2 = authRegisterRequest('Validemails@gmail.com', 'password123', 'Jason', 'Mascharanous');
//     const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizRemoveRequest(newUser2.token, quizIndex.quizId)).toEqual(ERROR);
//   });

//   test('Deleting one quiz, Normal Case', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
//     adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test');
//     adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'This is a test');
//     adminQuizCreateRequest(newUser.token, 'Test Quiz 4', 'This is a test');

//     // We wont be able to make a new Quiz
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test')).toEqual(ERROR);

//     //  Now, we remove this quiz
//     expect(adminQuizRemoveRequest(newUser.token, quizIndex.quizId)).toEqual({});

//     // Adding the quizes again should return us new quizIds and no error
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test')).toEqual({ quizId: expect.any(Number) });
//   });

//   test('Multiple Quizzes Deletion from one user, Normal Case', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     const quizIndex1 = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
//     const quizIndex2 = adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test');
//     const quizIndex3 = adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'This is a test');
//     adminQuizCreateRequest(newUser.token, 'Test Quiz 4', 'This is a test');

//     // We wont be able to make new Quizzes
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test')).toEqual(ERROR);
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test')).toEqual(ERROR);
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'This is a test')).toEqual(ERROR);

//     // Now, we remove this quizzes
//     expect(adminQuizRemoveRequest(newUser.token, quizIndex1.quizId)).toEqual({});
//     expect(adminQuizRemoveRequest(newUser.token, quizIndex2.quizId)).toEqual({});
//     expect(adminQuizRemoveRequest(newUser.token, quizIndex3.quizId)).toEqual({});

//     // Adding the quizzes again should return us new quizIds and no error
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'This is a test')).toEqual({ quizId: expect.any(Number) });
//   });

//   test('Multiple quizzes Deletion with mutiple users, Normal Case', () => {
//     const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     const newUser2 = authRegisterRequest('Validemails@gmail.com', 'password123', 'Jason', 'Mascheranous');
//     const newUser3 = authRegisterRequest('Validemailt@gmail.com', 'password123', 'Sanath', 'Nevagi');
//     const quizIndex1 = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Made by Divakar');
//     const quizIndex2 = adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Made by Jason');
//     adminQuizCreateRequest(newUser3.token, 'Test Quiz 3', 'Made by Sanath');

//     // We wont be able to make new Quizzes
//     adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Made by Divakar');
//     adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Made by Jason');

//     // Now, we remove this quizzes
//     expect(adminQuizRemoveRequest(newUser1.token, quizIndex1.quizId)).toEqual({});
//     expect(adminQuizRemoveRequest(newUser2.token, quizIndex2.quizId)).toEqual({});

//     // Adding the quizzes again should return us new quizIds and no error
//     expect(adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Made by Divakar')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Made by Jason')).toEqual({ quizId: expect.any(Number) });
//   });
// });

// describe('Tests of adminQuizNameUpdate', () => {
//   beforeEach(() => {
//     clearRequest();
//   });

//   test('Token is Invalid', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
//     const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizNameUpdateRequest('', quizIndex.quizId, 'New Name')).toEqual(ERROR);
//   });

//   test('QuizId is Invalid', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
//     adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
//     const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test');
//     expect(adminQuizNameUpdateRequest(newUser.token, quizIndex.quizId + 1, 'New Name')).toEqual(ERROR);
//   });

//   test('Quiz is not owned by the owner', () => {
//     const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
//     const newUser2 = authRegisterRequest('Validemails@gmail.com', 'password123', 'Jane', 'Choi');
//     const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizNameUpdateRequest(newUser2.token, quizIndex.quizId, 'New Name')).toEqual(ERROR);
//   });

//   test('Invalid Quiz Names', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
//     const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizNameUpdateRequest(newUser.token, quizIndex.quizId, '')).toEqual(ERROR);
//     expect(adminQuizNameUpdateRequest(newUser.token, quizIndex.quizId, 'Alexander Bartholomew Fitzwilliam Throckmorton Montgomery III')).toEqual(ERROR);
//     expect(adminQuizNameUpdateRequest(newUser.token, quizIndex.quizId, '!!!@@@@##########$$$$$$$$$$$$$**********&&&&&&&&&&&&^^^^^^^^^^')).toEqual(ERROR);
//     expect(adminQuizNameUpdateRequest(newUser.token, quizIndex.quizId, '!!!')).toEqual(ERROR);
//     expect(adminQuizNameUpdateRequest(newUser.token, quizIndex.quizId, 'J@n3 Sm!th')).toEqual(ERROR);
//     expect(adminQuizNameUpdateRequest(newUser.token, quizIndex.quizId, '                                    ')).toEqual(ERROR);
//   });

//   test('Quiz name already exists', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
//     const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
//     adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'Sample Quiz Testing');
//     expect(adminQuizNameUpdateRequest(newUser.token, quizIndex.quizId, 'Test Quiz 2')).toEqual(ERROR);
//   });

//   test('Changing Name Successfully', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
//     const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizNameUpdateRequest(newUser.token, quizIndex.quizId, 'Test Quiz 2')).toEqual({});
//   });
// });

// describe('Tests of adminQuizTransfer', () => {
//   beforeEach(() => {
//     clearRequest();
//   });
//   test('Tests for empty or invalid token', () => {
//     const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
//     const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizTransferRequest('', quizIndex.quizId, 'Validemail2@gmail.com')).toEqual(ERROR);
//   });
//   test('Tests for Invalid Quiz', () => {
//     const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
//     const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizTransferRequest(newUser1.token, quizIndex.quizId + 1, 'Validemail2@gmail.com')).toEqual(ERROR);
//   });

//   test('Valid token is provided, but user is not an owner of this quiz', () => {
//     const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
//     const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizTransferRequest(newUser2.token, quizIndex.quizId, 'Validemail2@gmail.com')).toEqual(ERROR);
//   });

//   test('Test for Normal Cases', () => {
//     const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
//     const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizTransferRequest(newUser1.token, quizIndex.quizId, 'Validemail2@gmail.com')).toEqual({});

//     // Doesn't add a new quiz as the quiz already exists for the userId
//     expect(adminQuizCreateRequest(newUser2.token, 'Test Quiz 1', 'This is a test')).toEqual(ERROR);
//   });

//   test('Test for Invalid Email', () => {
//     const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
//     const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizTransferRequest(newUser1.token, quizIndex.quizId, 'Validemail5@gmail.com')).toEqual(ERROR);
//   });

//   test('Test for Current User Email is Same as Current User ', () => {
//     const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
//     const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizTransferRequest(newUser1.token, quizIndex.quizId, 'Validemail@gmail.com')).toEqual(ERROR);
//   });

//   test('Test for when Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
//     const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password123', 'Pattrick', 'Dessai');
//     const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
//     adminQuizCreateRequest(newUser2.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizTransferRequest(newUser1.token, quizIndex.quizId, 'Validemail2@gmail.com')).toEqual(ERROR);
//   });
// });

// describe('Tests of adminQuizInfo', () => {
//   beforeEach(() => {
//     clearRequest();
//   });

//   test('Token is Invalid', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
//     const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizInfoRequest('', quizIndex.quizId)).toEqual(ERROR);
//   });

//   test('QuizId is Invalid', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
//     adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
//     const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test');
//     expect(adminQuizInfoRequest(newUser.token, quizIndex.quizId + 1)).toEqual(ERROR);
//   });

//   test('Quiz is not owned by the owner', () => {
//     const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
//     const newUser2 = authRegisterRequest('Validemails@gmail.com', 'password123', 'Jane', 'Choi');
//     const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizInfoRequest(newUser2.token, quizIndex.quizId)).toEqual(ERROR);
//   });

//   test('Quiz Info Successful', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Shervin', 'Erfanian');
//     const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizInfoRequest(newUser.token, quizIndex.quizId)).toEqual({
//       quizId: quizIndex.quizId,
//       name: 'Test Quiz 1',
//       timeCreated: expect.any(Number),
//       timeLastEdited: expect.any(Number),
//       description: 'This is a test',
//       questions: [],
//       duration: expect.any(Number),
//       numQuestions: expect.any(Number)
//     });
//   });
// });

// describe('Tests for adminQuizViewTrash', () => {
//   beforeEach(() => {
//     clearRequest();
//   });

//   test('Invalid token', () => {
//     expect(adminQuizViewTrashRequest('234097634')).toEqual(ERROR);
//     expect(adminQuizViewTrashRequest('1248734')).toEqual(ERROR);
//     expect(adminQuizViewTrashRequest('24763')).toEqual(ERROR);
//     expect(adminQuizViewTrashRequest('5487')).toEqual(ERROR);
//   });

//   test('Valid Test quizViewTrash with 1 quiz', () => {
//     const newUser1 = authRegisterRequest('Validemail1@gmail.com', 'password123', 'Jonathan', 'Leung');
//     const quiz1 = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizRemoveRequest(newUser1.token, quiz1.quizId)).toEqual({});
//     expect(adminQuizViewTrashRequest(newUser1.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 1' }] });
//     const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password1234', 'Random', 'Person');
//     const quiz2 = adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Testing');
//     expect(adminQuizRemoveRequest(newUser2.token, quiz2.quizId)).toEqual({});
//     expect(adminQuizViewTrashRequest(newUser2.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 2' }] });
//   });

//   test('Valid Test quizViewTrash with multiple quizzes', () => {
//     const newUser1 = authRegisterRequest('Validemail1@gmail.com', 'password123', 'Jonathan', 'Leung');
//     const quiz1 = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'Sample Quiz Testing');
//     const quiz2 = adminQuizCreateRequest(newUser1.token, 'Test Quiz 2', 'Testing');
//     expect(adminQuizRemoveRequest(newUser1.token, quiz1.quizId)).toEqual({});
//     expect(adminQuizRemoveRequest(newUser1.token, quiz2.quizId)).toEqual({});
//     expect(adminQuizViewTrashRequest(newUser1.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 1' }, { quizId: expect.any(Number), name: 'Test Quiz 2' }] });
//     const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password1234', 'Random', 'Person');
//     const quiz3 = adminQuizCreateRequest(newUser2.token, 'Test Quiz 1', 'Sample Quiz Testing');
//     const quiz4 = adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Testing');
//     const quiz5 = adminQuizCreateRequest(newUser2.token, 'Test Quiz 3', 'Testing?');
//     const quiz6 = adminQuizCreateRequest(newUser2.token, 'Test Quiz 4', 'Testing!');
//     expect(adminQuizRemoveRequest(newUser2.token, quiz3.quizId)).toEqual({});
//     expect(adminQuizRemoveRequest(newUser2.token, quiz4.quizId)).toEqual({});
//     expect(adminQuizRemoveRequest(newUser2.token, quiz5.quizId)).toEqual({});
//     expect(adminQuizRemoveRequest(newUser2.token, quiz6.quizId)).toEqual({});
//     expect(adminQuizViewTrashRequest(newUser2.token)).toEqual({
//       quizzes:
//             [{ quizId: expect.any(Number), name: 'Test Quiz 1' },
//               { quizId: expect.any(Number), name: 'Test Quiz 2' },
//               { quizId: expect.any(Number), name: 'Test Quiz 3' },
//               { quizId: expect.any(Number), name: 'Test Quiz 4' }
//             ]
//     });
//   });
// });

// describe('Tests for adminQuizRestore', () => {
//   beforeEach(() => {
//     clearRequest();
//   });

//   test('Invalid token', () => {
//     const newUser1 = authRegisterRequest('Validemail1@gmail.com', 'password123', 'Jonathan', 'Leung');
//     const quiz1 = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizRestoreRequest('234097634', quiz1.quizId)).toEqual(ERROR);
//     expect(adminQuizRestoreRequest('1248734', quiz1.quizId)).toEqual(ERROR);
//     expect(adminQuizRestoreRequest('24763', quiz1.quizId)).toEqual(ERROR);
//     expect(adminQuizRestoreRequest('5487', quiz1.quizId)).toEqual(ERROR);
//   });

//   test('Invalid quizId', () => {
//     const newUser1 = authRegisterRequest('Validemail1@gmail.com', 'password123', 'Jonathan', 'Leung');
//     adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizRestoreRequest(newUser1.token, 456234)).toEqual(ERROR);
//     expect(adminQuizRestoreRequest(newUser1.token, 34563)).toEqual(ERROR);
//     expect(adminQuizRestoreRequest(newUser1.token, 576435)).toEqual(ERROR);
//     expect(adminQuizRestoreRequest(newUser1.token, 90856)).toEqual(ERROR);
//   });

//   test('Invalid userId', () => {
//     const newUser1 = authRegisterRequest('Validemail1@gmail.com', 'password123', 'Jonathan', 'Leung');
//     const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password1234', 'Random', 'Person');
//     const quiz1 = adminQuizCreateRequest(newUser2.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizRestoreRequest(newUser1.token, quiz1.quizId)).toEqual(ERROR);
//   });

//   test('Valid Test quizRestore with 1 quiz', () => {
//     const newUser1 = authRegisterRequest('Validemail1@gmail.com', 'password123', 'Jonathan', 'Leung');
//     const quiz1 = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizRemoveRequest(newUser1.token, quiz1.quizId)).toEqual({});
//     expect(adminQuizViewTrashRequest(newUser1.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 1' }] });
//     expect(adminQuizRestoreRequest(newUser1.token, quiz1.quizId)).toEqual({});
//     expect(adminQuizViewTrashRequest(newUser1.token)).toEqual({ quizzes: [] });
//     expect(adminQuizListRequest(newUser1.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 1' }] });
//     authLogoutRequest(newUser1.token);
//     const newUser2 = authRegisterRequest('Validemail2@gmail.com', 'password1234', 'Random', 'Person');
//     expect(authLoginRequest('Validemail2@gmail.com', 'password1234')).toEqual({ token: expect.any(String) });
//     const quiz2 = adminQuizCreateRequest(newUser2.token, 'Test Quiz 2', 'Testing');
//     expect(adminQuizRemoveRequest(newUser2.token, quiz2.quizId)).toEqual({});
//     expect(adminQuizViewTrashRequest(newUser2.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 2' }] });
//     expect(adminQuizRestoreRequest(newUser2.token, quiz2.quizId)).toEqual({});
//     expect(adminQuizViewTrashRequest(newUser2.token)).toEqual({ quizzes: [] });
//     expect(adminQuizListRequest(newUser2.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 2' }] });
//   });

//   test('Valid Test quizRestore with multiple quizzes', () => {
//     const newUser3 = authRegisterRequest('Validemail2@gmail.com', 'password1234', 'Random', 'Person');
//     const quiz3 = adminQuizCreateRequest(newUser3.token, 'Test Quiz 3', 'Testing');
//     const quiz4 = adminQuizCreateRequest(newUser3.token, 'Test Quiz 4', 'Testing');
//     const quiz5 = adminQuizCreateRequest(newUser3.token, 'Test Quiz 5', 'Testing?');
//     const quiz6 = adminQuizCreateRequest(newUser3.token, 'Test Quiz 6', 'Testing!');
//     expect(adminQuizRemoveRequest(newUser3.token, quiz3.quizId)).toEqual({});
//     expect(adminQuizRemoveRequest(newUser3.token, quiz4.quizId)).toEqual({});
//     expect(adminQuizRemoveRequest(newUser3.token, quiz5.quizId)).toEqual({});
//     expect(adminQuizRemoveRequest(newUser3.token, quiz6.quizId)).toEqual({});
//     expect(adminQuizRestoreRequest(newUser3.token, quiz5.quizId)).toEqual({});
//     expect(adminQuizListRequest(newUser3.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 5' }] });
//     expect(adminQuizViewTrashRequest(newUser3.token)).toEqual({
//       quizzes:
//             [{ quizId: expect.any(Number), name: 'Test Quiz 3' },
//               { quizId: expect.any(Number), name: 'Test Quiz 4' },
//               { quizId: expect.any(Number), name: 'Test Quiz 6' }
//             ]
//     });

//     // KNOWN BUG - userId of the quizzes randomly switches to the wrong one
//     // remove the clear request to see.
//     // I have tried using authlogout and authlogin but it didn't change anything.
//     clearRequest();
//     const newUser1 = authRegisterRequest('Validemail3@gmail.com', 'password123234', 'Jagfhj', 'Leudfghng');
//     const quiz1 = adminQuizCreateRequest(newUser1.token, 'Test Quiz 456', 'Sample Quiz Testing');
//     const quiz2 = adminQuizCreateRequest(newUser1.token, 'Test Quiz 123', 'Testing');
//     expect(adminQuizRemoveRequest(newUser1.token, quiz1.quizId)).toEqual({});
//     expect(adminQuizRemoveRequest(newUser1.token, quiz2.quizId)).toEqual({});
//     expect(adminQuizRestoreRequest(newUser1.token, quiz2.quizId)).toEqual({});
//     expect(adminQuizViewTrashRequest(newUser1.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 456' }] });
//     expect(adminQuizListRequest(newUser1.token)).toEqual({ quizzes: [{ quizId: expect.any(Number), name: 'Test Quiz 123' }] });
//   });
// });

// describe('Tests for adminQuizTrashEmpty', () => {
//   beforeEach(() => {
//     clearRequest();
//   });

//   test('Token is Invalid', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
//     const quizIndexString = JSON.stringify([quizIndex.quizId]);
//     expect(adminQuizRemoveRequest(newUser.token, quizIndex.quizId)).toEqual({});
//     expect(adminQuizTrashEmptyRequest('', quizIndexString)).toEqual(ERROR);
//   });

//   test('QuizId is Invalid', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
//     const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test');
//     const quizIndexString = JSON.stringify([quizIndex.quizId + 1]);
//     expect(adminQuizRemoveRequest(newUser.token, quizIndex.quizId)).toEqual({});
//     expect(adminQuizTrashEmptyRequest(newUser.token, quizIndexString)).toEqual(ERROR);
//   });

//   test('Removal when there are no quizzes', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     expect(adminQuizTrashEmptyRequest(newUser.token, JSON.stringify([100]))).toEqual(ERROR);
//   });

//   test('Quiz is not owned by the owner', () => {
//     const newUser1 = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     const newUser2 = authRegisterRequest('Validemails@gmail.com', 'password123', 'Jason', 'Mascharanous');
//     const quizIndex = adminQuizCreateRequest(newUser1.token, 'Test Quiz 1', 'This is a test');
//     const quizIndexString = JSON.stringify([quizIndex.quizId]);
//     expect(adminQuizRemoveRequest(newUser1.token, quizIndex.quizId)).toEqual({});
//     expect(adminQuizTrashEmptyRequest(newUser2.token, quizIndexString)).toEqual(ERROR);
//   });

//   test('Deleting one quiz, Normal Case', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     const quizIndex = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
//     const quizIndexString = JSON.stringify([quizIndex.quizId]);
//     adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test');
//     adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'This is a test');
//     adminQuizCreateRequest(newUser.token, 'Test Quiz 4', 'This is a test');
//     //  Now, we remove this quiz
//     expect(adminQuizRemoveRequest(newUser.token, quizIndex.quizId)).toEqual({});
//     // Empty trash
//     expect(adminQuizTrashEmptyRequest(newUser.token, quizIndexString)).toEqual({});
//     // check if its really gone
//     expect(adminQuizViewTrashRequest(newUser.token)).toEqual({ quizzes: [] });
//   });

//   test('Multiple Quizzes Deletion from one user, Normal Case', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Divakar', 'Dessai');
//     const quizIndex1 = adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test');
//     const quizIndex2 = adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test');
//     const quizIndex3 = adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'This is a test');
//     const combinedQuizIds = JSON.stringify([quizIndex1.quizId, quizIndex2.quizId, quizIndex3.quizId]);
//     adminQuizCreateRequest(newUser.token, 'Test Quiz 4', 'This is a test');

//     // We wont be able to make new Quizzes
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test')).toEqual(ERROR);
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test')).toEqual(ERROR);
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'This is a test')).toEqual(ERROR);

//     // Now, we remove this quizzes
//     expect(adminQuizRemoveRequest(newUser.token, quizIndex1.quizId)).toEqual({});
//     expect(adminQuizRemoveRequest(newUser.token, quizIndex2.quizId)).toEqual({});
//     expect(adminQuizRemoveRequest(newUser.token, quizIndex3.quizId)).toEqual({});

//     // Empty all of them
//     expect(adminQuizTrashEmptyRequest(newUser.token, combinedQuizIds)).toEqual({});

//     // Adding the quizzes again should return us new quizIds and no error
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 1', 'This is a test')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 2', 'This is a test')).toEqual({ quizId: expect.any(Number) });
//     expect(adminQuizCreateRequest(newUser.token, 'Test Quiz 3', 'This is a test')).toEqual({ quizId: expect.any(Number) });
//     // check if its really gone
//     expect(adminQuizViewTrashRequest(newUser.token)).toEqual({ quizzes: [] });
//   });
// });

// describe('Tests of adminQuizDescriptionUpdate', () => {
//   beforeEach(() => {
//     clearRequest();
//   });

//   test('Token is empty', () => {
//     const User1 = authRegisterRequest('landonorris@gmail.com', 'validpassword12', 'Kyrie', 'Irving');
//     const quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizDescriptionUpdateRequest('', quiz1.quizId, 'Valid description')).toEqual(ERROR);
//   });

//   test('Valid token is provided, but user is not an owner of this quiz', () => {
//     const User1 = authRegisterRequest('landonorris@gmail.com', 'validpassword12', 'Kyrie', 'Irving');
//     const quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
//     const User2 = authRegisterRequest('validddemail@gmail.com', 'validpassword12', 'Yuki', 'Tsunoda');
//     expect(adminQuizDescriptionUpdateRequest(User2.token, quiz1.quizId, 'Valid description')).toEqual(ERROR);
//   });

//   test('QuizId does not refer to a valid quiz', () => {
//     const User1 = authRegisterRequest('maxverstappen@gmail.com', 'validpassword123', 'Steph', 'Curry');
//     adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
//     const quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 2', 'This is a test');
//     expect(adminQuizDescriptionUpdateRequest(User1.token, quiz1.quizId + 1, 'Valid description')).toEqual(ERROR);
//   });

//   test('Description names are invalid', () => {
//     const newUser = authRegisterRequest('Validemail@gmail.com', 'password123', 'Lando', 'Norris');
//     expect(adminQuizCreateRequest(newUser.token, 'Valid quiz name 1', 'ThisStringNOTIsExactly100CharactersLongThisStringNOTIsExactly100CharactersLong Andrew is such a great tutor Andrew is such a great tutor Andrew is such a great tutor Andrew is such a great tutor')).toEqual(ERROR);
//   });

//   test('Checking if description update is working', () => {
//     const User1 = authRegisterRequest('landonorris@gmail.com', 'validpassword12', 'Kyrie', 'Irving');
//     const quiz1 = adminQuizCreateRequest(User1.token, 'Test Quiz 1', 'This is a test');
//     expect(adminQuizInfoRequest(User1.token, quiz1.quizId)).toEqual({
//       quizId: quiz1.quizId,
//       name: 'Test Quiz 1',
//       timeCreated: expect.any(Number),
//       timeLastEdited: expect.any(Number),
//       description: 'This is a test',
//       questions: [],
//       duration: expect.any(Number),
//       numQuestions: expect.any(Number),
//     });
//     expect(adminQuizDescriptionUpdateRequest(User1.token, quiz1.quizId, 'Valid description')).toEqual({});
//     expect(adminQuizInfoRequest(User1.token, quiz1.quizId)).toEqual({
//       quizId: quiz1.quizId,
//       name: 'Test Quiz 1',
//       timeCreated: expect.any(Number),
//       timeLastEdited: expect.any(Number),
//       description: 'Valid description',
//       questions: [],
//       duration: expect.any(Number),
//       numQuestions: expect.any(Number),
//     });
//     expect(adminQuizDescriptionUpdateRequest(User1.token, quiz1.quizId, 'Valid testing for description')).toEqual({});
//     expect(adminQuizInfoRequest(User1.token, quiz1.quizId)).toEqual({
//       quizId: quiz1.quizId,
//       name: 'Test Quiz 1',
//       timeCreated: expect.any(Number),
//       timeLastEdited: expect.any(Number),
//       description: 'Valid testing for description',
//       questions: [],
//       duration: expect.any(Number),
//       numQuestions: expect.any(Number),
//     });
//   });
// });

/// /////////////////////// Epilogue //////////////////////////////
// TODO: Add relevant tests calling the server.ts files.

test('Nice Test', () => {
  expect(1 + 1).toEqual(2);
});
