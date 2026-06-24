import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ['single', 'multiple', 'judge', 'short'], required: true },
  question: { type: String, required: true },
  options: [String],
  answer: { type: String, required: true },
  tags: [String],
}, { timestamps: true });

questionSchema.index({ type: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ question: 'text' });

export default mongoose.model('Question', questionSchema);
