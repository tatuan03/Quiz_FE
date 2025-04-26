import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Quiz = () => {
  const { quizId } = useParams();  // Lấy quizId từ URL
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(10).fill(null)); // Giả sử có 10 câu hỏi
  const [timeLeft, setTimeLeft] = useState(1800); // 30 phút
  const navigate = useNavigate();

  const handleSubmit = useCallback(() => {
    const token = localStorage.getItem("token");
  
    const responses = questions.map((q, index) => ({
      questionId: q.id,
      selectedOption: answers[index]
    }));
  
    const payload = {
      testId: quizId, // phải là Number nếu cần
      userId: "currentUserId", // cần lấy từ context hoặc token decode
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
      .then(res => res.json())
      .then(result => {
        navigate(`/quiz/${quizId}/result`, { state: { result } });
      })
      .catch(err => {
        console.error("Gửi kết quả thất bại:", err);
      });
  }, [answers, questions, quizId, navigate]);

  // Lấy câu hỏi từ API khi quizId thay đổi
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Không tìm thấy token. Vui lòng đăng nhập.");
      setLoading(false);
      return;
    }

    fetch(`https://final-quiz-server.onrender.com/identity/tests/${quizId}/questions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy câu hỏi", err);
        setError("Không thể tải câu hỏi.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [quizId]);

  useEffect(() => {
    if (!loading) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answer) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = answer;
    setAnswers(updatedAnswers);
  };

  const nextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    }
  };

  if (loading) {
    return <div>Đang tải câu hỏi...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!questions[questionIndex]) {
    return <div>Không có câu hỏi cho quiz này.</div>;
  }

  const question = questions[questionIndex];

  return (
    <section className="bg-dark text-white" style={{ display: "block", minHeight: "100vh", padding: "20px 0" }}>
      <div className="container">
        <div className="row align-items-center justify-content-center" style={{ minHeight: "90vh" }}>
          <div className="col-lg-8">
            <div
              className="card p-4"
              style={{
                background: "linear-gradient(145deg, #3d3d3d, #2a2a2a)",
                border: "none",
                borderRadius: "15px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-white" style={{ fontWeight: "500" }}>
                  {question.questionText}
                </h4>
                <div className="d-flex flex-column align-items-end">
                  <span
                    className="badge bg-warning text-dark mb-2"
                    style={{ fontSize: "1rem", padding: "8px 15px" }}
                  >
                    ⏳ {formatTime(timeLeft)}
                  </span>
                  <span className="badge bg-success" style={{ fontSize: "1rem", padding: "8px 15px" }}>
                    {questionIndex + 1} / {questions.length}
                  </span>
                </div>
              </div>

              <div className="options-container">
                {["A", "B", "C", "D"].map((letter, index) => (
                  <button
                    key={index}
                    className={`option-btn d-flex align-items-center w-100 text-start btn py-3 px-4 mb-3 rounded-pill ${
                      answers[questionIndex] === question[`option${letter}`] ? "btn-primary" : "btn-outline-light"
                    }`}
                    onClick={() => handleAnswerSelect(question[`option${letter}`])}
                    disabled={answers[questionIndex] !== null}
                    style={{
                      transition: "all 0.3s ease",
                      borderWidth: "2px",
                    }}
                  >
                    <span
                      className="option-letter me-3"
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: answers[questionIndex] === question[`option${letter}`] ? "white" : "transparent",
                        color: answers[questionIndex] === question[`option${letter}`] ? "var(--bs-primary)" : "white",
                        fontWeight: "bold",
                        border: answers[questionIndex] === question[`option${letter}`] ? "none" : "2px solid white",
                      }}
                    >
                      {letter}
                    </span>
                    {question[`option${letter}`]}
                  </button>
                ))}
              </div>

              <div className="d-flex justify-content-between mt-4 pt-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2 rounded-pill"
                  onClick={previousQuestion}
                  disabled={questionIndex === 0}
                  style={{ minWidth: "120px" }}
                >
                  ← Previous
                </button>
                {questionIndex === questions.length - 1 ? (
                  <button
                    type="button"
                    className="btn btn-success px-4 py-2 rounded-pill"
                    onClick={() => handleSubmit()}
                    style={{ minWidth: "120px" }}
                  >
                    Submit ✓
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary px-4 py-2 rounded-pill"
                    onClick={nextQuestion}
                    style={{ minWidth: "120px" }}
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4 mt-4 mt-lg-0">
            <div
              className="card p-3"
              style={{
                background: "linear-gradient(145deg, #2c2c2c, #1f1f1f)",
                border: "none",
                borderRadius: "15px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
              }}
            >
              <h5 className="text-white mb-3" style={{ fontWeight: "500" }}>
                Question Navigator
              </h5>
              <div className="questions-grid">
                {questions.map((q, index) => (
                  <button
                    key={index}
                    className={`question-btn ${
                      answers[index] !== null ? "answered" : "unanswered"
                    } ${questionIndex === index ? "current" : ""}`}
                    onClick={() => setQuestionIndex(index)}
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "12px",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "5px",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      transition: "all 0.3s ease",
                      backgroundColor: answers[index] !== null ? "#4e9af1" : "#444",
                      color: "white",
                      boxShadow:
                        answers[index] !== null ? "0 4px 8px rgba(78, 154, 241, 0.3)" : "none",
                      ...(questionIndex === index && {
                        border: "3px solid #60d600",
                        transform: "scale(1.05)",
                      }),
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-2 d-flex justify-content-between">
                <span className="text-muted">Total: {questions.length}</span>
                <span className="text-primary">Answered: {answers.filter((a) => a !== null).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .options-container {
          max-height: 400px;
          overflow-y: auto;
          padding-right: 10px;
        }

        .options-container::-webkit-scrollbar {
          width: 6px;
        }

        .options-container::-webkit-scrollbar-thumb {
          background-color: #888;
          border-radius: 10px;
        }

        .questions-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }

        .question-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: bold;
          color: white;
          background-color: #444;
          transition: all 0.3s ease;
        }

        .question-btn.current {
          background-color: #60d600;
          transform: scale(1.05);
        }

        .question-btn.answered {
          background-color: #4e9af1;
        }

        .question-btn.unanswered {
          background-color: #444;
        }
      `}</style>
    </section>
  );
};

export default Quiz;
