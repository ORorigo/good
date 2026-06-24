import ExamProgress from '../models/ExamProgress.js';

export async function getProgress(req, res) {
  try {
    const { sessionId } = req.query;
    const { examId } = req.params;
    if (!sessionId || !examId) return res.status(400).json({ error: '缺少参数' });
    const progress = await ExamProgress.findOne({ sessionId, examId });
    res.json(progress || { answers: {}, instantResults: {}, examSubmitted: false, examResults: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function saveProgress(req, res) {
  try {
    const { sessionId, answers, instantResults, examSubmitted, examResults } = req.body;
    const { examId } = req.params;
    if (!sessionId || !examId) return res.status(400).json({ error: '缺少参数' });

    const update = { updatedAt: new Date() };
    if (answers !== undefined) update.answers = answers;
    if (instantResults !== undefined) update.instantResults = instantResults;
    if (examSubmitted !== undefined) update.examSubmitted = examSubmitted;
    if (examResults !== undefined) update.examResults = examResults;

    await ExamProgress.findOneAndUpdate({ sessionId, examId }, { $set: update }, { upsert: true });
    res.json({ message: 'ok' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
