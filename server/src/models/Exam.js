import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  questionTypes: [String],
  timeLimit: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Exam', examSchema);
