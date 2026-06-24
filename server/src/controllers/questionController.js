import Question from '../models/Question.js';
import { parseDocx } from '../services/docxParser.js';

export async function listQuestions(req, res) {
  try {
    const { type, tag, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (tag) filter.tags = { $in: [tag] };
    if (search) filter.question = { $regex: search, $options: 'i' };

    const total = await Question.countDocuments(filter);
    const questions = await Question.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ questions, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getQuestion(req, res) {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ error: '题目未找到' });
    res.json(q);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createQuestion(req, res) {
  try {
    const q = await Question.create(req.body);
    res.status(201).json(q);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteQuestion(req, res) {
  try {
    const q = await Question.findByIdAndDelete(req.params.id);
    if (!q) return res.status(404).json({ error: '题目未找到' });
    res.json({ message: '已删除' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function uploadDocx(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: '请上传文件' });
    const parsed = await parseDocx(req.file.buffer);
    if (parsed.length === 0) return res.status(400).json({ error: '未能从文件中解析出任何题目' });
    const tags = req.body.tags ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const docs = parsed.map(q => ({ ...q, tags }));
    const inserted = await Question.insertMany(docs);
    res.status(201).json({ message: `成功导入 ${inserted.length} 道题目`, count: inserted.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
