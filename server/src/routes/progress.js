import { Router } from 'express';
import { getProgress, saveProgress } from '../controllers/progressController.js';

const router = Router();
router.get('/:examId', getProgress);
router.post('/:examId', saveProgress);

export default router;
