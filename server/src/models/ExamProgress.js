import mongoose from 'mongoose';

const examProgressSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  answers: { type: mongoose.Schema.Types.Mixed, default: {} },
  instantResults: { type: mongoose.Schema.Types.Mixed, default: {} },
  examSubmitted: { type: Boolean, default: false },
  examResults: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

examProgressSchema.index({ sessionId: 1, examId: 1 }, { unique: true });

export default mongoose.model('ExamProgress', examProgressSchema);
