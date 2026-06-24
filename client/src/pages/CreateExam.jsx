import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examApi, questionApi } from '../api';

const questionTypes = [
  { value: 'single', label: '单选题' },
  { value: 'multiple', label: '多选题' },
  { value: 'judge', label: '判断题' },
  { value: 'short', label: '简答题' },
];

export default function CreateExam() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const [selectedTypes, setSelectedTypes] = useState(['single']);
  const [counts, setCounts] = useState({ single: 10, multiple: 0, judge: 0, short: 0 });
  const [totalAvailable, setTotalAvailable] = useState({});
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Fetch available counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const counts = {};
        for (const t of questionTypes) {
          const res = await questionApi.list({ type: t.value, limit: 1 });
          counts[t.value] = res.data.total;
        }
        setTotalAvailable(counts);
      } catch {}
    };
    fetchCounts();
  }, []);

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('请填写试卷名称');
      return;
    }
    if (selectedTypes.length === 0) {
      setError('请至少选择一种题型');
      return;
    }

    // Validate counts
    const total = selectedTypes.reduce((sum, t) => sum + (counts[t] || 0), 0);
    if (total === 0) {
      setError('请设置至少一道题目');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const res = await examApi.create({
        title: title.trim(),
        questionTypes: selectedTypes,
        counts,
        timeLimit: timeLimit > 0 ? timeLimit : 0,
      });
      navigate(`/exam/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || '创建试卷失败');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">📄 创建试卷</h1>
      <p className="text-sm text-gray-400 mb-6">选择题型、题目数量和限时，系统将随机抽题组成试卷</p>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">试卷名称</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：数学模拟卷"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>

        {/* Time limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            限时（分钟，0 表示不限时）
          </label>
          <input
            type="number"
            min={0}
            max={180}
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>

        {/* Question types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">选择题型</label>
          <div className="flex flex-wrap gap-2">
            {questionTypes.map((t) => (
              <button
                key={t.value}
                onClick={() => toggleType(t.value)}
                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                  selectedTypes.includes(t.value)
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {t.label}
                {totalAvailable[t.value] !== undefined && (
                  <span className="ml-1.5 text-xs text-gray-400">
                    (题库 {totalAvailable[t.value]} 道)
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Counts */}
        {selectedTypes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">各题型抽题数量</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {selectedTypes.map((t) => {
                const label = questionTypes.find((qt) => qt.value === t)?.label || t;
                const max = totalAvailable[t] || 0;
                return (
                  <div key={t}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    <input
                      type="number"
                      min={0}
                      max={max}
                      value={counts[t] || 0}
                      onChange={(e) =>
                        setCounts((prev) => ({ ...prev, [t]: Math.max(0, Math.min(max, Number(e.target.value))) }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
          总计：{selectedTypes.reduce((sum, t) => sum + (counts[t] || 0), 0)} 题
          {timeLimit > 0 ? ` · 限时 ${timeLimit} 分钟` : ' · 不限时'}
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={creating}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {creating ? '⏳ 生成中...' : '🚀 生成试卷'}
        </button>
      </div>
    </div>
  );
}
