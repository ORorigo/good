import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { examApi } from '../api';
import useStore from '../store/useStore';

export default function Home() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSessionInput, setShowSessionInput] = useState(false);
  const [sessionInput, setSessionInput] = useState('');
  const sessionId = useStore((s) => s.sessionId);
  const setSessionId = useStore((s) => s.setSessionId);
  const setExamMode = useStore((s) => s.setExamMode);

  useEffect(() => {
    examApi.list().then((res) => setExams(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCopySession = () => {
    navigator.clipboard.writeText(sessionId).then(() => alert('已复制同步 ID，在手机上粘贴即可同步答题记录'));
  };

  const handleChangeSession = () => {
    if (sessionInput.trim()) {
      setSessionId(sessionInput.trim());
      setShowSessionInput(false);
      location.reload(); // 刷新确保完全同步
    }
  };

  const shareUrl = `http://172.30.51.160:5173/`;

  return (
    <div>
      {/* 同步入口 */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-indigo-800 text-sm">📱 多设备同步</span>
          <span className="text-xs text-indigo-400">电脑答完手机接着答</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <span>同步 ID：</span>
          <code className="text-xs bg-white px-2 py-1 rounded border border-indigo-200 font-mono select-all">
            {sessionId}
          </code>
          <button onClick={handleCopySession} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">📋 复制</button>
          <button onClick={() => { setSessionInput(sessionId); setShowSessionInput(!showSessionInput); }} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">✏️ 切换</button>
        </div>
        <p className="text-xs text-gray-400">
          手机浏览器打开 <code className="bg-gray-100 px-1 rounded">{shareUrl}</code>，粘贴此 ID 即可同步
        </p>
        {showSessionInput && (
          <div className="mt-2 flex gap-2">
            <input type="text" value={sessionInput} onChange={(e) => setSessionInput(e.target.value)}
              className="flex-1 border border-indigo-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
              placeholder="粘贴电脑上的同步 ID" />
            <button onClick={handleChangeSession} className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 whitespace-nowrap">确认切换</button>
          </div>
        )}
      </div>

      {/* Hero */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 刷题系统</h1>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link to="/create-exam" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">📄 创建试卷</Link>
          <Link to="/wrong" className="px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors shadow-sm">📕 错题集</Link>
          <Link to="/upload" className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm">📤 上传题库</Link>
        </div>
      </div>

      {/* Mode selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 mb-3">⚙️ 答题模式</h2>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="mode" value="instant" defaultChecked onChange={() => setExamMode('instant')} className="text-indigo-600" />
            <span className="text-sm text-gray-700"><span className="font-medium">逐题查看答案</span> — 每做一题立即显示对错</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="mode" value="submit" onChange={() => setExamMode('submit')} className="text-indigo-600" />
            <span className="text-sm text-gray-700"><span className="font-medium">提交后看答案</span> — 做完所有题统一查看结果</span>
          </label>
        </div>
      </div>

      {/* Exam list */}
      <h2 className="text-lg font-bold text-gray-800 mb-3">📋 已有试卷</h2>
      {loading ? <p className="text-gray-400">加载中...</p>
      : exams.length === 0 ? (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-400 mb-2">暂无试卷</p>
          <Link to="/create-exam" className="text-indigo-600 text-sm hover:underline">去创建一份 →</Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {exams.map((exam) => (
            <div key={exam._id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-1">{exam.title}</h3>
              <p className="text-xs text-gray-400 mb-3">
                {exam.timeLimit ? `限时 ${exam.timeLimit} 分钟` : '不限时'}
                {' · '}
                {exam.questionTypes?.map((t) => ({ single: '单选', multiple: '多选', judge: '判断', short: '简答' }[t])).join('、')}
              </p>
              <Link to={`/exam/${exam._id}`} className="inline-block px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors">开始答题</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
