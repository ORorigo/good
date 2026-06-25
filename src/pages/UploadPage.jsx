import { useState, useRef } from 'react';
import { questionApi } from '../api';
import useStore from '../store/useStore';

export default function UploadPage() {
  const sessionId = useStore((s) => s.sessionId);
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    if (tags.trim()) formData.append('tags', tags);

    try {
      const res = await questionApi.upload(formData);
      setResult(res.data);
      setFile(null);
      setTags('');
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.error || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">📤 上传题库</h1>
      <p className="text-sm text-gray-400 mb-6">
        支持 .docx 格式，自动解析选择题、判断题和简答题
      </p>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        {/* Format guide */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p className="font-medium text-gray-800 mb-2">📌 文档格式要求：</p>
          <ul className="list-disc list-inside space-y-1">
            <li>每道题以数字序号开头，如 <code className="bg-gray-200 px-1 rounded">1. 题目内容</code></li>
            <li>选项以 A. / B. / C. / D. 开头</li>
            <li>答案以 <code className="bg-gray-200 px-1 rounded">答案：X</code> 格式标注</li>
            <li>判断题答案写 <code className="bg-gray-200 px-1 rounded">答案：对</code> 或 <code className="bg-gray-200 px-1 rounded">答案：错</code></li>
            <li>多选题答案写字母组合，如 <code className="bg-gray-200 px-1 rounded">答案：AC</code></li>
            <li>简答题无需选项，直接写答案</li>
          </ul>
        </div>

        {/* File input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">选择 .docx 文件</label>
          <input
            ref={inputRef}
            type="file"
            accept=".docx"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标签（可选，多个用逗号分隔）
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="例如：数学, 代数, 高考"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? '⏳ 解析中...' : '📤 上传并解析'}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium mb-2">✅ {result.message}</p>
            <div className="text-sm text-green-700 space-y-1">
              {result.questions?.map((q, i) => (
                <div key={q._id || i} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>
                    [{ { single: '单选', multiple: '多选', judge: '判断', short: '简答' }[q.type] || q.type }]
                    {' '}
                    {q.question.slice(0, 50)}{q.question.length > 50 ? '...' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
