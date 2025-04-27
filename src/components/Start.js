import React, { useContext, useState, useEffect } from "react";
import DataContext from "../context/dataContext";
import Auth from "./Auth"; 
import "./Start.css";
import { getValidAccessToken } from "../services/authService";

const Start = ({ user, setUser }) => {
  const { startQuiz, showStart } = useContext(DataContext);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        setUser(null);
        setShowLoginPopup(true); // Show login modal
        return;
      }
  
      const response = await fetch("https://final-quiz-server.onrender.com/identity/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 401) {
        setUser(null);
        localStorage.clear();
        setShowLoginPopup(true); // Show login modal
        return;
      }
  
      if (!response.ok) throw new Error("Failed to fetch categories");
  
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : data.result);
      setError(null);
    } catch (err) {
      console.error("Failed to load categories", err);
      setError(err.message);
      setUser(null);
      localStorage.clear();
      setShowLoginPopup(true); // Show login modal
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [setUser]);

  const handleStartQuiz = (categoryId) => {
    if (!user) {
      setShowLoginPopup(true);
    } else {
      startQuiz(categoryId);
    }
  };

  return (
    <div className="start-background">
      <section className="text-center" style={{ display: showStart ? "block" : "none" }}>
        <div className="container">
          <div className="row align-items-center justify-content-center paddi">
            <h1 className="fw-bold mb-4">Chọn chủ đề</h1>
            
            {error && (
              <div className="alert alert-danger">
                {error.includes("Unauthorized") ? "Vui lòng đăng nhập để tiếp tục." : error}
              </div>
            )}

            {loading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="category-card-container">
                {Array.isArray(categories) && categories.map((category) => (
                  <div
                    key={category.id}
                    className="level-card"
                    onClick={() => handleStartQuiz(category.id)}
                    style={{ backgroundColor: "#f5f5f5" }}
                  >
                    <h5 className="card-title fw-bold">{category.title}</h5>
                    <p className="card-text text-muted">{category.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showLoginPopup && (
          <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Yêu cầu đăng nhập</h5>
                  <button className="btn-close" onClick={() => setShowLoginPopup(false)}></button>
                </div>
                <div className="modal-body">
                  <Auth
                    setUser={(user) => {
                      setUser(user);
                      setShowLoginPopup(false);
                      fetchCategories(); // Reload categories after login
                    }}
                    closeModal={() => setShowLoginPopup(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Start;