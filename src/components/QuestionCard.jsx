import useStore from '../store/useStore';
import { useState } from 'react';

const typeLabels = {
  single: '单选题',
  multiple: '多选题',
  judge: '判断题',
  short: '简答题',
};

const typeColors = {
  single: 'bg-blue-50 text-blue-700 border-blue-200',
  multiple: 'bg-purple-50 text-purple-700 border-purple-200',
  judge: 'bg-green-50 text-green-700 border-green-200',
  short: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function QuestionCard({
  question,
  index,
  showResult,
  userAnswer,
  onAnswer,
  instantResult,      // { correct, correctAnswer } for instant mode
  onInstantConfirm,   // (questionId, answer) => void for instant mode
}) {
  const examMode = useStore((s) => s.examMode); // We'll pass this as prop instead
  const [multiConfirm, setMultiConfirm] = useState(false);

  const isMulti = question.type === 'multiple';
  const isInstant = examMode === 'instant' && !showResult;

  let borderColor = 'border-gray-200';
  if (showResult) {
    borderColor = instantResult?.correct ? 'border-green-400' : 'border-red-400';
  } else if (isInstant && instantResult) {
    borderColor = instantResult.correct ? 'border-green-400' : 'border-red-400';
  }

  const handleClick = (letter) => {
    if (showResult || instantResult) return;
    if (isMulti) {
      const current = userAnswer ? userAnswer.split('') : [];
      const next = current.includes(letter)
        ? current.filter((l) => l !== letter)
        : [...current, letter];
      onAnswer(next.sort().join(''));
      setMultiConfirm(false);
    } else {
      onAnswer(letter);
      // Single choice: auto confirm in instant mode
      if (isInstant && onInstantConfirm) {
        onInstantConfirm(question._id, letter);
      }
    }
  };

  const handleMultiConfirm = () => {
    if (onInstantConfirm && userAnswer) {
      onInstantConfirm(question._id, userAnswer);
      setMultiConfirm(true);
    }
  };

  const hasResult = Boolean(showResult || instantResult);

  return (
    <div className={`bg-white rounded-lg border ${borderColor} p-5 mb-4 shadow-sm`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded border ${typeColors[question.type] || 'bg-gray-50 text-gray-600 border-gray-200'}`}
        >
          {typeLabels[question.type] || question.type}
        </span>
        {hasResult && instantResult && (
          <span className={`text-sm font-medium ${instantResult.correct ? 'text-green-600' : 'text-red-600'}`}>
            {instantResult.correct ? '✓ 正确' : '✗ 错误'}
          </span>
        )}
      </div>

      {/* Question text */}
      <p className="text-base text-gray-900 mb-4 leading-relaxed">{question.question}</p>

      {/* Options */}
      {question.type !== 'short' && question.options?.length > 0 && (
        <div className="space-y-2">
          {question.options.map((opt, oi) => {
            const letter = String.fromCharCode(65 + oi);
            const isSelected = isMulti
              ? userAnswer?.includes(letter)
              : userAnswer === letter;

            const isCorrectOption = hasResult && instantResult?.correctAnswer?.includes(letter);

            let optBorder = 'border-gray-200';
            let optBg = isSelected ? 'bg-indigo-50 border-indigo-400' : 'bg-white';

            if (hasResult && instantResult) {
              if (isCorrectOption) {
                optBorder = 'border-green-400';
                optBg = 'bg-green-50';
              }
              if (isSelected && !instantResult.correct && !isCorrectOption) {
                optBorder = 'border-red-400';
                optBg = 'bg-red-50';
              }
            }

            return (
              <button
                key={oi}
                onClick={() => handleClick(letter)}
                disabled={hasResult}
                className={`w-full text-left px-4 py-2.5 rounded-lg border ${optBorder} ${optBg} transition-colors text-sm ${
                  hasResult ? 'cursor-default' : 'cursor-pointer hover:border-indigo-300'
                }`}
              >
                <span className="font-medium mr-2">{letter}.</span>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Short answer */}
      {question.type === 'short' && (
        <textarea
          value={userAnswer || ''}
          onChange={(e) => onAnswer(e.target.value)}
          disabled={hasResult}
          rows={3}
          className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-400 disabled:bg-gray-50"
          placeholder="请输入你的答案..."
        />
      )}

      {/* Multi-choice confirm button */}
      {isMulti && isInstant && !hasResult && userAnswer && userAnswer.length > 0 && (
        <button
          onClick={handleMultiConfirm}
          className="mt-3 px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
        >
          ✅ 确认答案
        </button>
      )}

      {/* Show result feedback */}
      {hasResult && instantResult && !instantResult.correct && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">正确答案：</span>
          <span className="text-sm font-medium text-green-700">{instantResult.correctAnswer}</span>
        </div>
      )}
    </div>
  );
}
