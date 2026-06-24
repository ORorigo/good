import { Router } from 'express';
import {
  createExam,
  listExams,
  getExam,
  deleteExam,
} from '../controllers/examController.js';

const router = Router();

router.post('/', createExam);
router.get('/', listExams);
router.get('/:id', getExam);
router.delete('/:id', deleteExam);

export default router;
