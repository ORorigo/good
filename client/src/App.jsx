import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ExamPage from './pages/ExamPage';
import WrongQuestions from './pages/WrongQuestions';
import UploadPage from './pages/UploadPage';
import CreateExam from './pages/CreateExam';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/exam/:id" element={<ExamPage />} />
        <Route path="/wrong" element={<WrongQuestions />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/create-exam" element={<CreateExam />} />
      </Route>
    </Routes>
  );
}
