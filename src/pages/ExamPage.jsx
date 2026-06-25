import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { examApi, wrongApi, progressApi } from '../api';
import useStore from '../store/useStore';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';

export default function ExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    sessionId,
    currentExam,
    answers,
    instantResults,
    examSubmitted,
    examResults,
    setCurrentExam,
    setAnswer,
    setInstantResult,
    setExamResults,
    submitExam,
    loadProgress,
    setError,
  } = useStore();

  const [localLoading, setLocalLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const saveTimer = useRef(null);

  // Load exam + progress from server
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLocalLoading(true);
      try {
        const examRes = await examApi.get(id);
        if (cancelled) return;
        setCurrentExam(examRes.data);

        const progRes = await progressApi.get(id, sessionId);
        if (cancelled) return;
        if (progRes.data?.answers && Object.keys(progRes.data.answers).length > 0) {
          loadProgress(progRes.data);
        }
      } catch (err) {
        if (!cancelled) setError('加载失败');
      } finally {
        if (!cancelled) setLocalLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, sessionId]);

  // Debounced save to server
  const saveToServer = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const state = useStore.getState();
        await progressApi.save(id, {
          sessionId,
          answers: state.answers,
          instantResults: state.instantResults,
          examSubmitted: state.examSubmitted,
          examResults: state.examResults,
        });
      } catch (err) { /* silent */ }
    }, 500);
  }, [id, sessionId]);

  useEffect(() => {
    if (!localLoading) saveToServer();
  }, [answers, instantResults, examSubmitted, examResults, localLoading]);

  const handleInstantConfirm = useCallback(async (questionId, userAnswer) => {
    try {
      const res = await wrongApi.check({ sessionId, answers: [{ questionId, userAnswer }] });
      const result = res.data.results[0];
      if (result) setInstantResult(questionId, result);
    } catch (err) {}
  }, [sessionId]);

  const handleSubmit = useCallback(async () => {
    if (!currentExam) return;
    setSubmitting(true);
    try {
      const answerList = currentExam.questions.map((q) => ({
        questionId: q._id,
        userAnswer: answers[q._id] || '',
      }));
      const res = await wrongApi.check({ sessionId, answers: answerList });
      setExamResults(res.data);
      submitExam();
      await progressApi.save(id, {
        sessionId,
        answers: useStore.getState().answers,
        instantResults: useStore.getState().instantResults,
        examSubmitted: true,
        examResults: res.data,
      });
    } catch (err) {
      setError('提交失败');
    } finally {
      setSubmitting(false);
    }
  }, [currentExam, answers, sessionId, id]);

  const handleTimeout = useCallback(() => {
    if (!examSubmitted) handleSubmit();
  }, [examSubmitted, handleSubmit]);

  if (localLoading) return <p className="text-gray-400 text-center py-10">加载试卷中...</p>;
  if (!currentExam) return (
    <div className="text-center py-10">
      <p className="text-gray-500 mb-3">试卷不存在</p>
      <Link to="/" className="text-indigo-600 hover:underline">返回首页</Link>
    </div>
  );

  const questions = currentExam.questions || [];
  const total = questions.length;
  const answered = Object.keys(answers).length;

  const getResult = (qId) => {
    if (examSubmitted && examResults) return examResults.results.find((r) => r.questionId === qId);
    return instantResults[qId] || null;
  };

  return (
    <div>
      <Timer onTimeout={handleTimeout} />
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">{currentExam.title}</h1>
        <p className="text-sm text-gray-400 mt-1">
          共 {total} 题 · 已答 {answered} 题
          {currentExam.timeLimit ? ` · 限时 ${currentExam.timeLimit} 分钟` : ''}
        </p>
      </div>
      {questions.map((q, i) => (
        <QuestionCard key={q._id} question={q} index={i}
          showResult={examSubmitted}
          userAnswer={answers[q._id] || ''}
          onAnswer={(val) => setAnswer(q._id, val)}
          instantResult={getResult(q._id)}
          onInstantConfirm={handleInstantConfirm}
        />
      ))}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 px-4 shadow-lg mt-6">
        {examSubmitted ? (
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-green-700">
                ✅ {examResults?.results?.filter((r) => r.correct).length || 0}/{total} 正确
              </span>
              <span className="text-gray-400 ml-3">
                正确率 {total > 0 ? Math.round(((examResults?.results?.filter((r) => r.correct).length || 0) / total) * 100) : 0}%
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate('/wrong')} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600">查看错题</button>
              <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">返回首页</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">已答 {answered}/{total} 题</span>
            <button onClick={handleSubmit} disabled={submitting || answered === 0}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >{submitting ? '提交中...' : '📥 提交全部'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
