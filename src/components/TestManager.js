import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TestManager.css";
const TestManager = () => {
  const { categoryId } = useParams(); // Lấy categoryId từ URL
  const [tests, setTests] = useState([]); // Quản lý danh sách bài test
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
  const [error, setError] = useState(null); // Quản lý lỗi
  const [editingTest, setEditingTest] = useState(null); // Quản lý bài test đang được sửa
  const [showEditModal, setShowEditModal] = useState(false); // Hiển thị modal sửa bài test
  const [showAddTestModal, setShowAddTestModal] = useState(false); // Hiển thị modal thêm bài test
  const [newTest, setNewTest] = useState({
    title: "",
    description: "",
    time: "",
    categoryId: parseInt(categoryId), // Gắn categoryId từ URL
  }); // Quản lý dữ liệu bài test mới

  const navigate = useNavigate();

  // Gọi API để lấy danh sách bài test
  // Ghi nhớ hàm fetchTests để tránh tạo lại mỗi lần render
  const fetchTests = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Không tìm thấy token. Vui lòng đăng nhập.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://final-quiz-server.onrender.com/identity/tests",
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
          errorData.message || "Không thể lấy danh sách bài test."
        );
      }

      const data = await response.json();
      console.log("Danh sách bài test từ API:", data);

      // Lọc bài test theo categoryId
      const filteredTests = data.filter(
        (test) => test.categoryId === parseInt(categoryId)
      );
      setTests(filteredTests);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách bài test:", err);
      setError(err.message || "Không thể lấy danh sách bài test.");
    } finally {
      setLoading(false);
    }
  }, [categoryId]); // Ghi nhớ hàm fetchTests với phụ thuộc categoryId

  const handleDeleteTest = async (testId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Không tìm thấy token. Vui lòng đăng nhập.");
      return;
    }

    try {
      const response = await fetch(
        `https://final-quiz-server.onrender.com/identity/tests/${testId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi khi xóa bài test:", errorData);
        throw new Error(errorData.message || "Không thể xóa bài test.");
      }

      console.log("Bài test đã được xóa.");
      fetchTests(); // Cập nhật danh sách bài test sau khi xóa
    } catch (err) {
      console.error("Lỗi khi xóa bài test:", err);
      setError(err.message || "Không thể xóa bài test.");
    }
  };

  const handleEditTest = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Không tìm thấy token. Vui lòng đăng nhập.");
      return;
    }

    try {
      const response = await fetch(
        `https://final-quiz-server.onrender.com/identity/tests/${editingTest.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingTest),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi khi sửa bài test:", errorData);
        throw new Error(errorData.message || "Không thể sửa bài test.");
      }

      console.log("Bài test đã được sửa.");
      setShowEditModal(false);
      fetchTests(); // Cập nhật danh sách bài test
    } catch (err) {
      console.error("Lỗi khi sửa bài test:", err);
      setError(err.message || "Không thể sửa bài test.");
    }
  };

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleAddTest = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Không tìm thấy token. Vui lòng đăng nhập.");
      return;
    }

    try {
      const response = await fetch(
        "https://final-quiz-server.onrender.com/identity/tests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newTest),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi khi thêm bài test:", errorData);
        throw new Error(errorData.message || "Không thể thêm bài test.");
      }

      console.log("Bài test mới đã được thêm.");
      setShowAddTestModal(false); // Đóng modal
      setNewTest({
        title: "",
        description: "",
        time: "",
        categoryId: parseInt(categoryId),
      }); // Reset dữ liệu bài test mới
      fetchTests(); // Cập nhật danh sách bài test
    } catch (err) {
      console.error("Lỗi khi thêm bài test:", err);
      setError(err.message || "Không thể thêm bài test.");
    }
  };

  if (loading) return <div>Đang tải danh sách bài test...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="test-manager">
      <h1>Quản lý bài test cho Category ID: {categoryId}</h1>
      <button
        className="btn-back"
        onClick={() => navigate("/categories")} // Điều hướng về trang danh sách category
      >
        Quay lại
      </button>

      <button
        className="btn-add-test"
        onClick={() => setShowAddTestModal(true)} // Hiển thị modal thêm bài test
      >
        Thêm bài test
      </button>

      {tests.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Mô tả</th>
              <th>Thời gian (phút)</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test) => (
              <tr key={test.id}>
                <td>{test.id}</td>
                <td>{test.title}</td>
                <td>{test.description}</td>
                <td>{test.time}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => {
                      setEditingTest(test);
                      setShowEditModal(true);
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteTest(test.id)} // Gọi hàm xóa với testId
                  >
                    Xóa
                  </button>
                  <button
                    className="btn-manage-questions"
                    onClick={() => navigate(`/tests/${test.id}/questions`)} // Điều hướng đến trang quản lý câu hỏi
                  >
                    Quản lý câu hỏi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>Không có bài test nào trong category này.</div>
      )}

      {showAddTestModal && (
        <div className="add-modal">
          <div className="modal-content">
            <h2>Thêm Bài Test</h2>
            <input
              type="text"
              placeholder="Tiêu đề bài test"
              value={newTest.title}
              onChange={(e) =>
                setNewTest({ ...newTest, title: e.target.value })
              }
            />
            <textarea
              placeholder="Mô tả bài test"
              value={newTest.description}
              onChange={(e) =>
                setNewTest({ ...newTest, description: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Thời gian (phút)"
              value={newTest.time}
              onChange={(e) =>
                setNewTest({ ...newTest, time: parseInt(e.target.value) })
              }
            />
            <div className="modal-actions">
              <button onClick={handleAddTest}>Thêm</button>
              <button
                onClick={() => {
                  setShowAddTestModal(false);
                  setNewTest({
                    title: "",
                    description: "",
                    time: "",
                    categoryId: parseInt(categoryId),
                  });
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="edit-modal">
          <div className="modal-content">
            <h2>Sửa Bài Test</h2>
            <input
              type="text"
              placeholder="Tiêu đề bài test"
              value={editingTest?.title || ""}
              onChange={(e) =>
                setEditingTest({ ...editingTest, title: e.target.value })
              }
            />
            <textarea
              placeholder="Mô tả bài test"
              value={editingTest?.description || ""}
              onChange={(e) =>
                setEditingTest({ ...editingTest, description: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Thời gian (phút)"
              value={editingTest?.time || ""}
              onChange={(e) =>
                setEditingTest({
                  ...editingTest,
                  time: parseInt(e.target.value),
                })
              }
            />
            <div className="modal-actions">
              <button onClick={handleEditTest}>Lưu</button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTest(null);
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestManager;
