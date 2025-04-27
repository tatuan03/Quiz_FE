import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getValidAccessToken } from "../services/authService";
import Auth from "./Auth"; // Import the Auth component
import "./CategoryList.css"; // Import your CSS file for styling

const CategoryList = ({ user }) => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [isLoginModalVisible, setLoginModalVisible] = useState(false); // Modal state
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const showLoginModal = () => {
    setLoginModalVisible(true);
  };

  const hideLoginModal = () => {
    setLoginModalVisible(false);
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        setLoginModalVisible(true); // Hiển thị modal đăng nhập
        return;
      }

      const response = await fetch(
        "https://final-quiz-server.onrender.com/identity/categories",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch categories");

      const data = await response.json();
      setCategories(Array.isArray(data) ? data : data.result);
      setError(null);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories when the component mounts or when `user` changes
  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Chọn chủ đề</h2>

      {error && (
        <div className="alert alert-danger text-center">
          {error.includes("Unauthorized")
            ? "Vui lòng đăng nhập để tiếp tục."
            : error}
        </div>
      )}

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row category-row">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div
                key={category.id}
                className="col-md-4 category-card"
                onClick={() => handleCategoryClick(category.id)}
                style={{
                  cursor: "pointer",
                  background: "#f5f5f5",
                  padding: 20,
                  borderRadius: 10,
                }}
              >
                <h5>{category.title}</h5>
                <p className="text-muted">{category.description}</p>
              </div>
            ))
          ) : (
            <p className="text-center">
              No categories available or failed to load.
            </p>
          )}
        </div>
      )}

      {/* Login Modal */}
      {isLoginModalVisible && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-modal" onClick={hideLoginModal}>
              &times;
            </button>
            <Auth
              closeModal={hideLoginModal}
              setUser={() => {
                setLoginModalVisible(false);
                // Reload categories after login
                fetchCategories();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
