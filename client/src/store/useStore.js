import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// sessionId 只存 localStorage，不经过 Zustand persist，避免覆盖
function getSessionId() {
  let sid = localStorage.getItem('quiz_session_id');
  if (!sid) {
    sid = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    localStorage.setItem('quiz_session_id', sid);
  }
  return sid;
}

const useStore = create(
  persist(
    (set, get) => ({
      sessionId: getSessionId(),
      currentExam: null,
      examMode: 'instant',
      answers: {},
      instantResults: {},
      examResults: null,
      examSubmitted: false,
      timeRemaining: null,
      loading: false,
      error: null,

      setSessionId: (id) => {
        localStorage.setItem('quiz_session_id', id);
        set({ sessionId: id });
      },

      setCurrentExam: (exam) =>
        set((state) => {
          const sameExam = state.currentExam?._id === exam?._id;
          return {
            currentExam: exam,
            answers: sameExam ? state.answers : {},
            instantResults: sameExam ? state.instantResults : {},
            examResults: sameExam ? state.examResults : null,
            examSubmitted: sameExam ? state.examSubmitted : false,
            timeRemaining: sameExam
              ? state.timeRemaining
              : exam?.timeLimit
                ? exam.timeLimit * 60
                : null,
          };
        }),

      setExamMode: (mode) => set({ examMode: mode }),

      setAnswer: (questionId, answer) =>
        set((state) => ({ answers: { ...state.answers, [questionId]: answer } })),

      setInstantResult: (questionId, result) =>
        set((state) => ({ instantResults: { ...state.instantResults, [questionId]: result } })),

      setExamResults: (results) => set({ examResults: results }),
      submitExam: () => set({ examSubmitted: true }),
      setTimeRemaining: (t) => set({ timeRemaining: t }),
      setLoading: (v) => set({ loading: v }),
      setError: (e) => set({ error: e }),

      loadProgress: (progress) =>
        set({
          answers: progress.answers || {},
          instantResults: progress.instantResults || {},
          examSubmitted: progress.examSubmitted || false,
          examResults: progress.examResults || null,
        }),

      resetExam: () =>
        set({
          currentExam: null,
          answers: {},
          instantResults: {},
          examResults: null,
          examSubmitted: false,
          timeRemaining: null,
        }),

      getAnswer: (questionId) => get().answers[questionId] || '',
    }),
    {
      name: 'quiz-store',
      // sessionId 不经过 persist，直接从 localStorage 读
      partialize: (state) => ({
        examMode: state.examMode,
        currentExam: state.currentExam,
      }),
    }
  )
);

export default useStore;
