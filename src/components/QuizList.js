import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const QuizList = () => {
  const { categoryId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Lấy danh sách quiz theo categoryId
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Không tìm thấy token. Vui lòng đăng nhập.");
      setLoading(false);
      return;
    }

    fetch("https://final-quiz-server.onrender.com/identity/tests", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((quiz) => quiz.categoryId === Number(categoryId));
        setQuizzes(filtered);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy quiz", err);
        setError("Không thể tải quiz.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [categoryId]);

  const handleQuizSelect = (quizId) => {
    // Điều hướng đến trang quiz khi người dùng chọn quiz
    navigate(`/quiz/${quizId}`);  // Điều hướng đến trang quiz
  };

  if (loading) {
    return <div>Đang tải quiz...</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Danh sách bài kiểm tra</h2>

      {/* Nút quay lại */}
      <button
        className="btn btn-outline-primary mb-4"
        onClick={() => navigate(-1)} // Quay lại trang trước
      >
        Quay lại
      </button>

      {error && <div className="alert alert-danger">{error}</div>}

      {quizzes.length === 0 ? (
        <p>Không có bài nào trong chủ đề này.</p>
      ) : (
        <ul className="list-group">
          {quizzes.map((quiz) => (
            <li key={quiz.id} className="list-group-item">
              <h5>{quiz.title}</h5>
              <p>{quiz.description}</p>
              <small>Thời gian: {quiz.time} phút</small>
              <button
                className="btn btn-primary mt-2"
                onClick={() => handleQuizSelect(quiz.id)} // Chọn quiz
              >
                Bắt đầu quiz
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuizList;
