import { createContext, useState, useEffect } from "react";

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
  const [quizs, setQuizs] = useState([]);
  const [marks, setMarks] = useState(0);
  const [showStart, setShowStart] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [testLevel, setTestLevel] = useState(null); // Level của bài test

  // Fetch dữ liệu từ API theo level được chọn
  useEffect(() => {
    if (testLevel != null) {
      fetch(`http://localhost:9192/api/test/${testLevel}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.questions) {
            setQuizs(data.questions);
          }
        })
        .catch((error) => console.error("Error fetching quiz data:", error));
    }
  }, [testLevel]);

  // Chọn level và bắt đầu quiz
  const startQuiz = (level) => {
    setTestLevel(level);
    setShowStart(false);
    setShowQuiz(true);
    setShowResult(false); // Reset lại trạng thái kết quả khi bắt đầu
  };

  // Hiển thị kết quả
  const showTheResult = () => {
    setShowResult(true);
    setShowQuiz(false);
  };

  const startOver = () => {
    setShowStart(true);
    setShowQuiz(false);
    setShowResult(false);
    setMarks(0);
    setTestLevel(null);
  };

  return (
    <DataContext.Provider
      value={{
        startQuiz,
        showStart,
        showQuiz,
        quizs,
        marks,
        setMarks, // 👈 Thêm setMarks vào để sử dụng trong Quiz.js
        showResult,
        startOver,
        setShowStart,
        setShowQuiz,
        setShowResult,
        showTheResult
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
