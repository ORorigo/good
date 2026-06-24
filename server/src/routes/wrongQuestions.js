import { Router } from 'express';
import {
  listWrongQuestions,
  checkAnswers,
  clearWrongQuestions,
  removeWrongQuestion,
} from '../controllers/wrongController.js';

const router = Router();

router.get('/', listWrongQuestions);
router.post('/check', checkAnswers);
router.delete('/clear-all', clearWrongQuestions);
router.delete('/:questionId', removeWrongQuestion);

export default router;
