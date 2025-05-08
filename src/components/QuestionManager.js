import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./QuestionManager.css"; // Import CSS cho QuestionManager
const QuestionManager = () => {
  const { testId } = useParams(); // Lấy testId từ URL
  const navigate = useNavigate(); // Khởi tạo hook navigate để điều hướng
  const [questions, setQuestions] = useState([]); // Quản lý danh sách câu hỏi
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
  const [error, setError] = useState(null); // Quản lý lỗi
  const [showAddModal, setShowAddModal] = useState(false); // Hiển thị modal thêm câu hỏi
  const [showEditModal, setShowEditModal] = useState(false); // Hiển thị modal sửa câu hỏi
  const [editingQuestion, setEditingQuestion] = useState(null); // Quản lý câu hỏi đang được sửa
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "",
  }); // Quản lý dữ liệu câu hỏi mới
  // Gọi API để lấy danh sách câu hỏi
  // Ghi nhớ hàm fetchQuestions để tránh tạo lại mỗi lần render
  const fetchQuestions = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Không tìm thấy token. Vui lòng đăng nhập.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://final-quiz-server.onrender.com/identity/tests/${testId}/questions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi từ API:", errorData);
        throw new Error(
          errorData.message || "Không thể lấy danh sách câu hỏi."
        );
      }

      const data = await response.json();
      setQuestions(data.questions);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách câu hỏi:", err);
      setError(err.message || "Không thể lấy danh sách câu hỏi.");
    } finally {
      setLoading(false);
    }
  }, [testId]); // testId là phụ thuộc của useCallback

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]); // Thêm fetchQuestions vào mảng phụ thuộc

  // Hàm xử lý khi người dùng nhấn nút "Thêm câu hỏi"
  const handleAddQuestion = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Không tìm thấy token. Vui lòng đăng nhập.");
      return;
    }

    try {
      const response = await fetch(
        `https://final-quiz-server.onrender.com/identity/tests/${testId}/questions`, // Sử dụng testId từ URL
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newQuestion), // Gửi dữ liệu câu hỏi mới
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi khi thêm câu hỏi:", errorData);
        throw new Error(errorData.message || "Không thể thêm câu hỏi.");
      }

      console.log("Câu hỏi mới đã được thêm.");
      setShowAddModal(false); // Đóng modal
      setNewQuestion({
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOption: "",
      }); // Reset dữ liệu câu hỏi mới
      fetchQuestions(); // Cập nhật danh sách câu hỏi
    } catch (err) {
      console.error("Lỗi khi thêm câu hỏi:", err);
      setError(err.message || "Không thể thêm câu hỏi.");
    }
  };

  // Hàm xử lý khi người dùng nhấn nút "Sửa câu hỏi"
  const handleEditQuestion = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Không tìm thấy token. Vui lòng đăng nhập.");
      return;
    }

    try {
      const response = await fetch(
        `https://final-quiz-server.onrender.com/identity/questions/${editingQuestion.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingQuestion),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi khi sửa câu hỏi:", errorData);
        throw new Error(errorData.message || "Không thể sửa câu hỏi.");
      }

      console.log("Câu hỏi đã được sửa.");
      setShowEditModal(false); // Đóng modal
      setEditingQuestion(null); // Reset câu hỏi đang sửa
      fetchQuestions(); // Cập nhật danh sách câu hỏi
    } catch (err) {
      console.error("Lỗi khi sửa câu hỏi:", err);
      setError(err.message || "Không thể sửa câu hỏi.");
    }
  };

  // Hàm xử lý khi người dùng nhấn nút "Xóa câu hỏi"
  const handleDeleteQuestion = async (questionId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Không tìm thấy token. Vui lòng đăng nhập.");
      return;
    }

    try {
      const response = await fetch(
        `https://final-quiz-server.onrender.com/identity/questions/${questionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi khi xóa câu hỏi:", errorData);
        throw new Error(errorData.message || "Không thể xóa câu hỏi.");
      }

      console.log("Câu hỏi đã được xóa.");
      fetchQuestions(); // Cập nhật danh sách câu hỏi
    } catch (err) {
      console.error("Lỗi khi xóa câu hỏi:", err);
      setError(err.message || "Không thể xóa câu hỏi.");
    }
  };

  if (loading) return <div>Đang tải danh sách câu hỏi...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="question-manager">
      <h1>Quản lý câu hỏi cho Test ID: {testId}</h1>
      <button className="btn-back" onClick={() => navigate(-1)}>
        Quay lại
      </button>
      <button className="btn-add" onClick={() => setShowAddModal(true)}>
        Thêm câu hỏi
      </button>
      {questions.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Câu hỏi</th>
              <th>Lựa chọn A</th>
              <th>Lựa chọn B</th>
              <th>Lựa chọn C</th>
              <th>Lựa chọn D</th>
              <th>Đáp án đúng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id}>
                <td>{question.id}</td>
                <td>{question.questionText}</td>
                <td>{question.optionA}</td>
                <td>{question.optionB}</td>
                <td>{question.optionC}</td>
                <td>{question.optionD}</td>
                <td>{question.correctOption}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => {
                      setEditingQuestion(question); // Gán câu hỏi đang sửa
                      setShowEditModal(true); // Hiển thị modal sửa
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteQuestion(question.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>Không có câu hỏi nào trong bài test này.</div>
      )}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Thêm Câu Hỏi</h2>
            <input
              type="text"
              placeholder="Nội dung câu hỏi"
              value={newQuestion.questionText}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, questionText: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Lựa chọn A"
              value={newQuestion.optionA}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, optionA: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Lựa chọn B"
              value={newQuestion.optionB}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, optionB: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Lựa chọn C"
              value={newQuestion.optionC}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, optionC: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Lựa chọn D"
              value={newQuestion.optionD}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, optionD: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Đáp án đúng"
              value={newQuestion.correctOption}
              onChange={(e) =>
                setNewQuestion({
                  ...newQuestion,
                  correctOption: e.target.value,
                })
              }
            />
            <div className="modal-actions">
              <button onClick={handleAddQuestion}>Thêm</button>
              <button onClick={() => setShowAddModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Sửa Câu Hỏi</h2>
            <input
              type="text"
              placeholder="Nội dung câu hỏi"
              value={newQuestion.questionText}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, questionText: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Lựa chọn A"
              value={newQuestion.optionA}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, optionA: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Lựa chọn B"
              value={newQuestion.optionB}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, optionB: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Lựa chọn C"
              value={newQuestion.optionC}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, optionC: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Lựa chọn D"
              value={newQuestion.optionD}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, optionD: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Đáp án đúng"
              value={newQuestion.correctOption}
              onChange={(e) =>
                setNewQuestion({
                  ...newQuestion,
                  correctOption: e.target.value,
                })
              }
            />
            <div className="modal-actions">
              <button onClick={handleEditQuestion}>Sửa</button>
              <button onClick={() => setShowAddModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManager;
