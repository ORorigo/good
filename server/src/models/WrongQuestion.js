import { createModel } from '../db/database.js';
const WrongQuestion = createModel('wrong_questions', { questionId: 'questions' });
export default WrongQuestion;
