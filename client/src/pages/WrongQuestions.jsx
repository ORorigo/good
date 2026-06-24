import { useEffect, useState } from 'react';
import { wrongApi } from '../api';
import useStore from '../store/useStore';
import QuestionCard from '../components/QuestionCard';

export default function WrongQuestions() {
  const sessionId = useStore((s) => s.sessionId);
  const [wrongList, setWrongList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const fetchWrong = () => {
    setLoading(true);
    wrongApi
      .list(sessionId)
      .then((res) => setWrongList(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWrong();
  }, [sessionId]);

  const handleAnswer = (qId, val) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = async () => {
    const items = wrongList.map((w) => ({
      questionId: w.questionId._id,
      userAnswer: answers[w.questionId._id] || '',
    }));
    try {
      const res = await wrongApi.check({ sessionId, answers: items });
      setResults(res.data);
      setShowResults(true);
      setTimeout(fetchWrong, 500);
    } catch (err) {
      alert('提交失败');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('确定清空所有错题吗？')) return;
    try {
      await wrongApi.clearAll(sessionId);
      setWrongList([]);
    } catch (err) {
      alert('清空失败');
    }
  };

  if (loading) {
    return <p className="text-gray-400 text-center py-10">加载错题集...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-xl font-bold text-gray-900">📕 错题集</h1>
          <p className="text-sm text-gray-400">共 {wrongList.length} 道错题 · 做对后自动移出</p>
        </div>
        {wrongList.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            🗑 清空错题集
          </button>
        )}
      </div>

      {wrongList.length === 0 ? (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center mt-6">
          <p className="text-gray-400 text-lg mb-1">🎉 太棒了！</p>
          <p className="text-gray-400">暂无错题，继续保持！</p>
        </div>
      ) : (
        <>
          {wrongList.map((item, i) => (
            <div key={item._id} className="mb-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-red-400 font-medium">
                  错 {item.wrongCount} 次
                </span>
              </div>
              <QuestionCard
                question={item.questionId}
                index={i}
                showResult={showResults}
                userAnswer={answers[item.questionId._id] || ''}
                onAnswer={(val) => handleAnswer(item.questionId._id, val)}
              />
            </div>
          ))}

          {!showResults && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 px-4 shadow-lg mt-4">
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length === 0}
                className="w-full py-2.5 bg-amber-500 text-white rounded-lg font-medium text-sm hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                提交错题练习
              </button>
            </div>
          )}

          {showResults && (
            <button
              onClick={() => {
                setShowResults(false);
                setResults(null);
                setAnswers({});
              }}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors mt-4"
            >
              再来一次
            </button>
          )}
        </>
      )}
    </div>
  );
}
