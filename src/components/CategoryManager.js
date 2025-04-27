import React, { useState, useEffect } from "react";
import "./CategoryManager.css";
import { useNavigate } from "react-router-dom";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false); // Quản lý modal thêm category
  const [newCategory, setNewCategory] = useState({ name: "", description: "" }); // Quản lý dữ liệu category mới
  const navigate = useNavigate();
  // Fetch danh sách category
  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Không tìm thấy token. Vui lòng đăng nhập.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://final-quiz-server.onrender.com/identity/categories",
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
          errorData.message || "Không thể lấy danh sách category."
        );
      }

      const data = await response.json();
      console.log("Danh sách category từ API:", data);

      // Cập nhật state với dữ liệu trả về
      setCategories(data || []); // Không cần `data.result` vì dữ liệu là mảng trực tiếp
    } catch (err) {
      console.error("Lỗi khi lấy danh sách category:", err);
      setError(err.message || "Không thể lấy danh sách category.");
    } finally {
      setLoading(false); // Đảm bảo trạng thái loading được cập nhật
    }
  };

  useEffect(() => {
    console.log("CategoryManager mounted");
    fetchCategories();
  }, []);

  // Thêm category mới
  const handleAddCategory = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Không tìm thấy token. Vui lòng đăng nhập.");
      return;
    }

    try {
      const response = await fetch(
        "https://final-quiz-server.onrender.com/identity/categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newCategory), // Gửi cả tên và mô tả
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi khi thêm category:", errorData);
        throw new Error(errorData.message || "Không thể thêm category.");
      }

      console.log("Category mới đã được thêm.");
      setNewCategory({ name: "", description: "" }); // Reset dữ liệu
      setShowAddModal(false); // Đóng modal
      fetchCategories(); // Cập nhật danh sách category
    } catch (err) {
      console.error("Lỗi khi thêm category:", err);
      setError(err.message || "Không thể thêm category.");
    }
  };

  // Sửa category
  const handleEditCategory = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Không tìm thấy token. Vui lòng đăng nhập.");
      return;
    }

    try {
      const response = await fetch(
        `https://final-quiz-server.onrender.com/identity/categories/${editingCategory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: editingCategory.id, // Gửi ID
            name: editingCategory.name, // Gửi tên category
            description: editingCategory.description, // Gửi mô tả category
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi khi sửa category:", errorData);
        throw new Error(errorData.message || "Không thể sửa category.");
      }

      console.log("Category đã được sửa.");
      setShowEditModal(false); // Đóng modal
      setEditingCategory(null); // Reset dữ liệu
      fetchCategories(); // Cập nhật danh sách category
    } catch (err) {
      console.error("Lỗi khi sửa category:", err);
      setError(err.message || "Không thể sửa category.");
    }
  };

  // Xóa category
  const handleDeleteCategory = async (categoryId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Không tìm thấy token. Vui lòng đăng nhập.");
      return;
    }

    try {
      const response = await fetch(
        `https://final-quiz-server.onrender.com/identity/categories/${categoryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi khi xóa category:", errorData);
        throw new Error(errorData.message || "Không thể xóa category.");
      }

      console.log("Category đã được xóa.");
      fetchCategories(); // Cập nhật danh sách category
    } catch (err) {
      console.error("Lỗi khi xóa category:", err);
      setError(err.message || "Không thể xóa category.");
    }
  };

  if (loading) return <div>Đang tải danh sách category...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="category-manager">
      <h1>Quản lý Category</h1>
      <button
        className="btn-back"
        onClick={() => navigate("/main-dashboard")} // Điều hướng về MainDashboard
      >
        Quay lại
      </button>
      {/* Thêm category */}
      <div className="add-category">
        <button onClick={() => setShowAddModal(true)}>Thêm Category</button>
      </div>

      {/* Danh sách category */}
      <div className="category-list">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Category</th>
              <th>Mô tả</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>{category.description}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => {
                        setEditingCategory(category);
                        setShowEditModal(true);
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      Xóa
                    </button>
                    <button
                      className="btn-manage-tests"
                      onClick={() => navigate(`/category/${category.id}/tests`)}
                    >
                      Quản lý bài test
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">Không có category nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Modal sửa category */}
      {showEditModal && (
        <div className="edit-modal">
          <div className="modal-content">
            <h2>Sửa Category</h2>
            <input
              type="text"
              placeholder="Tên category"
              value={editingCategory.name}
              onChange={(e) =>
                setEditingCategory({ ...editingCategory, name: e.target.value })
              }
            />
            <textarea
              placeholder="Mô tả category"
              value={editingCategory.description}
              onChange={(e) =>
                setEditingCategory({
                  ...editingCategory,
                  description: e.target.value,
                })
              }
            />
            <div className="modal-actions">
              <button onClick={handleEditCategory}>Lưu</button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCategory(null);
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm category */}
      {showAddModal && (
        <div className="add-modal">
          <div className="modal-content">
            <h2>Thêm Category</h2>
            <input
              type="text"
              placeholder="Tên category"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
            />
            <textarea
              placeholder="Mô tả category"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
            />
            <div className="modal-actions">
              <button onClick={handleAddCategory}>Thêm</button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCategory({ name: "", description: "" });
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

export default CategoryManager;
