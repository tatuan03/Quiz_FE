import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Result = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { quizId, responses } = state || {};

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !quizId || !responses) {
      setError("Thiếu thông tin để tính kết quả.");
      setLoading(false);
      return;
    }

    // Gửi responses lên API để tính kết quả
    const payload = {
      testId: Number(quizId),
      userId: "userId_placeholder", // bạn có thể lấy từ decode JWT hoặc context
      responses
    };

    fetch("https://final-quiz-server.onrender.com/identity/results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((data) => {
        setResult(data);
      })
      .catch((err) => {
        console.error("Lỗi khi gửi kết quả:", err);
        setError("Không thể tính kết quả.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [quizId, responses]);

  if (loading) return <div>Đang tính điểm...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const total = result.responses.length;
  const correct = result.responses.filter((r) => r.isCorrect).length;
  const score = correct * 5;
  const percentage = Math.round((correct / total) * 100);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Kết quả bài làm</h2>
      <p><strong>Điểm:</strong> {score} / {total * 5}</p>
      <p><strong>Trả lời đúng:</strong> {correct} / {total}</p>
      <p><strong>Tỷ lệ đúng:</strong> {percentage}%</p>

      <button className="btn btn-primary mt-4" onClick={() => navigate("/")}>
        Về trang chủ
      </button>
    </div>
  );
};

export default Result;
