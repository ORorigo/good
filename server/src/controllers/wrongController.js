import WrongQuestion from '../models/WrongQuestion.js';
import Question from '../models/Question.js';

export async function listWrongQuestions(req, res) {
  try {
    const { sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ error: '缺少 sessionId' });
    const items = await WrongQuestion.find({ sessionId }).populate('questionId').sort({ lastWrongTime: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function checkAnswers(req, res) {
  try {
    const { sessionId, answers } = req.body;
    if (!sessionId || !Array.isArray(answers)) return res.status(400).json({ error: '参数不完整' });

    const questions = await Question.find({ _id: { $in: answers.map(a => a.questionId) } });
    const qMap = {};
    questions.forEach(q => { qMap[q._id.toString()] = q; });

    const results = [];
    for (const { questionId, userAnswer } of answers) {
      const q = qMap[questionId];
      if (!q) { results.push({ questionId, correct: false, error: '题目未找到' }); continue; }

      let correct = false;
      if (q.type === 'multiple') {
        const norm = s => [...(s || '').replace(/\s/g, '').toUpperCase()].sort().join('');
        correct = norm(userAnswer) === norm(q.answer);
      } else if (q.type === 'judge') {
        correct = (userAnswer || '').trim() === q.answer.trim();
      } else {
        correct = (userAnswer || '').trim().toLowerCase() === q.answer.trim().toLowerCase();
      }

      results.push({ questionId, correct, correctAnswer: q.answer, type: q.type });

      if (!correct) {
        await WrongQuestion.findOneAndUpdate(
          { sessionId, questionId },
          { $inc: { wrongCount: 1 }, $set: { lastWrongTime: new Date() } },
          { upsert: true }
        );
      } else {
        await WrongQuestion.findOneAndDelete({ sessionId, questionId });
      }
    }
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function clearWrongQuestions(req, res) {
  try {
    const { sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ error: '缺少 sessionId' });
    const result = await WrongQuestion.deleteMany({ sessionId });
    res.json({ message: '已清空错题集', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function removeWrongQuestion(req, res) {
  try {
    const { sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ error: '缺少 sessionId' });
    await WrongQuestion.findOneAndDelete({ sessionId, questionId: req.params.questionId });
    res.json({ message: '已移除' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
