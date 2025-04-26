import React, { useContext, useState, useEffect } from "react";
import DataContext from "../context/dataContext";
import Auth from "./Auth"; 
import "./Start.css";

const Start = ({ user, setUser }) => {
  const { startQuiz, showStart } = useContext(DataContext);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null); // To handle and display errors

  useEffect(() => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      console.warn("No token found, cannot fetch categories");
      return;
    }
  
    fetch("https://final-quiz-server.onrender.com/identity/categories", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          setError(null); // Reset error if fetch is successful
        } else {
          throw new Error("Categories should be an array");
        }
      })
      .catch((err) => {
        console.error("Failed to load categories", err);
        setError("Failed to load categories, please try again later.");
        setCategories([]); // To prevent rendering issues in case of an error
      });
  }, []);

  const handleStartQuiz = (categoryId) => {
    if (!user) {
      setShowLoginPopup(true);
    } else {
      startQuiz(categoryId); // Sending categoryId to start the quiz
    }
  };

  return (
    <div className="start-background">
      <section className="text-center" style={{ display: showStart ? "block" : "none" }}>
        <div className="container">
          <div className="row align-items-center justify-content-center paddi">
            <h1 className="fw-bold mb-4">Chọn chủ đề</h1>
            
            {/* Display error message if categories failed to load */}
            {error && <div className="alert alert-danger">{error}</div>}

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
          </div>
        </div>

        {/* Popup đăng nhập */}
        {showLoginPopup && (
          <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Yêu cầu đăng nhập</h5>
                  <button className="btn-close" onClick={() => setShowLoginPopup(false)}></button>
                </div>
                <div className="modal-body">
                  <Auth setUser={setUser} closeModal={() => setShowLoginPopup(false)} />
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
