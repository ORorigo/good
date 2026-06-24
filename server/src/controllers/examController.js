import Exam from '../models/Exam.js';
import Question from '../models/Question.js';

export async function createExam(req, res) {
  try {
    const { title, questionTypes, counts, timeLimit } = req.body;
    if (!title || !Array.isArray(questionTypes) || !counts)
      return res.status(400).json({ error: '参数不完整' });

    const selected = [];
    for (const type of questionTypes) {
      const count = counts[type] || 0;
      if (count <= 0) continue;
      const questions = await Question.aggregate([
        { $match: { type } },
        { $sample: { size: count } },
      ]);
      selected.push(...questions.map(q => q._id));
    }
    if (selected.length === 0) return res.status(400).json({ error: '题库中没有符合条件的题目' });

    const exam = await Exam.create({ title, questions: selected, questionTypes, timeLimit: timeLimit || 0 });
    const populated = await Exam.findById(exam._id).populate('questions');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function listExams(req, res) {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 }).select('-questions');
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getExam(req, res) {
  try {
    const exam = await Exam.findById(req.params.id).populate({
      path: 'questions',
      select: req.query.withAnswers === 'true' ? '' : '-answer',
    });
    if (!exam) return res.status(404).json({ error: '试卷未找到' });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteExam(req, res) {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ error: '试卷未找到' });
    res.json({ message: '已删除' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
