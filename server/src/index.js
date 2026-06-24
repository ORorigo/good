import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import questionRoutes from './routes/questions.js';
import examRoutes from './routes/exams.js';
import wrongRoutes from './routes/wrongQuestions.js';
import progressRoutes from './routes/progress.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/questions', questionRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/wrong-questions', wrongRoutes);
app.use('/api/progress', progressRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// Connect to MongoDB (env MONGODB_URI required in production)
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => { console.error('❌ MongoDB connection error:', err); process.exit(1); });
} else {
  console.log('⚠️  MONGODB_URI not set, using JSON file database');
}

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
