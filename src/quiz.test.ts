// New .ts file to implement tests for quiz.ts functions through the server

import request from 'sync-request-curl';
import {port, url} from './config.json';
const SERVER_URL = `${url}:${port}`;

// TODO: Add relevant tests calling the server.ts files