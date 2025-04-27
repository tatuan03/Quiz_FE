import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showManagement, setShowManagement] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Không tìm thấy token. Vui lòng đăng nhập.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://final-quiz-server.onrender.com/identity/users",
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
          errorData.message || "Không thể lấy danh sách người dùng."
        );
      }

      const data = await response.json();
      console.log("Dữ liệu người dùng từ API:", data);
      setUsers(data.result || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách người dùng:", err);
      setError(err.message || "Không thể lấy danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setEditingUser({
        id: user.id,
        username: user.username,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        dob: user.dob || "",
        roles: user.roles.map((role) => role.name) || ["USER"], // Đảm bảo roles là mảng
      });
      setShowEditModal(true);
    }
  };

  const handleSaveUser = async () => {
    if (!editingUser.roles || editingUser.roles.length === 0) {
      setError("Vai trò không được để trống.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Không tìm thấy token. Vui lòng đăng nhập.");
      return;
    }

    try {
      const response = await fetch(
        `https://final-quiz-server.onrender.com/identity/users/${editingUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            password: "bonmap2003",
            firstName: editingUser.firstName,
            lastName: editingUser.lastName,
            dob: editingUser.dob,
            roles: editingUser.roles,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi khi cập nhật người dùng:", errorData);
        throw new Error(errorData.message || "Không thể cập nhật người dùng.");
      }

      console.log("Người dùng đã được cập nhật thành công.");
      setShowEditModal(false);
      setEditingUser(null);

      // Gọi lại fetchUsers để cập nhật danh sách
      await fetchUsers();
    } catch (err) {
      console.error("Lỗi khi cập nhật người dùng:", err);
      setError(err.message || "Không thể cập nhật người dùng.");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Đang tải danh sách người dùng...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-overview" onClick={() => setShowManagement(!showManagement)}>
        <div className="total-users-card">
          <h2>Tổng số người dùng</h2>
          <div className="total-count">{users.length}</div>
          <div className="click-hint">Nhấn để quản lý người dùng</div>
        </div>
      </div>

      {/* Nút chuyển hướng đến CategoryManager */}
      <div className="category-management">
        <button
          className="btn-category-manager"
          onClick={() => navigate("/categories")}
        >
          Quản lý Category
        </button>
      </div>

      {showManagement && (
        <div className="management-section">
          <h1>Quản lý người dùng</h1>
          <div className="dashboard-header">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên người dùng</th>
                  <th>Vai trò</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.roles.map((role) => role.name).join(", ")}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEditUser(user.id)}
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="edit-modal">
          <div className="modal-content">
            <h2>Chỉnh sửa người dùng</h2>
            <form>
              <div className="form-group">
                <label>Tên:</label>
                <input
                  type="text"
                  value={editingUser.firstName}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, firstName: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Họ:</label>
                <input
                  type="text"
                  value={editingUser.lastName}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, lastName: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Ngày sinh:</label>
                <input
                  type="date"
                  value={editingUser.dob}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, dob: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Vai trò:</label>
                <select
                  value={editingUser.roles[0]}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, roles: [e.target.value] })
                  }
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-save" onClick={handleSaveUser}>
                  Lưu
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;