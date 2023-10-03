import {adminQuizList} from './quiz';

const ERROR = { error: expect.any(String) };

describe('quizList', () => {
    test ('Invalid UserId', () => {
        expect(adminQuizList(234097634)).toEqual(ERROR);
        expect(adminQuizList(1248734)).toEqual(ERROR);
        expect(adminQuizList(24763)).toEqual(ERROR);
        expect(adminQuizList(5487)).toEqual(ERROR);
    });
    test ('Invalid Syntax', () => {
        expect(adminQuizList('23948bfiudg')).toEqual(ERROR);
        expect(adminQuizList('04g9j309fn')).toEqual(ERROR);
        expect(adminQuizList('whatisthis')).toEqual(ERROR);
        expect(adminQuizList('string???1239')).toEqual(ERROR);
    })
});