import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { clear } from './other';
import {
  adminAuthLogin,
  adminAuthLogout,
  adminAuthRegister,
  adminUpdateUserDetails,
  adminUserDetails,
  adminUserPassword
} from './auth';
import {
  adminQuizCreate,
  adminQuizList,
  adminQuizRemove,
  adminQuizRestore,
  adminQuizTransfer,
  adminQuizTrashEmpty,
  adminQuizViewTrash,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate
} from './quiz';
import { adminQuizCreateQuestion, adminQuizQuestionDelete, adminQuizQuestionUpdate, adminQuizQuestionMove, adminQuizQuestionDuplicate } from './question';
import { setData, getData } from './dataStore';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

/// ///////////////////////// dataBase.json ///////////////////////////////

if (fs.existsSync('./dataBase.json')) {
  const database = fs.readFileSync('./dataBase.json');
  setData(JSON.parse(String(database)));
}

const saveDataStore = () => {
  const dataString = JSON.stringify(getData());
  fs.writeFileSync('./dataBase.json', dataString);
};

/// ///////////////////////// auth.ts ///////////////////////////////

// adminAuthRegister Request
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  // email, password, nameFirst, nameLast values obtained from body
  const { email, password, nameFirst, nameLast } = req.body;

  // logic of the function is retrieved from auth.ts
  const response = adminAuthRegister(email, password, nameFirst, nameLast);

  saveDataStore();
  res.json(response);
});

// adminAuthLogin Request
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  // email and password values obtained from body
  const { email, password } = req.body;

  // logic of the function is retrieved from auth.ts
  const response = adminAuthLogin(email, password);

  saveDataStore();
  res.json(response);
});

// adminUserDetails Request
app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  // token value obtained fromm header
  const token = req.headers.token as string;

  // logic of the function is retrieved from auth.ts
  const response = adminUserDetails(token);

  saveDataStore();
  res.json(response);
});

// adminAuthLogout Request
app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  // token value obtained from header
  const token = req.headers.token as string;

  // logic of the function is retrieved from auth.ts
  const response = adminAuthLogout(token);

  saveDataStore();
  res.json(response);
});

// adminUpdateUserDetails Request
app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  // token value obtained from header
  const token = req.headers.token as string;
  // email, nameFirst, nameLast values obtained from body
  const { email, nameFirst, nameLast } = req.body;

  // logic of the function is retrieved from auth.ts
  const response = adminUpdateUserDetails(token, email, nameFirst, nameLast);

  saveDataStore();
  res.json(response);
});

// adminUserPassword Request
app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  // token value obtained from header
  const token = req.headers.token as string;
  // oldPassword, newPassword values obtained from body
  const { oldPassword, newPassword } = req.body;

  // logic of the function is retrieved from auth.ts
  const response = adminUserPassword(token, oldPassword, newPassword);

  saveDataStore();
  res.json(response);
});

/// ///////////////////////// other.ts ///////////////////////////////

// Clear Request
app.delete('/v1/clear', (req: Request, res: Response) => {
  const response = clear();
  saveDataStore();
  res.json(response);
});

/// ///////////////////////// quiz.ts ///////////////////////////////

// adminQuizList Request
app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  // data is passed into a query string
  const token = req.headers.token as string;

  // logic of the function is retrieved from quiz.ts
  const response = adminQuizList(token);

  saveDataStore();
  res.json(response);
});

// adminQuizCreate Request
app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { name, description } = req.body;

  const response = adminQuizCreate(token, name, description);

  saveDataStore();
  res.json(response);
});

// adminQuizRemove Request
app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const response = adminQuizRemove(token, quizId);

  saveDataStore();
  res.json(response);
});

// adminQuizTransfer Request
app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { userEmail } = req.body;
  const token = req.headers.token as string;
  const response = adminQuizTransfer(token, quizId, userEmail);

  saveDataStore();
  res.json(response);
});

// adminQuizNameUpdate Request
app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { name } = req.body;
  const token = req.headers.token as string;
  const response = adminQuizNameUpdate(token, quizId, name);

  saveDataStore();
  res.json(response);
});

// adminQuizDescriptionUpdate
app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const { description } = req.body;
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const response = adminQuizDescriptionUpdate(token, quizId, description);

  saveDataStore();
  res.json(response);
});

// adminQuizViewTrash Request
app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  // data is passed into a query string
  const token = req.headers.token as string;

  // logic of the function is retrieved from auth.ts
  const response = adminQuizViewTrash(token);

  saveDataStore();
  res.json(response);
});

// adminQuizRestore Request
app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const response = adminQuizRestore(token, quizId);

  saveDataStore();
  res.json(response);
});

// adminQuizTrashEmpty Request
app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  // passes the token as a query string
  const token = req.headers.token as string;
  // passes the quizIds as a query string
  const quizIds = req.query.quizIds as string;
  // logic of the function is retrieved from auth.ts
  const response = adminQuizTrashEmpty(token, quizIds);

  saveDataStore();
  res.json(response);
});

// adminQuizInfo Request
app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const response = adminQuizInfo(token, quizId);

  saveDataStore();
  res.json(response);
});

/// ////////////////////////// question.ts ///////////////////////////////

// adminQuizQuestionUpdate
app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { token, questionBody } = req.body;

  const response = adminQuizQuestionUpdate(token, quizId, questionId, questionBody);

  if (response.error) {
    if (response.error === 'Token is empty or invalid') {
      return res.status(401).json(response);
    } else if (response.error === 'Valid token is provided, but user is not an owner of this quiz') {
      return res.status(403).json(response);
    } else if ('error' in response) {
      return res.status(400).json(response);
    }
  }
  saveDataStore();
  res.json(response);
});

// adminQuizCreateQuestion Request
app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { questionBody } = req.body;
  const token = req.headers.token as string;
  const response = adminQuizCreateQuestion(token, quizId, questionBody);

  saveDataStore();
  res.json(response);
});

// adminQuizQuestionMove
app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const { newPosition } = req.body;
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const response = adminQuizQuestionMove(token, newPosition, quizId, questionId);

  saveDataStore();
  res.json(response);
});

// adminQuizQuestionDelete
app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.query.token as string;

  const response = adminQuizQuestionDelete(token, quizId, questionId);

  if (response.error) {
    if (response.error === 'Token is empty or invalid') {
      return res.status(401).json(response);
    } else if (response.error === 'Valid token is provided, but user is not an owner of this quiz') {
      return res.status(403).json(response);
    } else if ('error' in response) {
      return res.status(400).json(response);
    }
  }
  saveDataStore();
  res.json(response);
});

// adminQuizQuestionDuplicate
app.post('/v2/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.headers.token as string;
  const response = adminQuizQuestionDuplicate(token, quizId, questionId);

  saveDataStore();
  res.json(response);
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    404 Not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// Error middleware - must use AFTER declaring your routes and other middlewares
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
