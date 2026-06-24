import { useEffect } from 'react';
import useStore from '../store/useStore';

export default function Timer({ onTimeout }) {
  const timeRemaining = useStore((s) => s.timeRemaining);
  const setTimeRemaining = useStore((s) => s.setTimeRemaining);
  const examSubmitted = useStore((s) => s.examSubmitted);

  useEffect(() => {
    if (examSubmitted || timeRemaining === null || timeRemaining <= 0) return;

    const id = setInterval(() => {
      setTimeRemaining(timeRemaining - 1);
    }, 1000);

    return () => clearInterval(id);
  }, [examSubmitted, timeRemaining, setTimeRemaining]);

  useEffect(() => {
    if (timeRemaining === 0 && onTimeout) {
      onTimeout();
    }
  }, [timeRemaining, onTimeout]);

  if (timeRemaining === null) return null;

  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const isUrgent = timeRemaining <= 120;

  return (
    <div
      className={`fixed top-16 right-4 z-10 px-4 py-2 rounded-lg shadow-md text-sm font-mono font-bold ${
        isUrgent ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse' : 'bg-white text-gray-700 border border-gray-200'
      }`}
    >
      ⏱ {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  );
}
