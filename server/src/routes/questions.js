import { Router } from 'express';
import multer from 'multer';
import {
  listQuestions,
  getQuestion,
  createQuestion,
  deleteQuestion,
  uploadDocx,
} from '../controllers/questionController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', listQuestions);
router.get('/:id', getQuestion);
router.post('/', createQuestion);
router.delete('/:id', deleteQuestion);
router.post('/upload', upload.single('file'), uploadDocx);

export default router;
